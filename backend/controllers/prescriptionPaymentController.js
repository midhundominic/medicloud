const Razorpay = require('razorpay');
const crypto = require('crypto');
const PrescriptionPayment = require('../models/prescriptionPaymentModel');
const Prescription = require('../models/prescriptionModel');
const Medicine = require('../models/medicineModel');
const LabTest = require('../models/labTestModel');
const dotenv = require('dotenv');

dotenv.config();

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Helper function to calculate medicine quantity based on frequency and days
const calculateMedicineQuantity = (frequency, days) => {
  const frequencyMap = {
    'OD': 1,    // Once a day
    'BD': 2,    // Twice a day
    'TID': 3,   // Three times a day
    'QID': 4,   // Four times a day
    'Q6H': 4,   // Every 6 hours (4 times a day)
    'Q4H': 6,   // Every 4 hours (6 times a day)
    'Q8H': 3,   // Every 8 hours (3 times a day)
    'STAT': 1,  // Immediately (once)
    'PRN': 1,   // As needed (assuming minimum once)
    'HS': 1     // At bedtime (once a day)
  };

  // Default to once a day if frequency not recognized
  const timesPerDay = frequencyMap[frequency] || 1;
  return timesPerDay * days;
};

// Create prescription payment
exports.createPrescriptionPayment = async (req, res) => {
  try {
    const { prescriptionId, patientId } = req.body;

    if (!prescriptionId || !patientId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields' 
      });
    }

    // Check if payment already exists
    const existingPayment = await PrescriptionPayment.findOne({ 
      prescription: prescriptionId,
      patient: patientId
    });

    if (existingPayment && existingPayment.isPaid) {
      return res.status(200).json({
        success: true,
        message: 'Payment already completed',
        data: existingPayment
      });
    }

    // Get prescription details
    const prescription = await Prescription.findById(prescriptionId)
      .populate('medicines.medicine')
      .populate('tests.testName');

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found'
      });
    }

    // Calculate medicine costs and check stock
    let totalMedicineCost = 0;
    const medicineDetails = [];
    const insufficientStockMedicines = [];

    for (const med of prescription.medicines) {
      // Get medicine details
      const medicine = await Medicine.findById(med.medicine);
      
      if (!medicine) {
        return res.status(404).json({
          success: false,
          message: `Medicine with ID ${med.medicine} not found`
        });
      }

      // Calculate required quantity
      const requiredQuantity = calculateMedicineQuantity(med.frequency, med.days);
      
      // Check if medicine has stock array and calculate total stock
      let totalStock = 0;
      if (medicine.stock && Array.isArray(medicine.stock)) {
        totalStock = medicine.stock.reduce((total, batch) => total + batch.quantity, 0);
      }
      
      // Check if stock is sufficient
      if (totalStock < requiredQuantity) {
        insufficientStockMedicines.push({
          name: medicine.name,
          required: requiredQuantity,
          available: totalStock
        });
      }

      // Calculate medicine cost (using average unit price from stock)
      let averageUnitPrice = 0;
      if (medicine.stock && medicine.stock.length > 0) {
        const totalPrice = medicine.stock.reduce((sum, batch) => sum + (batch.unitPrice * batch.quantity), 0);
        const totalQuantity = medicine.stock.reduce((sum, batch) => sum + batch.quantity, 0);
        averageUnitPrice = totalPrice / totalQuantity;
      }

      const medicineCost = averageUnitPrice * requiredQuantity;
      totalMedicineCost += medicineCost;

      medicineDetails.push({
        medicine: medicine._id,
        quantity: requiredQuantity,
        price: medicineCost
      });
    }

    // Calculate test costs
    let totalTestCost = 0;
    const testDetails = [];

    for (const test of prescription.tests) {
      // Get test details
      const labTest = await LabTest.findOne({ label: test.testName });
      
      if (labTest) {
        totalTestCost += labTest.amount;
        testDetails.push({
          testName: test.testName,
          price: labTest.amount
        });
      } else {
        // Default price if test not found
        totalTestCost += 500; // Default price
        testDetails.push({
          testName: test.testName,
          price: 500
        });
      }
    }

    // Check if there are medicines with insufficient stock
    if (insufficientStockMedicines.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient stock for some medicines',
        insufficientStock: insufficientStockMedicines
      });
    }

    // Calculate total amount
    const totalAmount = totalMedicineCost + totalTestCost;

    // Create or update payment record
    let payment;
    if (existingPayment) {
      existingPayment.amount = totalAmount;
      existingPayment.medicineDetails = medicineDetails;
      existingPayment.testDetails = testDetails;
      payment = await existingPayment.save();
    } else {
      payment = await PrescriptionPayment.create({
        patient: patientId,
        prescription: prescriptionId,
        amount: totalAmount,
        medicineDetails,
        testDetails
      });
    }

    // Create Razorpay order
    const options = {
      amount: Math.round(totalAmount * 100), // Convert to paise
      currency: 'INR',
      receipt: crypto.randomBytes(10).toString('hex'),
    };

    const order = await razorpayInstance.orders.create(options);

    res.status(201).json({
      success: true,
      data: {
        paymentId: payment._id,
        orderId: order.id,
        amount: order.amount / 100, // Convert back to rupees for display
        medicines: medicineDetails,
        tests: testDetails
      }
    });
  } catch (error) {
    console.error('Error creating prescription payment:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating prescription payment',
      error: error.message
    });
  }
};

