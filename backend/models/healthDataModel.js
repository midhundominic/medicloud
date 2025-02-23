const mongoose = require('mongoose');

const HealthDataSchema = new mongoose.Schema({
  patientId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "patient", 
    required: true 
  },
  coordinatorId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "coordinator", 
    required: true 
  },
  fields: [
    {
      label: { type: String, required: true },  // Dynamic field label (e.g. 'Blood Pressure')
      value: { type: mongoose.Schema.Types.Mixed, required: true }, // Dynamic field value
      unit: { type: String }, // Optional unit (e.g. mmHg for blood pressure)
    }
  ],
  dateEntered: { 
    type: Date, 
    required: true, 
    default: Date.now 
  },
  patientComment: { type: String, default: "" } // Optional patient comment
});

const HealthData = mongoose.model("HealthData", HealthDataSchema);
module.exports = HealthData;
