const nodemailer = require("nodemailer");
const PatientModel = require("../models/patientModel");
const dotenv= require('dotenv');

dotenv.config();

// Verify Code Controller
const verifyCode = async (req, res) => {
  const { email, code } = req.body;
  console.log("request for varification",req.body);

  // Check if email and code are provided
  if (!email || !code) {
    return res.status(400).send({ error: true, msg: "Email and code are required" });
  }

  try {
    // Find user by email, reset code, and check if code is not expired
    const user = await PatientModel.findOne({
      email,
      resetCode: code,
      resetCodeExpiration: { $gt: Date.now() }, // Check if the code is not expired
    });

    if (!user) {
      return res.status(400).send({ error: true, msg: "Invalid or expired code" });
    }

    res.status(201).send({ error: false, msg: "Code verified" });
  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).send({ error: true, msg: "Server error" });
  }
};

// Reset Password Controller
const resetPassword = async (req, res) => {
  const { email, password } = req.body;

  // Check if email and password are provided
  if (!email || !password) {
    return res.status(400).send({ error: true, msg: "Email and password are required" });
  }

  try {
    // Find user by email
    const user = await PatientModel.findOne({ email });
    if (!user) {
      return res.status(400).send({ error: true, msg: "Email not found" });
    }

    // Update password and clear reset code fields
    user.password = password; // Make sure to hash this password before saving
    user.resetCode = undefined;
    user.resetCodeExpiration = undefined;
    await user.save();

    res.status(201).send({ error: false, msg: "Password has been reset" });
  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).send({ error: true, msg: "Server error" });
  }
};

module.exports = { verifyCode, resetPassword };
