const DoctorModel = require("../models/doctorModel");
const AppointmentModel = require("../models/appointmentModel");
const DoctorLeave = require("../models/doctorLeaveModel");
const PrescriptionModel = require("../models/prescriptionModel");


const getConsultedPatients = async (req, res) => {
    try {
      const { doctorId } = req.params;
      
      // Find all appointments for this doctor
      const appointments = await AppointmentModel.find({ 
        doctorId,
        status: 'completed'
      }).populate('patientId');
  
      // Group patients and calculate their visit details
      const patientsMap = new Map();
      
      appointments.forEach(apt => {
        const patient = apt.patientId;
        if (!patientsMap.has(patient._id.toString())) {
          patientsMap.set(patient._id.toString(), {
            ...patient._doc,
            consultations: {
              totalVisits: 1,
              firstVisit: apt.appointmentDate,
              lastVisit: apt.appointmentDate
            }
          });
        } else {
          const existingPatient = patientsMap.get(patient._id.toString());
          existingPatient.consultations.totalVisits += 1;
          existingPatient.consultations.firstVisit = new Date(Math.min(
            new Date(existingPatient.consultations.firstVisit),
            new Date(apt.appointmentDate)
          ));
          existingPatient.consultations.lastVisit = new Date(Math.max(
            new Date(existingPatient.consultations.lastVisit),
            new Date(apt.appointmentDate)
          ));
        }
      });
  
      const patients = Array.from(patientsMap.values());
      
      res.status(201).json({
        success: true,
        data: patients
      });
    } catch (error) {
      console.error('Error fetching consulted patients:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching patients'
      });
    }
  };
  
  const getPatientPrescriptions = async (req, res) => {
    try {
      const { patientId } = req.params;
      
      const prescriptions = await PrescriptionModel.find({ patientId })
        .populate('medicines.medicine', 'name')
        .sort({ createdAt: -1 });
      
      res.status(201).json({
        success: true,
        data: prescriptions
      });
    } catch (error) {
      console.error('Error fetching patient prescriptions:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching prescriptions'
      });
    }
  };
  
  module.exports = {
    getConsultedPatients,
    getPatientPrescriptions
  };