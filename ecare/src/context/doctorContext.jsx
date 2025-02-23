import React, { createContext, useContext, useState } from "react";

// Create the Doctor Context
export const DoctorContext = createContext();

// Create a provider component
export const DoctorProvider = ({ children }) => {
  const [doctor, setDoctor] = useState(null); // Initialize user state

  return (
    <DoctorContext.Provider value={{ doctor, setDoctor }}>
      {children}
    </DoctorContext.Provider>
  );
};

export const useDoctor = () => {
  const context = useContext(DoctorContext);
  if (!context) {
    throw new Error("useDoctor must be used within the DoctorProvider");
  }
  return context;
};
