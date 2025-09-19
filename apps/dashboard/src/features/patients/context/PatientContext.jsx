import React, { createContext, useContext } from "react";

const PatientContext = createContext();

export const usePatientContext = () => {
  const context = useContext(PatientContext);
  if (!context) {
    throw new Error("usePatientContext must be used within a PatientProvider");
  }
  return context;
};

export const PatientProvider = ({ children }) => {
  const value = {
    // Context values will be added here when needed
  };

  return (
    <PatientContext.Provider value={value}>{children}</PatientContext.Provider>
  );
};

export default PatientContext;
