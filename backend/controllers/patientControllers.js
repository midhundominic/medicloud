const PatientModel = require("../models/patientModel");
const PatientPersonaModel = require("../models/patientPersonalModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const admin = require("firebase-admin");
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"), // Properly format the private key
  }),
});

const signup = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // Check if the user already exists
    const existingUser = await PatientModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create a new user
    const newUser = new PatientModel({
      name,
      email,
      password, // Password will be hashed in the pre-save hook
      role: 1,
    });

    // Save the user
    await newUser.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser._id, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: "24h" } // Changed to 24h to match session duration
    );

    // Set up session
    req.session.userId = newUser._id;
    req.session.role = newUser.role;
    req.session.email = newUser.email;

    // Save session before sending response
    return req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err);
        return res.status(500).json({ 
          success: false, 
          message: 'Session initialization failed' 
        });
      }

      // Set HTTP-only cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      });

      return res.status(201).json({
        success: true,
        message: "User created successfully",
        data: {
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          userId: newUser._id
        },
        token: token,
      });
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false, 
      message: "Server error" 
    });
  }
};

// Also update authWithGoogle function to include session management
const authWithGoogle = async (req, res) => {
  const { tokenId } = req.body;

  try {
    const decodedToken = await admin.auth().verifyIdToken(tokenId);
    const { name, email } = decodedToken;

    let user = await PatientModel.findOne({ email });

    if (!user) {
      user = new PatientModel({
        name,
        email,
        password: "",
        role: 1,
      });

      await user.save();
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Set up session
    req.session.userId = user._id;
    req.session.role = user.role;
    req.session.email = user.email;

    return req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err);
        return res.status(500).json({ 
          success: false, 
          message: 'Session initialization failed' 
        });
      }

      // Set HTTP-only cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      });

      return res.status(201).json({
        success: true,
        message: "User login successful!",
        data: {
          email: user.email,
          name: user.name,
          role: user.role,
          userId: user._id,
        },
        token: token,
      });
    });

  } catch (error) {
    console.error("Error during Google Sign-In:", error);
    return res.status(500).json({ 
      success: false,
      message: "Invalid or expired Firebase token" 
    });
  }
};



const getAllPatient = async (req, res) => {
  try {
    const patients = await PatientModel.find(
      {},
      {
        _id: 1,
        name: 1,
        email: 1,
        role: 1,
        date_created: 1,
        dateOfBirth: 1,
        gender: 1,
        weight: 1,
        height: 1,
        admissionNumber: 1,
        isDisabled:1,
      }
    );

    res.status(201).json({ data: patients });
  } catch (error) {
    console.error("Error fetching patients:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

const deletePatientById = async (req, res) => {
  try {
    const { id } = req.params;

    // Find and delete the patient in the Patient schema
    const patient = await PatientModel.findByIdAndDelete(id);
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    // Delete the associated personal information using the patient's email
    // const personalInfo = await PatientPersonaModel.findOneAndDelete({
    //   email: patient.email,
    // });

    return res.status(201).json({
      message: "Patient deleted successfully",
      patient,
    });
  } catch (error) {
    console.error("Error deleting patient:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  signup,
  authWithGoogle,
  getAllPatient,
  deletePatientById,
};
