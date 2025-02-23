const CoordinatorModel = require("../models/coordinatorModel");
const HealthData = require("../models/healthDataModel");

const registerCoordinator = async (req, res) => {
  const { firstName, lastName, gender, email, phone, password } = req.body;

  if (!firstName || !lastName || !gender || !email || !phone || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const coordinatorExixts = await CoordinatorModel.findOne({ email });
    if (coordinatorExixts) {
      return res.status(400).json({ message: "Coordinator already Exists" });
    }

    const newCoordinator = new CoordinatorModel({
      firstName,
      lastName,
      gender,
      email,
      phone,
      password,
      role: 3,
    });

    await newCoordinator.save();

    res.status(201).json({ message: "Coordinator registered successully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

const getAllCoordinator = async (req, res) => {
  try {
    const coordinator = await CoordinatorModel.find({});
    res.status(201).json({ data: coordinator });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};


const deleteCoordinator = async (req, res) => {
  try {
    const coordinator = await CoordinatorModel.findByIdAndDelete(req.params.id);
    if (!coordinator) {
      return res.status(404).json({ message: "Coordinator not found" });
    }
    res.status(201).json({ message: "Coordinator deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const addHealthData = async (req, res) => {
  const { patientId, coordinatorId, doctorId, bloodPressure, bloodSugar, cholesterol, heartRate, medication, observation } = req.body;

  if (!patientId || !coordinatorId || !bloodPressure || !bloodSugar) {
    return res.status(400).json({ message: "Required fields are missing" });
  }

  try {
    const newHealthData = new HealthData({
      patientId,
      coordinatorId,
      doctorId,
      bloodPressure,
      bloodSugar,
      cholesterol,
      heartRate,
      medication,
      observation,
    });

    await newHealthData.save();
    res.status(201).json({ message: "Health data added successfully", data: newHealthData });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Get all health records for a specific patient
const getPatientHealthRecords = async (req, res) => {
  try {
    const records = await HealthData.find({ patientId: req.params.patientId }).populate("coordinatorId doctorId", "firstName lastName");
    res.status(201).json(records);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Edit health data by coordinator
const editHealthData = async (req, res) => {
  try {
    const updatedData = await HealthData.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(201).json({ message: "Health data updated successfully", data: updatedData });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

module.exports = {
  registerCoordinator,
  getAllCoordinator,
  deleteCoordinator,
  addHealthData,
  getPatientHealthRecords,
  editHealthData,
};
