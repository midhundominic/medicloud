import React, { createContext, useContext, useState } from "react";

// Create the Patient Context
export const PatientContext = createContext();

// Create a provider component
export const PatientProvider = ({ children }) => {
  const [patient, setPatient] = useState(null); // Initialize user state

  return (
    <PatientContext.Provider value={{ patient, setPatient }}>
      {children}
    </PatientContext.Provider>
  );
};

export const usePatient = () => {
  const context = useContext(PatientContext);
  if (!context) {
    throw new Error("usePatient must be used within the PatientProvider");
  }
  return context;
};
