const Medicine = require('../models/medicineModel');
const { searchMedicine } = require('../services/medicineDatabase');

// Get medicine suggestions from API
exports.getMedicineSuggestions = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query || query.length < 3) {
      return res.status(201).json({ 
        success: true,
        suggestions: [] 
      });
    }

    const suggestions = await searchMedicine(query);
    
    // If no suggestions found, return empty array instead of error
    if (!suggestions || suggestions.length === 0) {
      return res.status(201).json({
        success: true,
        suggestions: []
      });
    }
    
    res.status(201).json({
      success: true,
      suggestions: suggestions.map(med => ({
        name: med.name,
        genericName: med.genericName,
        brandName: med.brandName,
        dosageForm: med.dosageForm,
        strength: med.strength,
        rxnormId: med.rxnormId,
        details: med.details
      }))
    });
  } catch (error) {
    console.error('Error in getMedicineSuggestions:', error);
    // Return empty suggestions instead of error
    res.status(201).json({ 
      success: true,
      suggestions: []
    });
  }
};

exports.addMedicine = async (req, res) => {
  try {
    const {
      name,
      medicineType,
      stock,
      price,
      manufacturer,
      description,
      rxnormId,
      genericName,
      brandName,
      dosageForm,
      strength
    } = req.body;

    const medicine = new Medicine({
      name,
      medicineType,
      manufacturer,
      description,
      rxnormId,
      genericName,
      brandName,
      dosageForm,
      strength,
      price: {
        perStrip: medicineType === 'tablet' ? price : undefined,
        perBottle: medicineType === 'syrup' ? price : undefined,
        perUnit: medicineType === 'other' ? price : undefined
      },
      stockQuantity: {
        strips: medicineType === 'tablet' ? [stock] : [],
        bottles: medicineType === 'syrup' ? [stock] : [],
        units: medicineType === 'other' ? [stock] : []
      }
    });

    await medicine.save();
    res.status(201).json(medicine);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getMedicinesList = async (req, res) => {
  try {
    const medicines = await Medicine.find().select('name stockQuantity price');
    res.status(201).json(medicines);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateMedicineStock = async (req, res) => {
  try {
    const { medicineId } = req.params;
    const { stock } = req.body;

    const medicine = await Medicine.findById(medicineId);
    if (!medicine) {
      return res.status(404).json({ message: 'Medicine not found' });
    }

    // Add new stock batch
    const stockArray = medicine.stockQuantity[
      medicine.medicineType === 'tablet' ? 'strips' :
      medicine.medicineType === 'syrup' ? 'bottles' : 'units'
    ];

    stockArray.push(stock);

    // Remove expired stock
    const currentDate = new Date();
    stockArray = stockArray.filter(batch => 
      new Date(batch.expiryDate) > currentDate
    );

    await medicine.save();
    res.status(201).json(medicine);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get total stock with expiry information
exports.getMedicineStock = async (req, res) => {
  try {
    const { medicineId } = req.params;
    const medicine = await Medicine.findById(medicineId);
    
    if (!medicine) {
      return res.status(404).json({ message: 'Medicine not found' });
    }

    const stockArray = medicine.stockQuantity[
      medicine.medicineType === 'tablet' ? 'strips' :
      medicine.medicineType === 'syrup' ? 'bottles' : 'units'
    ];

    const totalStock = stockArray.reduce((total, batch) => total + batch.quantity, 0);
    const expiringStock = stockArray
      .filter(batch => {
        const expiryDate = new Date(batch.expiryDate);
        const threeMonthsFromNow = new Date();
        threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
        return expiryDate <= threeMonthsFromNow;
      })
      .reduce((total, batch) => total + batch.quantity, 0);

    res.status(201).json({
      totalStock,
      expiringStock,
      stockDetails: stockArray
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteMedicine = async (req, res) => {
  try {
    const { medicineId } = req.params;
    
    const medicine = await Medicine.findByIdAndDelete(medicineId);
    
    if (!medicine) {
      return res.status(404).json({ message: 'Medicine not found' });
    }

    res.status(201).json({ message: 'Medicine deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get medicine details by ID
exports.getMedicineDetails = async (req, res) => {
  try {
    const { medicineId } = req.params;
    
    if (!medicineId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Medicine ID is required' 
      });
    }

    const medicine = await Medicine.findById(medicineId);
    
    if (!medicine) {
      return res.status(404).json({ 
        success: false, 
        message: 'Medicine not found' 
      });
    }

    return res.status(201).json({
      success: true,
      data: {
        _id: medicine._id,
        name: medicine.name,
        genericName: medicine.genericName,
        brandName: medicine.brandName,
        medicineType: medicine.medicineType,
        manufacturer: medicine.manufacturer,
        description: medicine.description,
        dosageForm: medicine.dosageForm,
        strength: medicine.strength,
        price: medicine.price,
        stockQuantity: medicine.stockQuantity,
        rxnormId: medicine.rxnormId
      }
    });

  } catch (error) {
    console.error('Error fetching medicine details:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Error fetching medicine details',
      error: error.message 
    });
  }
};

exports.updateMedicine = async (req, res) => {
  try {
    const { medicineId } = req.params;
    const updateData = req.body;
    
    const medicine = await Medicine.findByIdAndUpdate(
      medicineId,
      updateData,
      { new: true }
    );
    
    if (!medicine) {
      return res.status(404).json({ message: 'Medicine not found' });
    }

    res.status(201).json(medicine);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};