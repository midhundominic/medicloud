const Medicine = require('../models/medicineModel');
const { searchMedicine } = require('../services/medicineDatabase');

// Get medicine suggestions from API
exports.getMedicineSuggestions = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query || query.length < 3) {
      return res.status(200).json({ 
        success: true,
        suggestions: [] 
      });
    }

    const suggestions = await searchMedicine(query);
    
    // If no suggestions found, return empty array instead of error
    if (!suggestions || suggestions.length === 0) {
      return res.status(200).json({
        success: true,
        suggestions: []
      });
    }
    
    res.status(200).json({
      success: true,
      suggestions: suggestions.map(med => ({
        name: med.name,
        manufacturer: med.manufacturer || 'Unknown',
        rxnormId: med.rxnormId,
        details: med.details
      }))
    });
  } catch (error) {
    console.error('Error in getMedicineSuggestions:', error);
    // Return empty suggestions instead of error
    res.status(200).json({ 
      success: true,
      suggestions: []
    });
  }
};

exports.addMedicine = async (req, res) => {
  try {
    const {
      name,
      manufacturer,
      medicineType,
      description,
      rxnormId,
      batchNumber,
      quantity,
      expiryDate,
      unitPrice
    } = req.body;

    // Validate required fields
    if (!name || !medicineType || !batchNumber || !quantity || !expiryDate || !unitPrice) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields' 
      });
    }

    // Check if medicine already exists
    let medicine = await Medicine.findOne({ name: name });
    
    if (medicine) {
      // Initialize stock array if it doesn't exist
      if (!medicine.stock) {
        medicine.stock = [];
      }
      
      // Add new batch to existing medicine
      medicine.stock.push({
        batchNumber,
        quantity,
        expiryDate,
        unitPrice,
        purchaseDate: new Date()
      });
    } else {
      // Create new medicine
      medicine = new Medicine({
        name,
        manufacturer,
        medicineType,
        description,
        rxnormId,
        stock: [{
          batchNumber,
          quantity,
          expiryDate,
          unitPrice,
          purchaseDate: new Date()
        }]
      });
    }

    await medicine.save();
    res.status(201).json({
      success: true,
      data: medicine
    });
  } catch (error) {
    console.error('Error adding medicine:', error);
    res.status(400).json({ 
      success: false, 
      message: error.message 
    });
  }
};

exports.getMedicinesList = async (req, res) => {
  try {
    const medicines = await Medicine.find().select('name medicineType manufacturer stock');
    
    const formattedMedicines = medicines.map(med => {
      // Calculate total stock safely
      let totalStock = 0;
      if (med.stock && Array.isArray(med.stock)) {
        totalStock = med.stock.reduce((total, batch) => total + (batch.quantity || 0), 0);
      }
      
      return {
        _id: med._id,
        name: med.name,
        stockQuantity: totalStock,
        medicineType: med.medicineType,
        manufacturer: med.manufacturer
      };
    });
    
    res.status(200).json(formattedMedicines);
  } catch (error) {
    console.error('Error fetching medicines list:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

exports.updateMedicineStock = async (req, res) => {
  try {
    const { medicineId } = req.params;
    const { batchNumber, quantity, expiryDate, unitPrice } = req.body;

    // Validate required fields
    if (!batchNumber || !quantity || !expiryDate || !unitPrice) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields' 
      });
    }

    const medicine = await Medicine.findById(medicineId);
    if (!medicine) {
      return res.status(404).json({ 
        success: false, 
        message: 'Medicine not found' 
      });
    }

    // Initialize stock array if it doesn't exist
    if (!medicine.stock) {
      medicine.stock = [];
    }

    // Add new stock batch
    medicine.stock.push({
      batchNumber,
      quantity,
      expiryDate,
      unitPrice,
      purchaseDate: new Date()
    });

    // Remove expired stock
    const currentDate = new Date();
    medicine.stock = medicine.stock.filter(batch => 
      new Date(batch.expiryDate) > currentDate
    );

    await medicine.save();
    res.status(200).json({
      success: true,
      data: medicine
    });
  } catch (error) {
    console.error('Error updating medicine stock:', error);
    res.status(400).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Get medicine stock details
exports.getMedicineStock = async (req, res) => {
  try {
    const { medicineId } = req.params;
    const medicine = await Medicine.findById(medicineId);
    
    if (!medicine) {
      return res.status(404).json({ 
        success: false, 
        message: 'Medicine not found' 
      });
    }

    // Initialize stock array if it doesn't exist
    if (!medicine.stock) {
      medicine.stock = [];
    }

    // Calculate expiring stock (within 3 months)
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
    
    const expiringStock = medicine.stock
      .filter(batch => {
        const expiryDate = new Date(batch.expiryDate);
        return expiryDate <= threeMonthsFromNow;
      })
      .reduce((total, batch) => total + batch.quantity, 0);

    res.status(200).json({
      success: true,
      data: {
        totalStock: medicine.stock.reduce((total, batch) => total + batch.quantity, 0),
        expiringStock,
        stockDetails: medicine.stock.map(batch => ({
          batchNumber: batch.batchNumber,
          quantity: batch.quantity,
          expiryDate: batch.expiryDate,
          purchaseDate: batch.purchaseDate,
          unitPrice: batch.unitPrice
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching medicine stock:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
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

    // Initialize stock array if it doesn't exist
    if (!medicine.stock) {
      medicine.stock = [];
    }

    // Calculate total stock safely
    const totalStock = medicine.stock.reduce((total, batch) => total + batch.quantity, 0);

    return res.status(200).json({
      success: true,
      data: {
        _id: medicine._id,
        name: medicine.name,
        manufacturer: medicine.manufacturer,
        medicineType: medicine.medicineType,
        description: medicine.description,
        totalStock: totalStock,
        stock: medicine.stock,
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

exports.deleteMedicine = async (req, res) => {
  try {
    const { medicineId } = req.params;
    
    const medicine = await Medicine.findByIdAndDelete(medicineId);
    
    if (!medicine) {
      return res.status(404).json({ 
        success: false, 
        message: 'Medicine not found' 
      });
    }

    res.status(200).json({ 
      success: true, 
      message: 'Medicine deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting medicine:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

exports.updateMedicine = async (req, res) => {
  try {
    const { medicineId } = req.params;
    const { name, manufacturer, medicineType, description } = req.body;
    
    const medicine = await Medicine.findById(medicineId);
    
    if (!medicine) {
      return res.status(404).json({ 
        success: false, 
        message: 'Medicine not found' 
      });
    }

    // Update basic medicine details
    if (name) medicine.name = name;
    if (manufacturer) medicine.manufacturer = manufacturer;
    if (medicineType) medicine.medicineType = medicineType;
    if (description !== undefined) medicine.description = description;
    
    medicine.updatedAt = Date.now();
    
    await medicine.save();
    
    res.status(200).json({
      success: true,
      data: medicine
    });
  } catch (error) {
    console.error('Error updating medicine:', error);
    res.status(400).json({ 
      success: false, 
      message: error.message 
    });
  }
};