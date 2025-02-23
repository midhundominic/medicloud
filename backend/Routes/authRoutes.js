const express = require("express");
const router = express.Router();
const patientControllers = require("../controllers/patientControllers");
const adminControllers = require("../controllers/adminController");
const doctorControllers = require("../controllers/doctorController");
const authControllers = require("../controllers/authControllers");
const coordinatoControllers = require("../controllers/coordinatorControllers");
const forgotPassword = require("../controllers/authforgotPassword");
const resetPassword = require("../controllers/resetPassword");
const profileCoordinator = require("../controllers/profileControllers/coordinatorControllers");
const authMiddleware = require("../middleware/auth");
const pdfUpload = require("../middleware/pdf-upload");
const upload = require("../middleware/upload");
const profilePatient = require("../controllers/profileControllers/patientControllers");
const profileDoctor = require ("../controllers/profileControllers/doctorControllers");
const appointmentControllers = require("../controllers/appointmentControllers");
const coordinatorHealthControllers = require("../controllers/coordinatorHealthControllers");
const reviewControllers = require('../controllers/reviewControllers');
const paymentControllers = require('../controllers/paymentControllers');
const medicineControllers = require('../controllers/medicineControllers');
const prescriptionControllers = require('../controllers/prescriptionController');
const medicineController = require('../controllers/medicineController');
const consultationControllers = require('../controllers/consultationControllers');
const laboratoryControllers = require('../controllers/laboratoryControllers');
const { testResultUpload } = require('../middleware/upload');
const chatControlers = require ("../controllers/chatControllers");
const labTestControllers = require("../controllers/labTestControllers");
const geminiControllers = require("../controllers/geminiControllers");
const biometricController = require("../controllers/biometricController");
const prescriptionRecognition = require('../controllers/prescriptionRecognition');
const { prescriptionUpload } = require('../middleware/upload');
const healthAssistantControllers = require('../controllers/healthAssistantControllers');

//patient

router.post("/patient-signup", patientControllers.signup);
router.post("/patient-signin", authControllers.signin);
router.post("/patientauthWithGoogle", patientControllers.authWithGoogle); 
router.post("/forgot-password",forgotPassword.forgotPassword);
router.post("/varifycode",resetPassword.verifyCode);
router.post("/reset-password",resetPassword.resetPassword);
router.get("/patients-view",patientControllers.getAllPatient);

//doctor

router.post("/doctor-registration", doctorControllers.registerDoctor);
router.post("/doctor-signin", authControllers.signin);
router.get("/doctors-view",doctorControllers.getAllDoctors);
router.get("/:doctorId/appointments",doctorControllers.getDoctorAppointments);
router.get("/doctor-appointments/:doctorId",authMiddleware,doctorControllers.getAppointmentsByDoctorId);
router.get('/doctors/:doctorId/dashboard-stats',doctorControllers.getDoctorDashboardStats);

//doctorid
router.get("/doctor/:id", doctorControllers.getDoctorById);


//admin
router.patch('/admin/toggle-status/:userType/:id', adminControllers.toggleUserStatus);
router.patch('/admin/edit-user/:userType/:id', adminControllers.editUserDetails);
router.get('/admin/dashboardstats', adminControllers.getDashboardStats);


router.post("/admin-signin", adminControllers.adminSignin);

//coordinator

router.post("/coordinator-registration", coordinatoControllers.registerCoordinator);
router.post("/coordinator-signin", authControllers.signin);
router.get("/coordinator-view",coordinatoControllers.getAllCoordinator);
router.get("/prescriptions/:prescriptionId",prescriptionControllers.getAppointmentDetails);


//profile Photo

router.post("/doctor-profile-photo",authMiddleware,upload.doctorProfileUpload,profileDoctor.uploadDoctorProfilePhoto);
router.post("/patient-profile-photo",authMiddleware,upload.patientProfileUpload,profilePatient.uploadPatientProfilePhoto);


