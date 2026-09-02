import React from 'react';
import { Link } from 'react-router-dom';

const Unauthorized = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 text-center">
        <div>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-red-600">
            Access Denied
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            You do not have permission to view this page.
          </p>
        </div>
        <div>
          <Link
            to="/login"
            className="group relative flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Return to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
