import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const StudentDashboard = () => {
  const { user, logout } = useContext(AuthContext);

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
        <div className="rounded-lg bg-white p-6 shadow space-y-4">
          <div>
            <h3 className="text-lg font-medium leading-6 text-gray-900">Your Information</h3>
            <div className="mt-2 max-w-xl text-sm text-gray-500">
              <p><strong>Name:</strong> {user?.name}</p>
              <p><strong>Role:</strong> {user?.role}</p>
              <p><strong>Student ID:</strong> {user?.studentId || 'N/A'}</p>
            </div>
          </div>
          <p className="text-gray-600 border-t pt-4">This is a placeholder for the Student Dashboard.</p>
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;
