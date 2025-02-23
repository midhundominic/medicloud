const mongoose = require('mongoose');

const prescribedMedicineSchema = new mongoose.Schema({
  medicine: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Medicine',
    required: true 
  },
  frequency: { 
    type: String, 
    required: true 
  },
  days: { 
    type: Number, 
    required: true 
  },
  isSOS: { 
    type: Boolean, 
    default: false 
  },
  beforeFood: { 
    type: Boolean, 
    default: false 
  }
});

const prescriptionSchema = new mongoose.Schema({
  appointmentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'appointment', 
    required: true 
  },
  patientId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'patient', 
    required: true 
  },
  doctorId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'doctor', 
    required: true 
  },
  medicines: [prescribedMedicineSchema],
  tests: [{
    testName: { type: String },
    isCompleted: { type: Boolean, default: false },
    resultId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'TestResult'
    }
  }],
  notes: String,
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('Prescription', prescriptionSchema);