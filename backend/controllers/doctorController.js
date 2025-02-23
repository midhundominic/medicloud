const DoctorModel = require("../models/doctorModel");
const Appointment = require("../models/appointmentModel");
const DoctorLeave = require("../models/doctorLeaveModel");
const PrescriptionModel = require("../models/prescriptionModel");
const mongoose = require('mongoose');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { mergeDateAndTime } = require("../utils/helper");

const registerDoctor = async (req, res) => {
  const {
    firstName,
    lastName,
    experience,
    gender,
    email,
    phone,
    specialization,
    y_experience,
    password,
    aboutDoctor,
  } = req.body;

  if (
    !firstName ||
    !lastName ||
    !experience ||
    !gender ||
    !email ||
    !phone ||
    !specialization ||
    !y_experience ||
    !password ||
    !aboutDoctor
  ) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const doctorExixts = await DoctorModel.findOne({ email });
    if (doctorExixts) {
      return res.status(400).json({ message: "Doctor already Exists" });
    }

    const newDoctor = new DoctorModel({
      firstName,
      lastName,
      experience,
      gender,
      email,
      phone,
      specialization,
      y_experience,
      password,
      aboutDoctor,
      role: 2,
    });

    await newDoctor.save();

    res.status(201).json({ message: "Doctor registered successully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

const getAllDoctors = async (req, res) => {
  try {
    const doctor = await DoctorModel.find({});
    res.status(201).json({ data: doctor });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

const getDoctorById = async (req, res) => {
  try {
    const doctor = await DoctorModel.findById(req.params.id); // Fetch doctor by ID
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }
    res.status(201).json(doctor);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const deleteDoctor = async (req, res) => {
  try {
    const doctor = await DoctorModel.findByIdAndDelete(req.params.id);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }
    res.status(201).json({ message: "Doctor deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getDoctorAppointments = async (req, res) => {
  try {
    const doctorId = req.params.doctorId;

    // Fetch appointments based on doctorId
    const appointments = await Appointment.find({ doctor: doctorId })
      .populate("patient") // Optional: Populate patient details
      .populate("doctor"); // Optional: Populate doctor details

    res.status(201).json({
      success: true,
      data: appointments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching appointments",
    });
  }
};

const getAppointmentsByDoctorId = async (req, res) => {
  const { doctorId } = req.params;

  try {
    const appointments = await Appointment.find({ doctorId }).populate(
      "patientId",
      ""  // An empty string means all fields in the `Patient` schema will be included
    );

    const modifiedList = appointments.map((data) => {
      const mergedDate = mergeDateAndTime(data.appointmentDate, data.timeSlot);
      return {
        ...data._doc,
        appointmentDate: mergedDate,
        patientDetails: data.patientId, // Include populated patient details
      };
    });

    res.status(201).json({ appointments: modifiedList });
  } catch (error) {
    console.error("Error fetching doctor appointments:", error);
    res.status(500).json({ message: "Server error" });
  }
};


//Leave
const applyForLeave = async (req, res) => {
  try {
    const { startDate, endDate, reason } = req.body;
    const { doctorId } = req.params;

    // Check if leave already exists in the given date range
    const leaveExists = await DoctorLeave.findOne({
      doctorId,
      $or: [{ startDate: { $lte: endDate }, endDate: { $gte: startDate } }],
    });

    if (leaveExists) {
      return res
        .status(400)
        .json({ message: "Leave already applied for these dates" });
    }

    const newLeave = new DoctorLeave({ doctorId, startDate, endDate, reason });
    await newLeave.save();

    res.status(201).json({ message: "Leave request submitted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error applying for leave", error });
  }
};

const getLeaveRequests = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const leaveRequests = await DoctorLeave.find({ doctorId });
    res.status(201).json({ leaveRequests });
  } catch (error) {
    res.status(500).json({ message: "Error fetching leave requests", error });
  }
};

const cancelLeave = async (req, res) => {
  try {
    const { leaveId } = req.params;
    const leave = await DoctorLeave.findById(leaveId);

    if (!leave) {
      return res.status(404).json({ message: "Leave request not found" });
    }

    await DoctorLeave.deleteOne({ _id: leaveId });
    res.status(201).json({ message: "Leave request canceled successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error canceling leave request", error });
  }
};

const getDoctorDashboardStats = async (req, res) => {
  try {
    const doctorId = new mongoose.Types.ObjectId(req.params.doctorId);

    // Get total counts
    const totalPatients = await Appointment.distinct('patientId', { doctorId }).length;
    const totalAppointments = await Appointment.countDocuments({ doctorId });
    const totalPrescriptions = await PrescriptionModel.countDocuments({ doctorId });

    // Get appointments by status
    const appointmentsByStatus = await Appointment.aggregate([
      { $match: { doctorId: doctorId } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
      { $project: { name: "$_id", value: "$count", _id: 0 } }
    ]);

    // Get upcoming appointments
    const upcomingAppointments = await Appointment.find({
      doctorId,
      appointmentDate: { $gte: new Date() },
      status: 'scheduled'
    })
    .populate('patientId', 'name')
    .sort({ appointmentDate: 1 })
    .limit(5);

    res.status(201).json({
      totalPatients,
      totalAppointments,
      totalPrescriptions,
      appointmentsByStatus,
      upcomingAppointments
    });

  } catch (error) {
    console.error('Error getting doctor dashboard stats:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerDoctor,
  getAllDoctors,
  getDoctorById,
  deleteDoctor,
  getDoctorAppointments,
  getAppointmentsByDoctorId,
  applyForLeave,
  getLeaveRequests,
  cancelLeave,
  getDoctorDashboardStats,
};
