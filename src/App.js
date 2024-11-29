// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Register from './components/Register';
import Login from './components/Login';
import Home from './components/Home';
import PatientDashboard from './components/PatientDashboard';
import DoctorDashboard from './components/DoctorDashboard';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const isAuthenticated = localStorage.getItem('token');
  const userRole = localStorage.getItem('role');

  return (
    <Router>
      <Routes>
        {/* Home Route */}
        <Route path="/" element={<Home />} />

        {/* Authentication routes */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        {/* Role-specific dashboard routes */}
        <Route
          path="/patient-dashboard"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated && userRole === 'patient'}>
              <PatientDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor-dashboard"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated && userRole === 'doctor'}>
              <DoctorDashboard />
            </ProtectedRoute>
          }
        />

        {/* Catch-all route to redirect unauthorized users */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
