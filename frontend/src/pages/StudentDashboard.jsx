import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

const StudentDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [certificates, setCertificates] = useState([]);
  const [loadingCerts, setLoadingCerts] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/students/me');
        if (response.data.success) {
          const studentProfile = response.data.data;
          setProfile(studentProfile);
          // Fetch certificates after getting student details
          fetchCertificates(studentProfile.studentId);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load profile');
        setLoadingCerts(false);
      } finally {
        setLoading(false);
      }
    };

    const fetchCertificates = async (studentId) => {
      try {
        const res = await api.get(`/certificates/student/${studentId}`);
        if (res.data.success) {
          setCertificates(res.data.data.certificates);
        }
      } catch (err) {
        console.error('Failed to load certificates', err);
      } finally {
        setLoadingCerts(false);
      }
    };

    fetchProfile();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Student Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">Welcome, {user?.name}</span>
              <button
                onClick={logout}
                className="rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-2xl font-bold text-gray-900">My Profile</h2>
          
          {loading ? (
            <p className="text-gray-500">Loading profile data...</p>
          ) : error ? (
            <div className="rounded-md bg-red-50 p-4 text-red-700">{error}</div>
          ) : profile ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded border p-4">
                  <h3 className="text-sm font-medium text-gray-500">Full Name</h3>
                  <p className="mt-1 text-lg font-semibold text-gray-900">{profile.name}</p>
                </div>
                <div className="rounded border p-4">
                  <h3 className="text-sm font-medium text-gray-500">Student ID</h3>
                  <p className="mt-1 text-lg font-semibold text-indigo-600">{profile.studentId}</p>
                </div>
                <div className="rounded border p-4">
                  <h3 className="text-sm font-medium text-gray-500">Email Address</h3>
                  <p className="mt-1 text-lg font-semibold text-gray-900">{profile.email}</p>
                </div>
                <div className="rounded border p-4">
                  <h3 className="text-sm font-medium text-gray-500">College</h3>
                  <p className="mt-1 text-lg font-semibold text-gray-900">{profile.college}</p>
                </div>
                <div className="rounded border p-4">
                  <h3 className="text-sm font-medium text-gray-500">Department</h3>
                  <p className="mt-1 text-lg font-semibold text-gray-900">{profile.department}</p>
                </div>
                <div className="rounded border p-4">
                  <h3 className="text-sm font-medium text-gray-500">Register Number</h3>
                  <p className="mt-1 text-lg font-semibold text-gray-900">{profile.registerNumber}</p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">Profile data not available.</p>
          )}
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-2xl font-bold text-gray-900">My Certificates</h2>
          {loadingCerts ? (
            <p className="text-gray-500">Loading certificates...</p>
          ) : certificates.length === 0 ? (
            <p className="text-gray-500">No certificates issued yet.</p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {certificates.map(cert => (
                <a href={`/certificate/${cert._id}`} key={cert._id} className="block rounded-lg border p-4 shadow-sm hover:border-indigo-500 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-semibold text-gray-500">{cert.certificateId}</span>
                    <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${cert.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {cert.status}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 truncate">{cert.certificateTitle}</h3>
                  <p className="text-sm text-gray-600 truncate">{cert.courseName}</p>
                  <p className="mt-4 text-xs text-gray-400">Issued: {new Date(cert.issueDate).toLocaleDateString()}</p>
                </a>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;
