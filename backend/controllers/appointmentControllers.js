const AppointmentModel = require("../models/appointmentModel");
const PatientModel = require("../models/patientModel");
const DoctorModel = require("../models/doctorModel");
const DoctorLeave = require("../models/doctorLeaveModel");
const { sendEmail } = require("../services/emailservice");
const { TIME_SLOTS } = require('../utils/constant')

const createAppointment = async (req, res) => {
  const { patientId, doctorId, appointmentDate, timeSlot } = req.body;

  console.log("From fronend",req.body);

  if (!patientId || !doctorId || !appointmentDate || !timeSlot) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // Check if the doctor is on leave during the selected appointment date
    const doctorLeave = await DoctorLeave.findOne({
      doctorId,
      startDate: { $lte: new Date(appointmentDate) }, // Corrected field names
      endDate: { $gte: new Date(appointmentDate) },
      status: "approved",
    });

    if (doctorLeave) {
      return res
        .status(400)
        .json({ message: "Doctor is on leave on the selected date" });
    }

    // Ensure the appointment is in the future
    const now = new Date();
    const selectedDate = new Date(appointmentDate);
    const [startTime, endTime] = timeSlot.split(" - ");

    const selectedStartTime = new Date(`${appointmentDate} ${startTime}`);
    const selectedEndTime = new Date(`${appointmentDate} ${endTime}`);

    if (
      selectedDate.toDateString() === now.toDateString() &&
      selectedStartTime <= now
    ) {
      return res.status(400).json({
        message: "You cannot book an appointment for a past time slot.",
      });
    }

    // Check if the time slot is already booked
    const existingAppointment = await AppointmentModel.findOne({
      doctorId,
      appointmentDate: new Date(appointmentDate),
      timeSlot,
      status: { $ne: "canceled" },
    });

    if (existingAppointment) {
      return res.status(400).json({ message: "Time slot already booked" });
    }

    // Create the appointment
    const newAppointment = new AppointmentModel({
      patientId,
      doctorId,
      appointmentDate,
      timeSlot,
    });

    await newAppointment.save();
    return res.status(201).json(newAppointment);
  } catch (error) {
    console.error("Error creating appointment:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Similarly update `getUnavailableTimeSlots` and other controllers
const getUnavailableTimeSlots = async (req, res) => {
  const { doctorId, date } = req.query;

  if (!doctorId || !date) {
    return res.status(400).json({ message: "Doctor ID and date are required" });
  }

  try {
    // Check if the doctor is on leave during the given date
    const leaveOnDate = await DoctorLeave.findOne({
      doctorId,
      startDate: { $lte: new Date(date) },
      endDate: { $gte: new Date(date) },
      status: "approved",
    });

    if (leaveOnDate) {
      return res.status(201).json({
        message: "Doctor is on approved leave on this date.",
        unavailable: true,
        unavailableSlots: TIME_SLOTS, // All time slots are unavailable when the doctor is on leave
      });
    }

    // Fetch unavailable slots from appointments
    const appointments = await AppointmentModel.find({
      doctorId,
      appointmentDate: new Date(date),
      status: { $ne: "canceled" },
    });

    const unavailableSlots = appointments.map(
      (appointment) => appointment.timeSlot
    );

    res.status(201).json({ unavailableSlots });
  } catch (error) {
    console.error("Error fetching unavailable time slots:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getAppointmentsByPatientId = async (req, res) => {
  const { patientId } = req.params;

  try {
    const appointments = await AppointmentModel.find({
      patientId,
      status: { $ne: "completed" }, // Exclude appointments with status "completed"
    }).populate("doctorId", "firstName lastName specialization");

    // Get approved leave dates for doctors with the patient's appointments
    const leaveDates = await DoctorLeave.find({
      doctorId: { $in: appointments.map((app) => app.doctorId) },
      status: "approved", // Ensure only approved leaves are considered
    });

    const leaveAppointmentIds = appointments
      .filter((appointment) =>
        leaveDates.some(
          (leave) =>
            leave.doctorId.toString() === appointment.doctorId._id.toString() &&
            new Date(leave.startDate) <=
              new Date(appointment.appointmentDate) &&
            new Date(leave.endDate) >= new Date(appointment.appointmentDate)
        )
      )
      .map((appointment) => appointment._id);

    res.status(201).json({ appointments, leaveAppointmentIds });
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Cancel an appointment
const cancelAppointment = async (req, res) => {
  const { appointmentId } = req.params;
  console.log(req.params);

  try {
    const appointment = await AppointmentModel.findByIdAndUpdate(
      appointmentId,
      {status: 'canceled'},
      { new: true});
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    const patient = await PatientModel.findById(appointment.patientId);
    const doctor = await DoctorModel.findById(appointment.doctorId);
    const message = `Dear ${patient.name}, your appointment scheduled to the Dr. ${doctor.firstName} ${doctor.lastName} for ${appointment.appointmentDate} at ${appointment.timeSlot} has been canceled`;
    sendEmail(patient.email, "Appointment Canceled", message);

    res.status(201).json({ message: "Appointment canceled successfully" ,appointment});
  } catch (error) {
    console.error("Error canceling appointment:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Reschedule an appointment
const rescheduleAppointment = async (req, res) => {
  const { appointmentId } = req.params;
  const { appointmentDate, timeSlot } = req.body;

  try {
    const appointment = await AppointmentModel.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Check if doctor is on leave on the selected date
    const doctorLeave = await DoctorLeave.findOne({
      doctorId: appointment.doctorId,
      startDate: { $lte: new Date(appointmentDate) },
      endDate: { $gte: new Date(appointmentDate) },
      status: "approved",
    });

    if (doctorLeave) {
      return res
        .status(400)
        .json({ message: "Doctor is on leave on the selected date" });
    }

    // Check if the new time slot is available
    const existingAppointment = await AppointmentModel.findOne({
      doctorId: appointment.doctorId,
      appointmentDate,
      timeSlot,
      status: { $ne: "canceled" },
    });

    if (existingAppointment) {
      return res.status(400).json({ message: "Time slot already booked" });
    }

    // Update appointment details
    appointment.appointmentDate = appointmentDate;
    appointment.timeSlot = timeSlot;
    appointment.status = "rescheduled";
    await appointment.save();

    const patient = await PatientModel.findById(appointment.patientId);
    const doctor = await DoctorModel.findById(appointment.doctorId);
    const message = `Dear ${patient.name}, your appointment with Dr. ${doctor.firstName} ${doctor.lastName} has been rescheduled to ${appointmentDate} at ${timeSlot}.`;
    sendEmail(patient.email, "Appointment Rescheduled", message);

    res.status(201).json({ message: "Appointment rescheduled successfully" });
  } catch (error) {
    console.error("Error rescheduling appointment:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getAllAppointments = async (req, res) => {
  try {
    const appointments = await AppointmentModel.find({})
      .populate("patientId", "name email")
      .populate("doctorId", "firstName lastName specialization");
    res.status(201).json({ appointments });
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const markPatientAbsent = async(req,res) =>{
  const { appointmentId } =req.params;
  try {
    const appointment = await AppointmentModel.findByIdAndUpdate(
      appointmentId,
      { status: 'absent' },
      { new: true }
    );
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }
    res.status(201).json({ message: "Patient marked as absent", appointment });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const startConsultation = async (req, res) => {
  const { appointmentId } = req.params;
  try {
    const appointment = await AppointmentModel.findByIdAndUpdate(
      appointmentId,
      { status: 'in_consultation' },
      { new: true }
    );
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }
    res.status(201).json({ message: "Consultation started", appointment });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const submitPrescription = async (req, res) => {
  const { appointmentId } = req.params;
  const { medicines, tests, notes } = req.body;

  try {
    const appointment = await AppointmentModel.findByIdAndUpdate(
      appointmentId,
      {
        prescription: {
          medicines,
          tests: tests.map(test => ({ name: test, result: '' })),
          notes
        },
        status: "completed"
      },
      { new: true }
    );

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    res.status(201).json(appointment);
  } catch (error) {
    console.error("Error submitting prescription:", error);
    res.status(500).json({ message: "Error submitting prescription" });
  }
};

const getPatientRecords = async (req, res) => {
  const { patientId } = req.params;
  try {
    const records = await AppointmentModel.find({ patientId, status: 'completed' })
      .populate('doctorId', 'firstName lastName')
      .select('appointmentDate prescription doctorId');
    res.status(201).json(records);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const getPendingTests = async (req, res) => {
  try {
    const pendingTests = await AppointmentModel.find({
      'prescription.tests': { $elemMatch: { result: '' } }
    })
    .populate('patientId', 'name')
    .populate('doctorId', 'firstName lastName')
    .select('patientId doctorId appointmentDate prescription.tests');
    res.status(201).json(pendingTests);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const getCompletedTests = async (req, res) => {
  try {
    const completedTests = await AppointmentModel.find({
      'prescription.tests': { $not: { $elemMatch: { result: '' } } }
    })
    .populate('patientId', 'name')
    .populate('doctorId', 'firstName lastName')
    .select('patientId doctorId appointmentDate prescription.tests');
    res.status(201).json(completedTests);
  } catch (error) {
    console.error("Error fetching completed tests:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const submitTestResults = async (req, res) => {
  const { appointmentId, testId } = req.params;

  try {
    const appointment = await AppointmentModel.findOneAndUpdate(
      { _id: appointmentId, 'prescription.tests._id': testId },
      { $set: { 'prescription.tests.$.result': result } },
      { new: true }
    );
    if (!appointment) {
      return res.status(404).json({ message: "Test not found" });
    }
    res.status(201).json({ message: "Test result submitted", appointment });
  } catch (error) {
    console.error("Error submitting test result:", error);
    res.status(500).json({ message: "Server error" });
  }
};


const updateTestResult = async (req, res) => {
  const { appointmentId, testId } = req.params;
  const { result } = req.body;

  try {
    const appointment = await AppointmentModel.findOneAndUpdate(
      { _id: appointmentId, 'prescription.tests._id': testId },
      { $set: { 'prescription.tests.$.result': result } },
      { new: true }
    );

    if (!appointment) {
      return res.status(404).json({ message: "Appointment or test not found" });
    }

    res.status(201).json({ message: "Test result updated successfully", appointment });
  } catch (error) {
    console.error("Error updating test result:", error);
    res.status(500).json({ message: "Server error" });
  }
};


const getAppointmentDetails = async (req, res) => {
  const { appointmentId } = req.params;

  try {
    const appointment = await AppointmentModel.findById(appointmentId)
      .populate("patientId", "") 
      .populate("doctorId", "firstName lastName");
    
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    res.status(201).json(appointment);
  } catch (error) {
    console.error("Error fetching appointment details:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getCompletedAppointments = async(req,res)=>{
  try {
    const { patientId } = req.params;
    const appointments = await AppointmentModel.find({ patientId, status: "completed" }).populate("doctorId"); 
    res.status(201).json({ appointments });
  } catch (error) {
    res.status(500).json({ message: "Error fetching completed appointments" });
  }
};

const submitReview = async(req,res) =>{
  try {
    const { appointmentId, doctorId } = req.params;
    const { rating, review } = req.body;

    const appointment = await AppointmentModel.findByIdAndUpdate(appointmentId, { rating, review }, { new: true });

    // Update doctor's rating
    const doctor = await DoctorModel.findById(doctorId);
    const appointmentsWithRating = await AppointmentModel.find({ doctorId, rating: { $exists: true } });
    const averageRating = appointmentsWithRating.reduce((acc, curr) => acc + curr.rating, 0) / appointmentsWithRating.length;

    doctor.rating = averageRating;
    await doctor.save();

    res.status(201).json({ message: "Review submitted successfully", appointment });
  } catch (error) {
    res.status(500).json({ message: "Error submitting review" });
  }
};

module.exports = {
  createAppointment,
  getUnavailableTimeSlots,
  getAppointmentsByPatientId,
  cancelAppointment,
  rescheduleAppointment,
  getAllAppointments,
  markPatientAbsent,
  startConsultation,
  submitPrescription,
  getPatientRecords,
  getPendingTests,
  getCompletedTests,
  submitTestResults,
  updateTestResult,
  getAppointmentDetails,
  getCompletedAppointments,
  submitReview,
};
