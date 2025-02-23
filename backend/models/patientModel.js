const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const dayjs = require("dayjs");

const credentialSchema = new mongoose.Schema({
  credentialID: {
    type: String,
    required: true
  },
  publicKey: {
    type: Buffer,
    required: true
  },
  counter: {
    type: Number,
    default: 0
  },
  credentialDeviceType: String,
  credentialBackedUp: Boolean,
  transports: [String],
  fmt: String,
  aaguid: String
});

const PatientSchema = new mongoose.Schema({
  // Basic info
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: false },
  role: { type: Number, required: true },
  date_created: { type: Date, required: true, default: () => dayjs().toDate() },
  resetCode: { type: String, default: "" },
  resetCodeExpiration: { type: Date, default: Date.now },
  isDisabled: {
    type: Boolean,
    default: false,
  },

  dateOfBirth: { type: Date, required: false, default: "" },
  gender: { type: String, required: false, default: "" },
  weight: { type: String, required: false, default: "" },
  height: { type: String, required: false, default: "" },
  profilePhoto: { type: String, required: false }, // URL to the profile photo
  admissionNumber: {
    type: String,
    unique: true,
    sparse: true,
    required: false,
  }, // Unique admission number

  address: { type: String, default: ""},
  district: {type: String, default: ""},
  city: { type: String, default: ""},
  pincode: { type: String, default: ""},
  phone: {type: Number, default: ""},


  consultations: [{
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'doctor' },
    firstVisit: { type: Date, default: Date.now },
    lastVisit: { type: Date, default: Date.now },
    totalVisits: { type: Number, default: 1 }
  }],

  isProfileComplete: { type: Boolean, default: false },
  lastUpdated: { type: Date, default: Date.now },
  address: { type: String, required: false, default: "" },
  biometricCredentials: [credentialSchema]
});

// Pre-save hook to hash password before saving
PatientSchema.pre("save", async function (next) {
  try {
    if (!this.isModified("password")) return next();

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

const Patient = mongoose.model("patient", PatientSchema);

module.exports = Patient;
