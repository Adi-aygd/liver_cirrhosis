import React, { createContext, useContext, useState } from 'react';

const initialDoctors = [
  {
    id: 1,
    name: 'Dr. Priya Sharma',
    hospital: 'City Hospital',
    rating: 4.8,
    timing: '10:00 AM - 2:00 PM',
    status: 'Available',
    username: 'priya',
    password: 'password',
    age: '40',
    gender: 'Female',
    contact: '9999999999',
  },
  {
    id: 2,
    name: 'Dr. Rajesh Kumar',
    hospital: 'Metro Clinic',
    rating: 4.6,
    timing: '2:00 PM - 6:00 PM',
    status: 'Available',
    username: 'rajesh',
    password: 'password',
    age: '45',
    gender: 'Male',
    contact: '8888888888',
  },
];

const initialPatients = [
  {
    id: 1,
    name: 'Aditya Verma',
    username: 'aditya_v',
    age: 35,
    gender: 'Male',
    contact: '9876543210',
    prescriptions: [],
  },
];

const AppContext = createContext();

export function AppProvider({ children }) {
  const [doctors, setDoctors] = useState(initialDoctors);
  const [labAssistants, setLabAssistants] = useState([]);
  const [patients, setPatients] = useState(initialPatients);
  const [appointments, setAppointments] = useState([]); // {patientId, doctorId, date, status, prescribed, nextDate}
  const [labReports, setLabReports] = useState([]); // {patientId, doctorId, ...reportFields}

  // Add doctor/lab assistant
  const addDoctor = (doctor) => setDoctors(prev => [...prev, { ...doctor, id: Date.now() }]);
  const addLabAssistant = (lab) => setLabAssistants(prev => [...prev, { ...lab, id: Date.now() }]);
  const removeDoctor = (idx) => setDoctors(prev => prev.filter((_, i) => i !== idx));
  const removeLabAssistant = (idx) => setLabAssistants(prev => prev.filter((_, i) => i !== idx));

  // Book appointment
  const bookAppointment = (patientId, doctorId, date) => {
    setAppointments(prev => [
      ...prev,
      { patientId, doctorId, date, status: 'booked', prescribed: false, nextDate: '' }
    ]);
  };

  // Doctor writes prescription
  const addPrescription = (patientId, doctorId, prescription, precautions, nextDate) => {
    setPatients(patients =>
      patients.map(p =>
        p.id === patientId
          ? {
              ...p,
              prescriptions: [
                ...p.prescriptions,
                { doctorId, prescription, precautions, nextDate }
              ],
            }
          : p
      )
    );
    // Mark appointment as prescribed
    setAppointments(appointments =>
      appointments.map(appt =>
        appt.patientId === patientId && appt.doctorId === doctorId && !appt.prescribed
          ? { ...appt, prescribed: true, nextDate }
          : appt
      )
    );
  };

  // Lab assistant adds report
  const addLabReport = (patientId, doctorId, report) => {
    setLabReports(prev => [...prev, { patientId, doctorId, ...report }]);
  };

  // Updated: Add prescription and details to a specific lab report by index
  const addPrescriptionToReport = (reportIndex, { prescription, precautions, bedRest, drugs, nextDate }) => {
    setLabReports(prev =>
      prev.map((r, idx) =>
        idx === reportIndex
          ? { ...r, prescription, precautions, bedRest, drugs, nextDate }
          : r
      )
    );
  };

  return (
    <AppContext.Provider
      value={{
        doctors,
        labAssistants,
        patients,
        appointments,
        labReports,
        addDoctor,
        addLabAssistant,
        removeDoctor,
        removeLabAssistant,
        bookAppointment,
        addPrescription,
        addLabReport,
        addPrescriptionToReport, // <-- Now accepts an object with all fields
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}
