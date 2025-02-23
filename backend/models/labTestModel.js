const mongoose = require('mongoose');

const labTestSchema = new mongoose.Schema({
  label: {
    type: String,
    required: true,
    unique: true
  },
  amount: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Labtest', labTestSchema);