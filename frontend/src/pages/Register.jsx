import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    college: '',
    department: '',
    registerNumber: ''
  });
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [studentId, setStudentId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { register } = useContext(AuthContext);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setStudentId('');
    setIsLoading(true);

    const result = await register(formData);

    if (result.success) {
      setSuccessMsg('Student registered successfully.');
      setStudentId(result.data.studentId);
    } else {
      setError(result.message);
    }
    
    setIsLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Student Registration
          </h2>
        </div>
        
        {successMsg ? (
          <div className="space-y-4 text-center">
            <div className="rounded-md bg-green-50 p-4 text-sm text-green-700">
              <p className="font-semibold">{successMsg}</p>
              <p className="mt-2">Your Student ID is:</p>
              <p className="mt-1 text-lg font-bold">{studentId}</p>
              <p className="mt-2 text-xs">Please save this ID for your records.</p>
            </div>
            <Link
              to="/login"
              className="inline-block w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Proceed to Login
            </Link>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
                {error}
              </div>
            )}
            <div className="space-y-4 rounded-md shadow-sm">
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <input type="text" name="name" required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm" value={formData.name} onChange={handleChange} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email Address</label>
                <input type="email" name="email" required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm" value={formData.email} onChange={handleChange} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <input type="password" name="password" required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm" value={formData.password} onChange={handleChange} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">College</label>
                <input type="text" name="college" required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm" value={formData.college} onChange={handleChange} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Department</label>
                <input type="text" name="department" required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm" value={formData.department} onChange={handleChange} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Register Number</label>
                <input type="text" name="registerNumber" required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm" value={formData.registerNumber} onChange={handleChange} />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {isLoading ? 'Registering...' : 'Register'}
              </button>
            </div>
            <div className="text-center text-sm">
              <span className="text-gray-600">Already have an account? </span>
              <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                Sign in here
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Register;
