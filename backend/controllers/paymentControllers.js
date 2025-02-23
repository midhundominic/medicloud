const Razorpay = require('razorpay');
const crypto = require('crypto');
const PaymentModel = require('../models/paymentModel'); // Import your Payment model
const dotenv= require('dotenv');

dotenv.config();

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

exports.createOrder = async (req, res) => {
    const { amount, currency } = req.body;
    console.log("Received order request:", { amount, currency });
    const options = {
      amount: amount,
      currency,
      receipt: crypto.randomBytes(10).toString('hex'),
    };
  
    try {
      const order = await razorpayInstance.orders.create(options);
      console.log("Created Razorpay order:", order);
      res.status(201).json({ orderId: order.id, amount: order.amount });
    } catch (error) {
      console.error("Error creating Razorpay order:", error);
      res.status(500).json({ error: 'Failed to create Razorpay order', details: error.message });
    }
  };

  exports.verifyPayment = async (req, res) => {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
    console.log("Received verification request:", { razorpayOrderId, razorpayPaymentId, razorpaySignature });
  
    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({ success: false, message: 'Missing required payment details' });
    }
  
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');
  
    if (generatedSignature === razorpaySignature) {
      console.log("Payment verified successfully");
      res.status(201).json({ success: true, message: 'Payment verified successfully' });
    } else {
      console.log("Payment verification failed");
      res.status(400).json({ success: false, message: 'Payment verification failed' });
    }
  };

  exports.savePaymentDetails = async (req, res) => {
    const { userId, appointmentId, amount } = req.body;
    console.log("Received payment details:", { userId, appointmentId, amount });
    console.log("appointmentId type:", typeof appointmentId);
    console.log("Received payment details:", req.body);
  
    if (!userId || !appointmentId || !amount) {
      return res.status(400).json({ message: "Missing required payment details" });
    }
  
    try {
      const paymentDetails = new PaymentModel({
        patient: userId,
        appointmentId,
        amount,
      });
  
      await paymentDetails.save();
      res.status(201).json({ message: "Payment details saved successfully", paymentDetails });
    } catch (error) {
      console.error("Error saving payment details:", error);
      res.status(500).json({ message: "Error saving payment details", error: error.message });
    }
  };

  exports.getPaymentsByUser = async (req, res) => {
    const userId = req.params.userId;
    try {
      const payments = await PaymentModel.find({ patient: userId })
        .populate('patient', 'name email')
        .populate({
          path: 'appointmentId',
          populate: {
            path: 'doctorId',
            select: 'firstName lastName specialization'
          }
        })
        .sort({ createdAt: -1 });
      
      res.status(201).json(payments);
    } catch (error) {
      res.status(500).json({ 
        message: "Error retrieving payment details", 
        error: error.message 
      });
    }
  };
  