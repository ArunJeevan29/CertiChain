import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

const CreateCertificate = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    studentId: '',
    certificateTitle: '',
    courseName: '',
    issuerName: '',
    issuerOrganization: '',
    issueDate: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.post('/certificates', formData);
      if (res.data.success) {
        navigate(`/certificate/${res.data.data._id}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create certificate.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl rounded-lg bg-white p-8 shadow-lg">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Issue New Certificate</h2>
          <Link to="/certificates" className="text-sm font-medium text-indigo-600 hover:text-indigo-900">
            Cancel
          </Link>
        </div>

        {error && <div className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-700">{error}</div>}

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Student ID (e.g. STU-2026-XXXXXX)</label>
              <input type="text" name="studentId" required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm" value={formData.studentId} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Certificate Title</label>
              <input type="text" name="certificateTitle" required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm" value={formData.certificateTitle} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Course Name</label>
              <input type="text" name="courseName" required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm" value={formData.courseName} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Issuer Name</label>
              <input type="text" name="issuerName" required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm" value={formData.issuerName} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Issuer Organization</label>
              <input type="text" name="issuerOrganization" required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm" value={formData.issuerOrganization} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Issue Date</label>
              <input type="date" name="issueDate" required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm" value={formData.issueDate} onChange={handleChange} />
            </div>
          </div>
          <div>
            <button
              type="submit"
              disabled={loading}
              className="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Certificate'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCertificate;
