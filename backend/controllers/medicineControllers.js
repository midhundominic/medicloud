const MedicineModel = require('../models/medicineModel');

const getMedicine = async (req, res) => {
    try {
      const medicine = await MedicineModel.find({});
      res.status(201).json({ data: medicine });
    } catch (error) {
      res.status(500).json({ message: "Server Error", error: error.message });
    }
  };

  module.exports = {getMedicine};