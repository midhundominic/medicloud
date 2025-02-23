const nodemailer = require("nodemailer");
const PatientModel = require("../models/patientModel");
const dotenv= require('dotenv');

dotenv.config();

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  // Check if email is provided
  if (!email) {
    return res.status(400).send({ error: true, msg: "Email is required" });
  }

  try {
    // Check if the user exists
    const user = await PatientModel.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .send({ error: true, msg: "Email id not registered" });
    }

    // Generate a random reset code
    const resetCode = Math.floor(1000 + Math.random() * 9000).toString();
    user.resetCode = resetCode;
    user.resetCodeExpiration = Date.now() + 3600000; // 1 hour expiration
    await user.save();

    // Send email with nodemailer
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL,
      to: user.email,
      subject: "Password Reset Code",
      text: `Your password reset code is ${resetCode}`, 
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
        return res
          .status(500)
          .send({ error: true, msg: "Error sending email" });
      } else {
        return res
          .status(201)
          .send({ error: false, msg: "Verification code sent to your email." });
      }
    });
  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).send({ error: true, msg: "Server error" });
  }
};


module.exports = { forgotPassword };
