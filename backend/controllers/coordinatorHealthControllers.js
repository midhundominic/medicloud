const HealthData = require('../models/healthDataModel');
const PatientModel = require('../models/patientModel');

// Get all patients
const getAllPatients = async (req, res) => {
  try {
    const patients = await PatientModel.find({}, 'name email'); // Get only name and email
    res.status(201).json(patients);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Add health record
const addHealthRecord = async (req, res) => {
  const { patientId, coordinatorId, fields } = req.body;
  console.log(req.body);

  try {
    const newRecord = new HealthData({
      patientId,
      coordinatorId,
      fields,
    });
    await newRecord.save();
    res.status(201).json(newRecord);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all health records for a patient
const getPatientRecords = async (req, res) => {
  try {
    const records = await HealthData.find({ patientId: req.params.patientId });
    res.status(201).json(records);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update health record
const updateHealthRecord = async (req, res) => {
  try {
    const updatedRecord = await HealthData.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(201).json(updatedRecord);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getAllPatients,
  addHealthRecord,
  getPatientRecords,
  updateHealthRecord,
};