//profile
router.get("/coordinator-profile",authMiddleware,profileCoordinator.getCoordinatorProfile);
router.get("/patient-profile", authMiddleware, profilePatient.getPatientProfile);
router.put("/patient-profile", authMiddleware, profilePatient.updatePatientProfile);
router.get("/doctor-profile",authMiddleware,profileDoctor.getDoctorProfile);
router.put("/doctor-profile",authMiddleware,profileDoctor.updateDoctorProfile);
router.put("/coordinator-update",profileCoordinator.updateCoordinatorProfile);

//delete
router.delete("/doctor/:id",doctorControllers.deleteDoctor);
router.delete("/patient/:id",patientControllers.deletePatientById);
router.delete("/coordinator/:id",coordinatoControllers.deleteCoordinator);

//appointments
router.post("/create-appointment",authMiddleware,appointmentControllers.createAppointment);
router.get("/availability",authMiddleware,appointmentControllers.getUnavailableTimeSlots);
router.get("/patient-appointments/:patientId",authMiddleware,appointmentControllers.getAppointmentsByPatientId);
router.put("/cancel-appointment/:appointmentId",authMiddleware,appointmentControllers.cancelAppointment);
router.put("/reschedule-appointment/:appointmentId",authMiddleware,appointmentControllers.rescheduleAppointment);

//Heath Data
// router.post("healthdata/add",coordinatoControllers.addHealthData);
// router.get("healthdata/patient/:patientId",coordinatoControllers.getPatientHealthRecords);
// router.put("healthdata/edit/:id",coordinatoControllers.editHealthData);
router.get('/healthdata-patients',coordinatorHealthControllers.getAllPatients);
router.post('/healthdata-records',coordinatorHealthControllers.addHealthRecord);
router.get('/healthdata-records/:patientId',coordinatorHealthControllers.getPatientRecords);
router.put('/healthdata-records/:id',coordinatorHealthControllers.updateHealthRecord);

//admin Appointments

router.get('/appointments', appointmentControllers.getAllAppointments);
router.put('/admin/cancel-appointment/:appointmentId', appointmentControllers.cancelAppointment);
router.put('/admin/reschedule-appointment/:appointmentId', appointmentControllers.rescheduleAppointment);
router.get("/appointments/unavailable-slots", appointmentControllers.getUnavailableTimeSlots);

//Leave
router.get("/leaves",adminControllers.getLeaveRequests);
router.post("/leaves/status",adminControllers.updateLeaveStatus);
router.post("/leaves/apply/:doctorId",doctorControllers.applyForLeave);
router.get("/leaves/:doctorId",doctorControllers.getLeaveRequests);
router.delete("/leaves/cancel/:leaveId", doctorControllers.cancelLeave);

//leave
router.get("/leaves/:doctorId",doctorControllers.getLeaveRequests);
router.delete("/leaves/cancel/:leaveId", doctorControllers.cancelLeave);


//appointments
router.get('/appointments/:appointmentId', appointmentControllers.getAppointmentDetails);
router.put('/appointments/:appointmentId/absent', appointmentControllers.markPatientAbsent);
router.put('/appointments/:appointmentId/start-consultation', appointmentControllers.startConsultation);
router.post('/appointments/:appointmentId/prescription', appointmentControllers.submitPrescription);
router.get('/patients/:patientId/records', appointmentControllers.getPatientRecords);
router.get('/care-coordinator/pending-tests', appointmentControllers.getPendingTests);
router.get('/care-coordinator/completed-tests', appointmentControllers.getCompletedTests);
router.put('/update-test-result/:appointmentId/:testId',appointmentControllers.updateTestResult)
router.put('/care-coordinator/test-results/:appointmentId/:testId', appointmentControllers.submitTestResults);
router.get('/completed/:patientId',appointmentControllers.getCompletedAppointments);

//review
router.post('/review/:appointmentId/:doctorId',authMiddleware,reviewControllers.submitReview);
router.get('/reviews/patient/:patientId',authMiddleware,reviewControllers.getSubmittedReviews);
router.get('/reviews/all',reviewControllers.getAllReviews);

