const mongoose = require("mongoose");

const PrescriptionPaymentSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: "patient", required: true },
  prescription: { type: mongoose.Schema.Types.ObjectId, ref: "Prescription", required: true },
  amount: { type: Number, required: true },
  isPaid: { type: Boolean, default: false },
  paymentDate: { type: Date },
  medicineDetails: [{
    medicine: { type: mongoose.Schema.Types.ObjectId, ref: "Medicine" },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true }
  }],
  testDetails: [{
    testName: { type: String, required: true },
    price: { type: Number, required: true }
  }],
  deliveryStatus: {
    type: String,
    enum: ['processing', 'shipped', 'delivered'],
    default: 'processing'
  },
  deliveredAt: {
    type: Date
  },
  createdAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

const PrescriptionPayment = mongoose.model("PrescriptionPayment", PrescriptionPaymentSchema);

module.exports = PrescriptionPayment; 