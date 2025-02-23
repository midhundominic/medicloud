const mongoose = require("mongoose");
const dayjs = require("dayjs");

const AppointmentSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "patient",
    required: true,
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "doctor",
    required: true,
  },
  appointmentDate: {
    type: Date,
    required: true,
  },
  timeSlot: {
    type: String,
    enum: [
      "9:30 AM",
      "10:00 AM",
      "10:30 AM",
      "11:00 AM",
      "11:30 AM",
      "12:00 PM",
      "12:30 PM",
      "2:00 PM",
      "2:30 PM",
    ],
    required: true,
  },
  status: {
    type: String,
    enum: ["scheduled", "rescheduled", "canceled", "completed", "absent", "in_consultation"],
    default: "scheduled",
  },
  prescription: {
    medicines: [{
      name: String,
      dosage: String,
    }],
    tests: [{
      name: String,
      result: String,
    }],
    notes: String,
  },
  createdAt: { type: Date, default: () => dayjs().toDate() },
});

const Appointment = mongoose.model("appointment", AppointmentSchema);
module.exports = Appointment;
