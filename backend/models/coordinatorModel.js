const mongoose = require("mongoose");
const dayjs = require("dayjs");

const CoordinatorSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  gender: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: Number, required: true },
  isDisabled: {
    type: Boolean,
    default: false,
  },
  date_created: { type: Date, required: true, default: () => dayjs().toDate() },
});

const Coordinator = mongoose.model("coordinator", CoordinatorSchema);

module.exports = Coordinator;
