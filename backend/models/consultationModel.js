const mongoose = require('mongoose');

const consultationSchema = new mongoose.Schema({
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'appointment',
    required: true
  },
  channelName: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['waiting', 'ongoing', 'completed'],
    default: 'waiting'
  },
  startTime: Date,
  endTime: Date
});

module.exports = mongoose.model('Consultation', consultationSchema);