//payment
router.post('/payment/order', paymentControllers.createOrder);
router.post('/payment/verify', paymentControllers.verifyPayment);
router.post('/payment/save', paymentControllers.savePaymentDetails);
router.get('/payment/user/:userId',paymentControllers.getPaymentsByUser);


//Precription

router.post('/prescriptions/create',authMiddleware,prescriptionControllers.createPrescription);
router.post(
    '/prescriptions/upload-test-result', 
    authMiddleware,
    pdfUpload.single('resultPDF'),
    prescriptionControllers.uploadTestResult
  );
router.get('/prescriptions/test-results/:id',prescriptionControllers.getPrescription);
router.get('/prescriptions/patient/:patientId',prescriptionControllers.getPatientPrescriptions);
router.get('/prescriptions/doctor/:patientId',prescriptionControllers.getPatientRecords);
router.get('/prescriptions/pendingtests',authMiddleware,prescriptionControllers.getPrescriptionsWithPendingTests);
router.put('/prescriptions/update/:appointmentId',authMiddleware,prescriptionControllers.updatePrescription);
router.get('/prescriptions/appointment/:appointmentId', prescriptionControllers.getPrescriptionByAppointment);

//medicine

router.get('/medicines/suggestions', medicineController.getMedicineSuggestions);
router.post('/medicines/add', medicineController.addMedicine);
router.get('/medicines/list', medicineController.getMedicinesList);
router.patch('/medicines/stock/:medicineId', medicineController.updateMedicineStock);
router.delete('/medicines/:medicineId', medicineController.deleteMedicine);
router.get('/medicines/:medicineId', medicineController.getMedicineDetails);
router.get('/medicines/:medicineId/stock', medicineController.getMedicineStock);
router.put('/medicines/:medicineId', medicineController.updateMedicine);




router.get('/doctor/patients/:doctorId', consultationControllers.getConsultedPatients);
router.get('/doctor/prescriptions/:patientId', consultationControllers.getPatientPrescriptions);


//laboratory
router.post('/pharmacist-registration',laboratoryControllers.registerLaboratory);
router.get('/laboratory-view',laboratoryControllers.getAllLaboratory);

router.get('/laboratory/pending-tests', laboratoryControllers.getPendingTests);
router.post('/laboratory/upload-result',authMiddleware,testResultUpload, laboratoryControllers.uploadTestResult);
router.put('/laboratory/results/:resultId', authMiddleware,testResultUpload,laboratoryControllers.updateTestResult);
router.get('/laboratory/completed-tests', laboratoryControllers.getCompletedTests);
router.get('/download-result/:resultId', laboratoryControllers.downloadTestResult);

//chatbot
router.post('/chat', authMiddleware, chatControlers.chatWithBot);
router.get('/chat/history', authMiddleware, chatControlers.getChatHistory);

//Gemini
router.post('/gemini/chat', authMiddleware, geminiControllers.chatWithGemini);
router.get('/gemini/chat/history', authMiddleware, geminiControllers.getChatHistory);

//Lab test
router.get('/laboratory/tests',labTestControllers.getAllTests);
router.post('/laboratory/tests',labTestControllers.createTest);
router.put('/laboratory/tests/:id',labTestControllers.updateTest);
router.delete('/laboratory/tests/:id',labTestControllers.deleteTest);

//Prescription Recognitio
router.post('/prescription/analyze',authMiddleware,prescriptionUpload,prescriptionRecognition.analyzePrescription)

//Biometric
// router.post('/biometric/register', authMiddleware,biometricController.generateRegistrationOptions);
// router.post('/biometric/verify-registration', authMiddleware,biometricController.verifyRegistration);
// router.post('/biometric/authenticate-biometric',biometricController.generateAuthenticationOptions);
// router.post('/biometric/verify-authentication',biometricController.verifyAuthentication);

//VHA
router.post('/health/analyze',healthAssistantControllers.analyzeHealth);
router.post('/health/chat',healthAssistantControllers.chatWithAI);


module.exports = router;
