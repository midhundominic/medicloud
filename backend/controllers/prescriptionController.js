const Prescription = require('../models/prescriptionModel');
const TestResult = require('../models/testResultModel');
const Appointment = require('../models/appointmentModel');
const multer = require('multer');
const path = require('path');

// Configure multer for PDF storage
const storage = multer.diskStorage({
  destination: './uploads/testResults',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
}).single('resultPDF');

exports.createPrescription = async (req, res) => {
  try {
    const { appointmentId,doctorId, medicines, tests, notes } = req.body;

    // Validate required fields
    if (!appointmentId || !doctorId || !medicines) {
      return res.status(400).json({ 
        message: "Required fields missing",
        required: ['appointmentId', 'doctorId', 'medicines']
      });
    }

    // Get appointment details to get patient ID
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    const prescription = new Prescription({
      appointmentId,
      patientId: appointment.patientId,
      doctorId,
      medicines: medicines.map(med => ({
        medicine: med.medicine,
        frequency: med.frequency,
        days: med.days,
        isSOS: med.isSOS,
        beforeFood: med.beforeFood
      })),
      tests: tests || [],
      notes
    });

    await prescription.save();

    // Update appointment status
    await Appointment.findByIdAndUpdate(appointmentId, {
      status: "completed",
      prescription: {
        medicines: medicines.map(med => ({
          name: med.medicine,
          dosage: `${med.frequency} for ${med.days} days`
        })),
        tests: tests || [],
        notes
      }
    });

    res.status(201).json({
      success: true,
      message: "Prescription created successfully",
      data: prescription
    });
  } catch (error) {
    console.error("Prescription creation error:", error);
    res.status(400).json({ 
      success: false,
      message: error.message || "Error creating prescription",
      error: error
    });
  }
};

exports.updatePrescription = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { medicines, tests, notes } = req.body;

    // Find existing prescription
    const prescription = await Prescription.findOne({ appointmentId });
    if (!prescription) {
      return res.status(404).json({ message: "Prescription not found" });
    }

    prescription.medicines = medicines.map(med => ({
      medicine: med.medicine,
      frequency: med.frequency,
      days: parseInt(med.days),
      isSOS: med.isSOS || false,
      beforeFood: med.beforeFood || false
    }));

    // Handle tests updates while preserving completion status
    const existingTests = prescription.tests || [];
    prescription.tests = tests.map(test => {
      const existingTest = existingTests.find(et => et.testName === test.testName);
      return {
        testName: test.testName,
        isCompleted: existingTest ? existingTest.isCompleted : false,
        resultId: existingTest ? existingTest.resultId : null
      };
    });

    prescription.notes = notes;
    await prescription.save();

    // Update appointment prescription details
    await Appointment.findByIdAndUpdate(appointmentId, {
      prescription: {
        medicines: medicines.map(med => ({
          name: med.medicine,
          dosage: `${med.frequency} for ${med.days} days`
        })),
        tests: prescription.tests,
        notes: notes
      }
    });

    res.status(201).json({
      success: true,
      message: "Prescription updated successfully",
      data: prescription
    });
  } catch (error) {
    console.error("Prescription update error:", error);
    res.status(400).json({ 
      success: false,
      message: error.message || "Error updating prescription",
      error: error
    });
  }
};

