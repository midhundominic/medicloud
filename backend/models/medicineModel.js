const mongoose = require('mongoose');

const medicineStockSchema = new mongoose.Schema({
  batchNumber: { type: String, required: true },
  quantity: { type: Number, required: true },
  expiryDate: { type: Date, required: true },
  purchaseDate: { type: Date, default: Date.now },
  type: { type: String, required: true }, // 'strip', 'bottle', 'unit'
  unitsPerPack: { type: Number, required: true } // tablets per strip or ml per bottle
});

const medicineSchema = new mongoose.Schema({
  name: { type: String, required: true },
  genericName: String,
  brandName: String,
  stockQuantity: {
    strips: [medicineStockSchema],
    bottles: [medicineStockSchema],
    units: [medicineStockSchema]
  },
  price: { 
    perStrip: Number,
    perBottle: Number,
    perUnit: Number
  },
  manufacturer: String,
  description: String,
  medicineType: { 
    type: String, 
    enum: ['tablet', 'syrup', 'injection', 'other'],
    required: true 
  },
  dosageForm: String,
  strength: String,
  rxnormId: String, // For API reference
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Calculate total stock before saving
medicineSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Medicine', medicineSchema);