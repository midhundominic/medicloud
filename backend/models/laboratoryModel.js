const mongoose = require("mongoose");
const dayjs = require("dayjs");

const LaboratorySchema = new mongoose.Schema({
  
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: Number, required: true },
  isDisabled: {
    type: Boolean,
    default: false,
  },
  date_created: { type: Date, required: true, default: () => dayjs().toDate() },
});

const Laboratory = mongoose.model("laboratory", LaboratorySchema);

module.exports = Laboratory;