exports.uploadTestResult = async (req, res) => {
  try {
    const { prescriptionId, testName, remarks } = req.body;
    const resultPDF = req.file;

    if (!resultPDF) {
      return res.status(400).json({ message: 'No PDF file uploaded' });
    }

    // Create test result record
    const testResult = new TestResult({
      testName,
      prescriptionId,
      patientId: req.user._id,
      resultPDF: resultPDF.filename,
      uploadedBy: req.user._id,
      remarks
    });

    await testResult.save();

    // Update prescription test status
    await Prescription.findOneAndUpdate(
      { 
        _id: prescriptionId,
        'tests.testName': testName 
      },
      {
        $set: {
          'tests.$.isCompleted': true,
          'tests.$.resultId': testResult._id
        }
      }
    );

    res.status(201).json({ message: 'Test result uploaded successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add these methods to the existing prescriptionController.js

exports.getPrescription = async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate('medicines.medicineId')
      .populate('doctorId', 'name specialization')
      .populate('patientId', 'name');
      
    if (!prescription) {
      return res.status(404).json({ message: "Prescription not found" });
    }
    res.status(201).json(prescription);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPatientPrescriptions = async (req, res) => {
  try {
    const { patientId } = req.params;
    
    if (!patientId) {
      return res.status(400).json({ 
        success: false,
        message: 'Patient ID is required' 
      });
    }

    const prescriptions = await Prescription.find({ patientId })
      .populate({
        path: 'medicines.medicine',
        select: 'name'
      })
      .populate({
        path: 'doctorId',
        select: 'firstName lastName specialization',
      })
      .populate({
        path: 'patientId',
        select: 'name dateOfBirth gender'
      })
      .populate('tests.resultId')
      .sort({ createdAt: -1 });

    if (!prescriptions) {
      return res.status(404).json({
        success: false,
        message: 'No prescriptions found'
      });
    }

    res.status(201).json({
      success: true,
      data: prescriptions
    });
  } catch (error) {
    console.error('Error fetching prescriptions:', error);
    res.status(500).json({ 
      success: false,
      message: error.message || 'Error fetching prescriptions'
    });
  }
};

// Assuming Prescription is a Mongoose model
exports.getPatientRecords = async (req, res) => {
  try {
    const { patientId } = req.params;
    const prescriptions = await Prescription.find({ patientId: req.params.patientId })
      .populate('medicines.medicine')
      .populate('doctorId', 'firstName lastName specialization')
      .populate('tests.resultId')
      .sort({ createdAt: -1 });

    // Format the prescriptions as appointments
    const formattedAppointments = prescriptions.map(prescription => ({
      _id: prescription._id,
      appointmentDate: prescription.createdAt,
      prescription: {
        medicines: prescription.medicines.map(med => ({
          medicine: {
            name: med.medicine?.name || 'Unknown Medicine',
          },
          frequency: med.frequency,
          days: med.days,
          beforeFood: med.beforeFood,
          isSOS: med.isSOS,
        })),
        tests: prescription.tests,
        notes: prescription.notes,
      },
    }));

    res.status(201).json({ appointments: formattedAppointments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getDoctorPrescriptions = async (req, res) => {
  try {
    const prescriptions = await Prescription.find({ doctorId: req.params.doctorId })
      .populate('medicines.medicineId')
      .populate('patientId', 'name')
      .sort({ createdAt: -1 });
    
    res.status(201).json(prescriptions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getTestResults = async (req, res) => {
  try {
    const testResults = await TestResult.find({ prescriptionId: req.params.prescriptionId })
      .populate('uploadedBy', 'name')
      .sort({ uploadDate: -1 });
    
    res.status(201).json(testResults);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//for coordinator
exports.getAppointmentDetails = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.appointmentId)
      .populate('patientId', 'name email dateOfBirth gender weight height profilePhoto')
      .populate('doctorId', 'firstName lastName specialization');

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    res.status(201).json(appointment);
  } catch (error) {
    console.error('Error fetching appointment details:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.getPrescriptionsWithPendingTests = async (req, res) => {
  try {
    const prescriptions = await Prescription.find({
      'tests': { $elemMatch: { isCompleted: false } }
    })
    .populate('patientId', 'name')
    .populate('doctorId', 'firstName lastName')
    .sort({ createdAt: -1 });

    const formattedPrescriptions = [];
    
    prescriptions.forEach(prescription => {
      const pendingTests = prescription.tests.filter(test => !test.isCompleted);
      
      pendingTests.forEach(test => {
        formattedPrescriptions.push({
          prescriptionId: prescription._id,
          patientName: prescription.patientId?.name || 'Unknown Patient',
          doctorName: `${prescription.doctorId?.firstName || ''} ${prescription.doctorId?.lastName || ''}`,
          testName: test.testName,
          createdDate: prescription.createdAt,
          isCompleted: test.isCompleted
        });
      });
    });

    res.status(201).json({
      success: true,
      data: formattedPrescriptions
    });
  } catch (error) {
    console.error('Error fetching pending tests:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching pending tests',
      error: error.message 
    });
  }
};

exports.getPrescriptionByAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const prescription = await Prescription.findOne({ appointmentId })
      .populate('medicines.medicine')
      .populate('doctorId', 'firstName lastName specialization')
      .populate('tests.resultId');

    if (!prescription) {
      return res.status(404).json({ 
        success: false,
        message: 'Prescription not found' 
      });
    }

    res.status(201).json({
      success: true,
      data: prescription
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message || 'Error fetching prescription'
    });
  }
};
