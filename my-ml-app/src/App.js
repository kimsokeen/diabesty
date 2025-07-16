import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import UploadPage from './pages/UploadPage';
import InstructionPage from './pages/InstructionPage';
import RegisterPage from './pages/RegisterPage';
import MyInfoPage from './pages/MyInfoPage';
import DoctorDashboard from './pages/DoctorDashboard';
import WoundSummaryPage from './pages/WoundSummaryPage';
import ChooseRole from './pages/ChooseRole';
import PatientDetail from './pages/PatientDetail';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/instructions" element={<InstructionPage />} />
        <Route path="/myinfo" element={<MyInfoPage />} />
        <Route path="/doctordashboard" element={<DoctorDashboard />} />
        <Route path="/woundsummary" element={<WoundSummaryPage />} />
        <Route path="/chooserole" element={<ChooseRole />} />
        <Route path="/patient/:patientId" element={<PatientDetail />} />
      </Routes>
    </Router>
  );
}

export default App;
