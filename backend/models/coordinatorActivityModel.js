const mongoose = require("mongoose");

const CoordinatorActivitySchema = new mongoose.Schema({
  coordinatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "coordinator",
    required: true,
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "patient",
    required: true,
  },
  action: {
    type: String,
    enum: ["viewed", "updated", "added health data", "sent alert"],
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const CoordinatorActivity = mongoose.model("coordinatorActivity", CoordinatorActivitySchema);

module.exports = CoordinatorActivity;
