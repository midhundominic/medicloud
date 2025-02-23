const mongoose = require("mongoose");
const dayjs = require("dayjs");

const DoctorLeaveSchema = new mongoose.Schema({
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "doctor", required: true },
  startDate: { type: Date, required: true }, // Start date of leave
  endDate: { type: Date, required: true }, // End date of leave
  reason: { type: String },
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  requestDate: { type: Date, required: true, default: () => dayjs().toDate() },
});

const DoctorLeave = mongoose.model("doctorLeave", DoctorLeaveSchema);

module.exports = DoctorLeave;
