const mongoose = require('mongoose');

const testResultSchema = new mongoose.Schema({
  prescriptionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Prescription',
    required: true
  },
  testName: {
    type: String,
    required: true
  },
  resultFileUrl: {
    type: String,
    required: true
  },
  remarks: {
    type: String,
    default: ''
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Laboratory',
    required: true
  },
  uploadDate: {
    type: Date,
    default: Date.now
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

testResultSchema.pre('save', function(next) {
  this.lastUpdated = Date.now();
  next();
});

module.exports = mongoose.model('TestResult', testResultSchema);