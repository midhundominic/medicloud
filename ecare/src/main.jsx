import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { PatientProvider } from "./context/patientContext.jsx";
import { DoctorProvider } from "./context/doctorContext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <PatientProvider>
      <DoctorProvider>
        <App />
      </DoctorProvider>
    </PatientProvider>
  </React.StrictMode>
);
