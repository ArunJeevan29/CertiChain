import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const StaffDashboard = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Staff Dashboard</h1>
            </div>
            <div className="flex items-center space-x-6">
              <Link to="/students" className="text-sm font-medium text-indigo-600 hover:text-indigo-900">
                Manage Students
              </Link>
              <span className="text-sm text-gray-700">Welcome, {user?.name} ({user?.role})</span>
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
          <p className="text-gray-600">This is a placeholder for the Staff Dashboard.</p>
        </div>
      </main>
    </div>
  );
};

export default StaffDashboard;
