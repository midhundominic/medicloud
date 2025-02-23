import React from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";

import Login from "../component/Login";
import Signup from "../component/Signup";
import Main from "../component/Main";
import PatientHome from "../component/Patient/PatientHome";
import PatientAppointments from "../component/Patient/PatientAppointments";
import PatientProfile from "../component/Patient/PatientProfile";
import PatientRecords from "../component/Patient/PatientRecords";
import PatientPayments from "../component/Patient/Payments";
import PatientConsultation from "../component/Patient/Consultation";
import PatientCompletedAppointment from '../component/Patient/CompletedAppointments';
import Admin from "../component/Admin/Login";
import AdminHome from "../component/Admin/Home";
import AdminProile from "../component/Admin/AdminProile";
import AdminLeave from "../component/Admin/Leave";
import AdminReview from "../component/Admin/Review";
import DoctorProfile from "../component/Doctor/DoctorProfile";
import CoordinatorProfile from "../component/Coordinator/CoordinatorProfile";
import DoctorRegister from "../component/Admin/RegisterDoctor";
import { ROUTES, NON_AUTH_ROUTES } from "./routes";
import DoctorsList from "../component/Admin/DoctorsList";
import DoctorHome from "../component/Doctor/DoctorHome";
import DoctorLeave from "../component/Doctor/Leave";
import CoordinatorHome from "../component/Coordinator/CoordinatorHome";
import CoordinatorRegister from "../component/Admin/RegisterCoordinator";
import CoordinatorList from "../component/Admin/CoordinatorList";
import PatientList from "../component/Admin/PatientiList";
import ForgotPassword from "../component/ForgotPassword";
import VarifyCode from "../component/VarifyCode";
import ResetPassword from "../component/ResetPassword";
import ScheduledAppointment from "../component/Patient/ScheduledAppointment";
import ScheduledAppointments from "../component/Doctor/ScheduledAppointments";
import HealthRecords from "../component/Coordinator/HealthRecords";
import AdminAppointments from "../component/Admin/Appointments";
import DoctorPatientList from "../component/Doctor/PatientsList";

import PrescribeForm from "../component/Doctor/PrescribeForm";
import TestResults from "../component/Coordinator/TestResult";
import CompletedTests from "../component/Coordinator/CompletedTest";
import DoctorAppointments from "../component/Doctor/ScheduledAppointments";
import CoordinatorMedicine from "../component/Coordinator/Medicine";

import LaboratoryHome from "../component/Laboratory/LaboratoryHome";
import LaboratoryResult from "../component/Laboratory/LaboratoryResult";
import LaboratoryPending from "../component/Laboratory/LaboratoryPending";

import LaboratoryRegistration from "../component/Admin/RegisterLaboratory";
import LaboratoryList from "../component/Admin/LaboratoryList";
import LaboratoryProfile from '../component/Laboratory/LaboratoryProfile';

import ChatBot from "../component/ChatBot";
import VirtualHealthAssistant from "../component/Patient/Virtual Health Assistant";
import LabTestList from "../component/Admin/LaboratoryTest";

import GeminiChatbot from "../component/Patient/GeminiChatbot";
import PrescriptionAnalyzer from "../component/Patient/PrescriptionAnlayzer";
import DiseasePrediction from '../component/Patient/DiseaseDetection';


