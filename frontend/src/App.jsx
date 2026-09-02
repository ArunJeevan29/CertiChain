import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Register from './pages/Register';
import Unauthorized from './pages/Unauthorized';
import AdminDashboard from './pages/AdminDashboard';
import StaffDashboard from './pages/StaffDashboard';
import StudentDashboard from './pages/StudentDashboard';
import Students from './pages/Students';
import StudentDetails from './pages/StudentDetails';
import EditStudent from './pages/EditStudent';
import Certificates from './pages/Certificates';
import CreateCertificate from './pages/CreateCertificate';
import CertificateDetails from './pages/CertificateDetails';
import BulkCertificateGeneration from './pages/BulkCertificateGeneration';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Protected Routes */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/staff" 
            element={
              <ProtectedRoute allowedRoles={['STAFF']}>
                <StaffDashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/student" 
            element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <StudentDashboard />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/students" 
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'STAFF']}>
                <Students />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/student/:id" 
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'STAFF']}>
                <StudentDetails />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/student/:id/edit" 
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'STAFF']}>
                <EditStudent />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/certificates" 
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'STAFF']}>
                <Certificates />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/certificate/create" 
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'STAFF']}>
                <CreateCertificate />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/certificates/bulk" 
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'STAFF']}>
                <BulkCertificateGeneration />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/certificate/:id" 
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'STAFF', 'STUDENT']}>
                <CertificateDetails />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
