const mongoose = require("mongoose");
const dayjs = require("dayjs");

const DoctorSchema = new mongoose.Schema({

  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  specialization: { type: String, required: true },
  y_experience: { type: String, required: true },
  password: { type: String, required: true },
  gender: { type: String, required: true },
  phone: { type: String, required: true },
  experience: { type: String, required: true },
  aboutDoctor: { type: String, required: true },
  isDisabled: { type: Boolean, default: false },
  date_created: { type: Date, default: () => dayjs().toDate()},
  role: { type: Number, required: true },
  profilePhoto: { type: String, default: "" },
  rating: { type: Number, default: 0 },
});

const Doctor = mongoose.model("doctor", DoctorSchema);

module.exports = Doctor;
