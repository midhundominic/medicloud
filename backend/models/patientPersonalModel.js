const mongoose = require("mongoose");

const PatientPersonalInfoSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  dateOfBirth: {
    type: Date,
    required: false,
  },
  gender: {
    type: String,
    // enum: ["male", "female", "others"],
    required: false,
  },
  weight: {
    type: Number,
    required: false,
  },
  height: {
    type: Number,
    required: false,
  },
  profilePhoto: {
    type: String, // URL to the profile photo
  },
  admissionNumber: {
    type: String,
    unique: true, // Unique admission number for each patient
    sparse: true, // Initially empty
  },
  isProfileComplete: {
    type: Boolean,
    default: false, // Initially false, until the profile is completed
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
});

const PatientPersonalInfo = mongoose.model("patientPersonalInfo", PatientPersonalInfoSchema);

module.exports = PatientPersonalInfo;
