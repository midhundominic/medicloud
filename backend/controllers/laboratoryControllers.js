const LaboratoryModel = require("../models/laboratoryModel");
const Prescription = require('../models/prescriptionModel');
const TestResult = require('../models/testResultModel');
const cloudinary = require('cloudinary').v2;


const registerLaboratory = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const PharmacistExist = await LaboratoryModel.findOne({ email });
    if (PharmacistExist) {
      return res.status(400).json({ message: "LaboratoryModel already Exists" });
    }

    const newPharmacist = new LaboratoryModel({
      name,
      email,
      password,
      role: 4,
    });

    await newPharmacist.save();

    res.status(201).json({ message: "LaboratoryModel registered successully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

const getAllLaboratory = async (req, res) => {
  try {
    const pharmacist = await LaboratoryModel.find({});
    res.status(201).json({ data: pharmacist });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};


const getPendingTests = async (req, res) => {
  try {

    // Fetch prescriptions with incomplete tests and populate necessary fields
    const prescriptions = await Prescription.find({ 'tests.isCompleted': false })
      .populate('patientId', 'name email phone address district city pincode')
      .populate('doctorId', 'firstName lastName')
      .populate('tests.resultId'); // Populate resultId field

    // Extract and map pending tests into a simpler array
    const pendingTests = prescriptions.flatMap(prescription =>
      prescription.tests
        .filter(test => !test.isCompleted) // Only select incomplete tests
        .map(test => ({
          prescriptionId: prescription._id,
          testName: test.testName,
          patientName: prescription.patientId?.name,
          patientEmail: prescription.patientId?.email,
          patientPhone: prescription.patientId?.phone,
          patientAddress: prescription.patientId?.address,
          patientDistrict: prescription.patientId?.district,
          patientCity: prescription.patientId?.city,
          patientPincode: prescription.patientId?.pincode,
          doctorName: `Dr. ${prescription.doctorId?.firstName} ${prescription.doctorId?.lastName}`,
          testResult: test.resultId, // Include the populated resultId for the test
          createdDate: prescription.createdAt
        }))
    );

    res.status(201).json(pendingTests);
  } catch (error) {
    console.error('Error fetching pending tests:', error);
    res.status(500).json({ message: error.message });
  }
};


const uploadTestResult = async (req, res) => {
  try {
    // Get user from token
    const userId = req.userId || req.user?.userId
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { prescriptionId, testName, remarks } = req.body;

    if (!prescriptionId || !testName) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Create new test result
    const testResult = new TestResult({
      prescriptionId: prescriptionId,
      testName: testName,
      resultFileUrl: req.file.path,
      remarks: remarks || '',
      uploadedBy: userId
    });

    // Save test result
    const savedResult = await testResult.save();

    // Update prescription test status
    const updatedPrescription = await Prescription.findOneAndUpdate(
      { 
        _id: prescriptionId,
        'tests.testName': testName
      },
      {
        $set: {
          'tests.$.isCompleted': true,
          'tests.$.resultId': savedResult._id
        }
      },
      { new: true }
    );

    if (!updatedPrescription) {
      await TestResult.findByIdAndDelete(savedResult._id);
      return res.status(404).json({ message: 'Prescription not found or test not found in prescription' });
    }

    res.status(201).json({ 
      message: 'Test result uploaded successfully',
      data: savedResult 
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      message: 'Error uploading test result', 
      error: error.message,
      details: error.errors
    });
  }
};

const updateTestResult = async (req, res) => {
  try {
      const { resultId } = req.params;
      const { remarks, userId } = req.body;
      const file = req.file;
      console.log("params",req.params);
      console.log("body",req.body);
   
      // Find existing test result
      const existingResult = await TestResult.findById(resultId);
      if (!existingResult) {
          return res.status(404).json({
              success: false,
              message: 'Test result not found'
          });
      }

      // Update object to store changes
      const updateData = {
          remarks: remarks || existingResult.remarks,
          updatedBy: userId,
          updatedAt: Date.now()
      };

      // If new file is uploaded, update the PDF URL
      if (file) {
          updateData.resultFileUrl = file.path; // Cloudinary URL is automatically stored in file.path
      }

      // Update the test result
      const updatedResult = await TestResult.findByIdAndUpdate(
          resultId,
          updateData,
          { new: true }
      );

      res.status(201).json({
          success: true,
          message: 'Test result updated successfully',
          data: updatedResult
      });
    } catch (error) {
      console.error('Update test result error:', error);
      res.status(500).json({
          success: false,
          message: error.message || 'Error updating test result'
      });
  }
};

const getCompletedTests = async (req, res) => {
  try {
    const completedTests = await TestResult.find()
      .populate({
        path: 'prescriptionId',
        populate: {
          path: 'patientId',
          select: 'name'
        }
      })
      .sort({ uploadDate: -1 });

    const formattedTests = completedTests.map(test => ({
      resultId: test._id,
      patientName: test.prescriptionId.patientId.name,
      testName: test.testName,
      uploadDate: test.uploadDate,
      remarks: test.remarks,
      resultFileUrl: test.resultFileUrl
    }));

    res.status(201).json(formattedTests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const downloadTestResult = async (req, res) => {
  try {
    const { resultId } = req.params;
    const testResult = await TestResult.findById(resultId);
    
    if (!testResult) {
      return res.status(404).json({ message: 'Test result not found' });
    }

    res.status(201).json({ fileUrl: testResult.resultFileUrl });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


module.exports = {
  registerLaboratory,
  getAllLaboratory,
  getPendingTests,
  uploadTestResult,
  getCompletedTests,
  downloadTestResult,
  updateTestResult

}