// Verify payment and update medicine stock
exports.verifyPrescriptionPayment = async (req, res) => {
  try {
    const { 
      razorpayOrderId, 
      razorpayPaymentId, 
      razorpaySignature,
      prescriptionPaymentId 
    } = req.body;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature || !prescriptionPaymentId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required payment details' 
      });
    }

    // Verify payment signature
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    if (generatedSignature !== razorpaySignature) {
      return res.status(400).json({ 
        success: false, 
        message: 'Payment verification failed' 
      });
    }

    // Get payment details
    const payment = await PrescriptionPayment.findById(prescriptionPaymentId);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment record not found'
      });
    }

    // Update payment status
    payment.isPaid = true;
    payment.paymentDate = new Date();
    await payment.save();

    // Update medicine stock
    for (const item of payment.medicineDetails) {
      await updateMedicineStock(item.medicine, item.quantity);
    }

    // Update prescription status
    await Prescription.findByIdAndUpdate(payment.prescription, {
      isPaid: true,
      paymentDate: new Date()
    });

    res.status(200).json({
      success: true,
      message: 'Payment verified and stock updated successfully'
    });
  } catch (error) {
    console.error('Error verifying prescription payment:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying payment',
      error: error.message
    });
  }
};

// Helper function to update medicine stock
async function updateMedicineStock(medicineId, quantityToReduce) {
  const medicine = await Medicine.findById(medicineId);
  
  if (!medicine || !medicine.stock || !Array.isArray(medicine.stock)) {
    throw new Error(`Medicine with ID ${medicineId} not found or has no stock`);
  }

  let remainingToReduce = quantityToReduce;
  
  // Sort stock by expiry date (oldest first)
  medicine.stock.sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));
  
  // Reduce stock from batches
  for (let i = 0; i < medicine.stock.length; i++) {
    if (remainingToReduce <= 0) break;
    
    const batch = medicine.stock[i];
    const reduceFromBatch = Math.min(batch.quantity, remainingToReduce);
    
    batch.quantity -= reduceFromBatch;
    remainingToReduce -= reduceFromBatch;
  }
  
  // Remove empty batches
  medicine.stock = medicine.stock.filter(batch => batch.quantity > 0);
  
  await medicine.save();
  return medicine;
}

// Get payment status for a prescription
exports.getPrescriptionPaymentStatus = async (req, res) => {
  try {
    const { prescriptionId } = req.params;
    
    const payment = await PrescriptionPayment.findOne({ 
      prescription: prescriptionId 
    });
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found for this prescription'
      });
    }
    
    
    res.status(200).json({
      success: true,
      data: {
        isPaid: payment.isPaid,
        paymentDate: payment.paymentDate,
        amount: payment.amount,
        deliveryStatus: payment.deliveryStatus,
        deliveredAt: payment.deliveredAt
      }
    });
  } catch (error) {
    console.error('Error getting prescription payment status:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting prescription payment status',
      error: error.message
    });
  }
};

// Get all payments for a patient
exports.getPatientPrescriptionPayments = async (req, res) => {
  try {
    const { patientId } = req.params;
    
    const payments = await PrescriptionPayment.find({ patient: patientId })
      .populate({
        path: 'prescription',
        populate: { path: 'doctorId', select: 'firstName lastName' }
      })
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      data: payments
    });
  } catch (error) {
    console.error('Error getting patient prescription payments:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting patient payments',
      error: error.message
    });
  }
};

// Update delivery status of a prescription payment
exports.updateDeliveryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // Validate input
    if (!id || !status) {
      return res.status(400).json({
        success: false,
        message: 'Prescription payment ID and status are required'
      });
    }
    
    // Validate status value
    const validStatuses = ['processing', 'shipped', 'delivered'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be one of: processing, shipped, delivered'
      });
    }
    
    // Find the payment record
    const payment = await PrescriptionPayment.findById(id);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Prescription payment not found'
      });
    }
    
    // Check if payment is paid
    if (!payment.isPaid) {
      return res.status(400).json({
        success: false,
        message: 'Cannot update delivery status for unpaid prescription'
      });
    }
    
    // Update delivery status
    payment.deliveryStatus = status;
    
    // If status is delivered, set deliveredAt timestamp
    if (status === 'delivered') {
      payment.deliveredAt = new Date();
    }
    
    await payment.save();
    
    res.status(200).json({
      success: true,
      message: `Delivery status updated to ${status}`,
      data: {
        _id: payment._id,
        deliveryStatus: payment.deliveryStatus,
        deliveredAt: payment.deliveredAt
      }
    });
  } catch (error) {
    console.error('Error updating delivery status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating delivery status',
      error: error.message
    });
  }
};

// Get all prescription payments (for coordinator/pharmacy)
exports.getAllPrescriptionPayments = async (req, res) => {
  try {
    const payments = await PrescriptionPayment.find({ isPaid: true })
      .populate('patient', 'name email phone address city district pincode')
      .populate({
        path: 'prescription',
        populate: [
          { path: 'medicines.medicine', select: 'name' },
          { path: 'doctorId', select: 'firstName lastName specialization' },
          { path: 'patientId', select: 'name email phone address city district pincode' }
        ]
      })
      .sort({ paymentDate: -1 });
    
    res.status(200).json({
      success: true,
      data: payments
    });
  } catch (error) {
    console.error('Error getting prescription payments:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting prescription payments',
      error: error.message
    });
  }
}; 