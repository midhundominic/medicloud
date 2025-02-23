const DoctorLeave = require('../models/doctorLeaveModel');
const DoctorModel = require('../models/doctorModel');
const CoordinatorModel = require('../models/coordinatorModel');
const PatientModel = require('../models/patientModel');
const AppointmentModel = require('../models/appointmentModel');
const PrescriptionModel = require('../models/prescriptionModel');
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "midhun12345";

const adminSignin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const ADMIN_EMAIL = "admin@ecare.com";
  const ADMIN_PASSWORD = "admin123";

  try {
    if (email !== ADMIN_EMAIL) {
      return res.status(401).json({ message: "Admin not found" });
    }

    if (ADMIN_PASSWORD !== password) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // Generate a token for the admin
    const token = jwt.sign(
      { email: ADMIN_EMAIL, role: 'admin' },
      JWT_SECRET,
      { expiresIn: "24h" } // Token expires in 24 hours
    );

    // Set up session for admin
    req.session.email = ADMIN_EMAIL;
    req.session.role = 'admin';

    return req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err);
        return res.status(500).json({ message: 'Session initialization failed' });
      }

      // Set HTTP-only cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      });

      return res.status(201).json({
        message: "Login Successful",
        data: {
          role: 0,
          name: "Admin",
          email: ADMIN_EMAIL
        },
        token: token,
      });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};




const toggleUserStatus = async (req, res) => {
  const { id, userType } = req.params;
  const { isDisabled } = req.body;

  console.log("id,userType",req.params);
  console.log("Disable",req.body);

  let Model;
  switch (userType) {
    case 'patient':
      Model = PatientModel;
      break;
    case 'doctor':
      Model = DoctorModel;
      break;
    case 'coordinator':
      Model = CoordinatorModel;
      break;
    default:
      return res.status(400).json({ message: 'Invalid user type' });
  }

  try {
    const user = await Model.findByIdAndUpdate(id, { isDisabled }, { new: true });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(201).json({ message: 'User status updated successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const editUserDetails = async (req, res) => {
  const { id, userType } = req.params;
  const updateData = req.body;

  let Model;
  switch (userType) {
    case 'patient':
      Model = PatientModel;
      break;
    case 'doctor':
      Model = DoctorModel;
      break;
    case 'coordinator':
      Model = CoordinatorModel;
      break;
    default:
      return res.status(400).json({ message: 'Invalid user type' });
  }

  try {
    const user = await Model.findByIdAndUpdate(id, updateData, { new: true });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(201).json({ message: 'User details updated successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};




const getLeaveRequests = async (req, res) => {
  try {
    const leaveRequests = await DoctorLeave.find().populate("doctorId");
    res.status(201).json({ leaveRequests });
  } catch (error) {
    res.status(500).json({ message: "Error fetching leave requests", error });
  }
};

const updateLeaveStatus = async (req, res) => {
  try {
    const { leaveId, status } = req.body;
    
    const leave = await DoctorLeave.findById(leaveId);
    if (!leave) {
      return res.status(404).json({ message: "Leave request not found" });
    }

    leave.status = status;
    await leave.save();

    res.status(201).json({ message: "Leave status updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error updating leave status", error });
  }
};


const getDashboardStats = async (req, res) => {
  try {
    const totalPatients = await PatientModel.countDocuments();
    const totalDoctors = await DoctorModel.countDocuments();
    const totalAppointments = await AppointmentModel.countDocuments();
    const totalPrescriptions = await PrescriptionModel.countDocuments();

    // Get appointments by status
    const appointmentsByStatus = await AppointmentModel.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    // Get appointments by department
    const appointmentsByDepartment = await AppointmentModel.aggregate([
      {
        $lookup: {
          from: "doctors",
          localField: "doctorId",
          foreignField: "_id",
          as: "doctor"
        }
      },
      { $unwind: "$doctor" },
      { $group: { _id: "$doctor.specialization", count: { $sum: 1 } } }
    ]);

    res.status(201).json({
      totalPatients,
      totalDoctors,
      totalAppointments,
      totalPrescriptions,
      appointmentsByStatus: appointmentsByStatus.map(item => ({
        name: item._id,
        value: item.count
      })),
      appointmentsByDepartment: appointmentsByDepartment.map(item => ({
        name: item._id,
        value: item.count
      }))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  adminSignin,
  toggleUserStatus,
  editUserDetails,
  getLeaveRequests,
  updateLeaveStatus,
  getDashboardStats,
};
