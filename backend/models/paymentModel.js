const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: "patient", required: true },
  appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: "appointment", required: true },
  amount: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

const Payment = mongoose.model("Payment", PaymentSchema);

module.exports = Payment;