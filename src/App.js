import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard'; // Patient
import DoctorDashboard from './pages/DoctorDashboard';
import LabDashboard from './pages/LabDashboard';
import AdminDashboard from './pages/AdminDashboard';
import PatientDetailsPage from './pages/PatientDetailsPage';
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/doctor" element={<DoctorDashboard />} />
        <Route path="/lab" element={<LabDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/patient-details" element={<PatientDetailsPage />} />
      </Routes>
    </Router>
  );
}

export default App;
