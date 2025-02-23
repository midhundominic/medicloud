const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const PatientModel = require("../models/patientModel");
const DoctorModel = require("../models/doctorModel");
const CoordinatorModel = require("../models/coordinatorModel");
const LaboratoryModel = require ("../models/laboratoryModel");

const JWT_SECRET = process.env.JWT_SECRET || "midhun12345";

const signin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // Check in Patient collection
    const patient = await PatientModel.findOne({ email });
    if (patient) {
      const isMatch = await bcrypt.compare(password, patient.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid password" });
      }
      if (patient.isDisabled) {
        return res.status(403).json({ message: "Your account is blocked. Please contact the administrator." });
      }

      const token = jwt.sign(
        { userId: patient._id, email: patient.email, role: patient.role },
        JWT_SECRET,
        { expiresIn: "24h" }
      );

      // Set up session
      req.session.userId = patient._id;
      req.session.role = patient.role;
      req.session.email = patient.email;

      return req.session.save((err) => {
        if (err) {
          console.error('Session save error:', err);
          return res.status(500).json({ message: 'Session initialization failed' });
        }

        // Set HTTP-only cookie
        res.cookie('token', token, {
          httpOnly: true,
          secure: true,
          sameSite: 'none',
          maxAge: 24 * 60 * 60 * 1000,
          domain: process.env.NODE_ENV === 'production' ? '.netlify.app' : 'localhost'
        });

        return res.status(201).json({
          message: "Login Successful",
          data: {
            email: patient.email,
            role: patient.role,
            name: patient.name,
            userId: patient._id,
          },
        });
      });
    }

    // Check in Doctor collection
    const doctor = await DoctorModel.findOne({ email });
    if (doctor) {
      if (doctor.password !== password) {
        return res.status(401).json({ message: "Invalid password" });
      }
      if (doctor.isDisabled) {
        return res.status(403).json({ message: "Your account is blocked. Please contact the administrator." });
      }

      const token = jwt.sign(
        { userId: doctor._id, email: doctor.email, role: doctor.role },
        JWT_SECRET,
        { expiresIn: "24h" }
      );

      // Set up session
      req.session.userId = doctor._id;
      req.session.role = doctor.role;
      req.session.email = doctor.email;

      return req.session.save((err) => {
        if (err) {
          console.error('Session save error:', err);
          return res.status(500).json({ message: 'Session initialization failed' });
        }

        // Set HTTP-only cookie
        res.cookie('token', token, {
          httpOnly: true,
          secure: true,
          sameSite: 'none',
          maxAge: 24 * 60 * 60 * 1000,
          domain: process.env.NODE_ENV === 'production' ? '.netlify.app' : 'localhost'
        });

        return res.status(201).json({
          message: "Login Successful",
          data: {
            email: doctor.email,
            role: doctor.role,
            firstName: doctor.firstName,
            lastName: doctor.lastName,
            doctorId: doctor._id,
          },
        });
      });
    }

    // Check in Coordinator collection
    const coordinator = await CoordinatorModel.findOne({ email });
    if (coordinator) {
      if (coordinator.password !== password) {
        return res.status(401).json({ message: "Invalid password" });
      }
      if (coordinator.isDisabled) {
        return res.status(403).json({ message: "Your account is blocked. Please contact the administrator." });
      }

      const token = jwt.sign(
        { userId: coordinator._id, email: coordinator.email, role: coordinator.role },
        JWT_SECRET,
        { expiresIn: "24h" }
      );

      // Set up session
      req.session.userId = coordinator._id;
      req.session.role = coordinator.role;
      req.session.email = coordinator.email;

      return req.session.save((err) => {
        if (err) {
          console.error('Session save error:', err);
          return res.status(500).json({ message: 'Session initialization failed' });
        }

        // Set HTTP-only cookie
        res.cookie('token', token, {
          httpOnly: true,
          secure: true,
          sameSite: 'none',
          maxAge: 24 * 60 * 60 * 1000,
          domain: process.env.NODE_ENV === 'production' ? '.netlify.app' : 'localhost'
        });

        return res.status(201).json({
          message: "Login Successful",
          data: {
            coordinatorId: coordinator._id,
            email: coordinator.email,
            role: coordinator.role,
            firstName: coordinator.firstName,
            lastName: coordinator.lastName,
          },
        });
      });
    }

    const laboratory = await LaboratoryModel.findOne({ email });
     if(laboratory){
      if (laboratory.password !== password) {
        return res.status(401).json({ message: "Invalid password" });
      }
      if (laboratory.isDisabled) {
        return res.status(403).json({ message: "Your account is blocked. Please contact the administrator." });
      }

      const token = jwt.sign(
        { userId: laboratory._id, email: laboratory.email, role: laboratory.role },
        JWT_SECRET,
        { expiresIn: "24h" }
      );

      // Set up session
      req.session.userId = laboratory._id;
      req.session.role = laboratory.role;
      req.session.email = laboratory.email;

      return req.session.save((err) => {
        if (err) {
          console.error('Session save error:', err);
          return res.status(500).json({ message: 'Session initialization failed' });
        }

        // Set HTTP-only cookie
        res.cookie('token', token, {
          httpOnly: true,
          secure: true,
          sameSite: 'none',
          maxAge: 24 * 60 * 60 * 1000,
          domain: process.env.NODE_ENV === 'production' ? '.netlify.app' : 'localhost'
        });

        return res.status(201).json({
          message: "Login Successful",
          data: {
            email: laboratory.email,
            role: laboratory.role,
            name: laboratory.name,
            userId: laboratory._id,
          },
        });
      });
    }

    // If no user found
    return res.status(404).json({ message: "User not found" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Add logout controller
const logout = async (req, res) => {
  try {
    // Clear session
    req.session.destroy((err) => {
      if (err) {
        console.error('Session destruction error:', err);
        return res.status(500).json({ 
          success: false,
          message: 'Logout failed' 
        });
      }

      // Clear HTTP-only cookie
      res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });
      
      return res.status(201).json({
        success: true,
        message: "Logged out successfully"
      });
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error during logout" 
    });
  }
};

module.exports = { signin, logout };