const Router = () => {
  const location = useLocation();
  const isAuthRoute = !NON_AUTH_ROUTES.includes(location.pathname);

  return (
    <div style={{ width: "100%", height: "100%" }}>
      {isAuthRoute ? (
        <Routes>
          <Route
            path={ROUTES.DEFAULT}
            element={<Navigate to={ROUTES.LOGIN} />}
          />
          <Route path={ROUTES.LOGIN} element={<Login />} />
          <Route path={ROUTES.SIGNUP} element={<Signup />} />
          <Route path={ROUTES.ADMIN} element={<Admin />} />
          <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPassword />} />
          <Route path={ROUTES.VARIFY_CODE} element={<VarifyCode />} />
          <Route path={ROUTES.RESET_PASSWORD} element={<ResetPassword />} />
        </Routes>
      ) : (
        <Main>  
          <Routes>
            <Route path={ROUTES.PATIENT_HOME} element={<PatientHome />} />
            <Route path={ROUTES.ADMIN_HOME} element={<AdminHome />} />
            <Route path={ROUTES.DOCTOR_HOME} element={<DoctorHome />} />
            <Route path={ROUTES.DOCTOR_LEAVE} element={<DoctorLeave />} />

            <Route path={ROUTES.ADMIN_LEAVE} element={<AdminLeave />} />

            <Route
              path={ROUTES.SCHEDULED_APPOINTMENT}
              element={<ScheduledAppointment />}
            />
            <Route
              path={ROUTES.SCHEDULED_APPOINTMENTS}
              element={<ScheduledAppointments />}
            />
            <Route path={ROUTES.PATIENT_RECORDS} element={<PatientRecords />} />
            <Route
              path={ROUTES.PATIENT_PAYMENTS}
              element={<PatientPayments />}
            />
            <Route
              path={ROUTES.PATIENT_CONSULTATION}
              element={<PatientConsultation />}
            />
            <Route
              path={ROUTES.ADMIN_APPOINTMENTS}
              element={<AdminAppointments />}
            />

            <Route path={ROUTES.DOCTOR_REGISTER} element={<DoctorRegister />} />

            <Route
              path={ROUTES.DOCTOR_PATIENTLIST}
              element={<DoctorPatientList />}
            />
            <Route
              path={ROUTES.COORDINATOR_REGISTER}
              element={<CoordinatorRegister />}
            />
            <Route
              path={ROUTES.COORDINATOR_HOME}
              element={<CoordinatorHome />}
            />
            <Route
              path={ROUTES.PATIENT_APPOINTMENT}
              element={<PatientAppointments />}
            />
            <Route path={ROUTES.PATIENT_PROFILE} element={<PatientProfile />} />
            <Route path={ROUTES.ADMIN_PROFILE} element={<AdminProile />} />
            <Route path={ROUTES.DOCTOR_PROFILE} element={<DoctorProfile />} />
            <Route
              path={ROUTES.COORDINATOR_PROFILE}
              element={<CoordinatorProfile />}
            />
            <Route path={ROUTES.HEALTH_RECORDS} element={<HealthRecords />} />
            <Route path={ROUTES.ADMIN_DOC_LIST} element={<DoctorsList />} />
            <Route
              path={ROUTES.ADMIN_COORDINATOR_LIST}
              element={<CoordinatorList />}
            />
            <Route path={ROUTES.ADMIN_PATIENT_LIST} element={<PatientList />} />
            <Route path={ROUTES.ADMIN_REVIEW} element={<AdminReview />} />

            <Route
              path="/doctor/appointments"
              element={<DoctorAppointments />}
            />
            <Route
              path={ROUTES.DOCTOR_PRESCRIPTION}
              element={<PrescribeForm />}
            />

            <Route path={ROUTES.COMPLETED_APPOINTMENT} element={<PatientCompletedAppointment/>}/>
  

            <Route path="/patient/records" element={<PatientRecords />} />
            <Route
              path={ROUTES.TEST_RESULTS}
              element={<TestResults />}
            />

            <Route path={ROUTES.COMPLETED_RESULT} element={<CompletedTests/>}/>
            <Route path={ROUTES.MEDICINE_LIST} element={<CoordinatorMedicine/>}/>

            <Route path = {ROUTES.LABORATORY_HOME} element={<LaboratoryHome/>}/>
            <Route path = {ROUTES.LABORATORY_RESULT} element={<LaboratoryResult/>}/>

            <Route path = {ROUTES.LABORATORY_REGISTRATION} element={<LaboratoryRegistration/>}/>
            <Route path = {ROUTES.LABORATORY_LIST} element={<LaboratoryList/>}/>
            <Route path ={ROUTES.LABORATORY_PROFILE} element={<LaboratoryProfile/>}/>
            <Route path ={ROUTES.LABORATORY_PENDING} element={<LaboratoryPending/>}/>
            <Route path ={ROUTES.CHATBOT} element={<ChatBot/>}/>
            <Route path ={ROUTES.VIRTUALHEALTHASSISTANT} element={<VirtualHealthAssistant/>}/>
            <Route path ={ROUTES.ADMIN_LABTEST_LIST} element={<LabTestList/>}/>
            <Route path ={ROUTES.GEMINI_CHATBOT} element={<GeminiChatbot/>}/>
            <Route path = {ROUTES.PRESCRIPTION_ANALYZER} element={<PrescriptionAnalyzer/>}/>
            <Route path = {ROUTES.DISEASE_PREDICTION} element={<DiseasePrediction/>}/>

          </Routes>
        </Main>
      )}
    </div>
  );
};

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const userData = JSON.parse(localStorage.getItem('userData'));

  if (!token || !userData) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default Router;
