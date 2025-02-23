const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema({
  appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: "appointment", required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "doctor", required: true },
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: "patient", required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  review: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  isSubmitted: {type:Boolean , default: false}
});

const Review = mongoose.model("Review", ReviewSchema);

module.exports = Review;