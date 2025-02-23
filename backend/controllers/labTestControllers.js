const LabTest = require("../models/labTestModel");

const getAllTests = async (req, res) => {
  try {
    const tests = await LabTest.find({}).sort({ label: 1 });
    res.status(201).json({ data: tests });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

const createTest = async (req, res) => {
  const { label, amount } = req.body;

  if (!label || !amount) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const testExists = await LabTest.findOne({ label });
    if (testExists) {
      return res.status(400).json({ message: "Test already exists" });
    }

    const newTest = new LabTest({
      label,
      amount
    });

    await newTest.save();
    res.status(201).json({ message: "Test added successfully", data: newTest });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

const updateTest = async (req, res) => {
  const { id } = req.params;
  const { label, amount } = req.body;

  try {
    const test = await LabTest.findById(id);
    if (!test) {
      return res.status(404).json({ message: "Test not found" });
    }

    test.label = label;
    test.amount = amount;
    
    const updatedTest = await test.save();
    res.status(201).json({ message: "Test updated successfully", data: updatedTest });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

const deleteTest = async (req, res) => {
  const { id } = req.params;

  try {
    const test = await LabTest.findById(id);
    if (!test) {
      return res.status(404).json({ message: "Test not found" });
    }

    await LabTest.findByIdAndDelete(id);
    res.status(201).json({ message: "Test deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

module.exports = {
  getAllTests,
  createTest,
  updateTest,
  deleteTest
};