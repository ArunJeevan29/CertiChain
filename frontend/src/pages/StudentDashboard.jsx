import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

const StudentDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/students/me');
        if (response.data.success) {
          setProfile(response.data.data);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load profile');
      } finally {
        setLoading(false);
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
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
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
      </main>
    </div>
  );
};

export default StudentDashboard;
