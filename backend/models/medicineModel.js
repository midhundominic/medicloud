const mongoose = require('mongoose');

const medicineStockSchema = new mongoose.Schema({
  batchNumber: { type: String, required: true },
  quantity: { type: Number, required: true, min: 0 },
  expiryDate: { type: Date, required: true },
  purchaseDate: { type: Date, default: Date.now },
  unitPrice: { type: Number, required: true, min: 0 }
});

const medicineSchema = new mongoose.Schema({
  name: { type: String, required: true },
  manufacturer: { type: String, default: 'Unknown' },
  medicineType: { 
    type: String, 
    enum: ['tablet', 'capsule', 'liquid', 'injection', 'other'],
    required: true 
  },
  description: String,
  stock: { type: [medicineStockSchema], default: [] },
  rxnormId: String, // For OpenFDA reference
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Calculate total stock before saving
medicineSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual for total stock quantity
medicineSchema.virtual('totalStock').get(function() {
  if (!this.stock || !Array.isArray(this.stock)) {
    return 0;
  }
  return this.stock.reduce((total, batch) => total + batch.quantity, 0);
});

// Add totalStock to JSON output
medicineSchema.set('toJSON', { virtuals: true });
medicineSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Medicine', medicineSchema);