const mongoose = require('mongoose');

const faceAuthSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  faceData: {
    type: String, // Base64 encoded face descriptor
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastUsed: {
    type: Date
  }
});

module.exports = mongoose.model('FaceAuth', faceAuthSchema);