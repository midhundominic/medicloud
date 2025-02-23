const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'patient',
    required: true
  },
  message: {
    type: String,
    required: true
  },
  response: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['doctor_inquiry', 'laboratory', 'medicine', 'general'],
    default: 'general'
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Add indexes for better query performance
chatMessageSchema.index({ userId: 1, timestamp: -1 });
chatMessageSchema.index({ category: 1 });

module.exports = mongoose.model('ChatMessage', chatMessageSchema);