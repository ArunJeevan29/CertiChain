import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

const CertificateDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCertificate = async () => {
    try {
      const res = await api.get(`/certificates/${id}`);
      if (res.data.success) {
        setCertificate(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load certificate details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificate();
  }, [id]);

  const handleRevoke = async () => {
    if (!window.confirm('Are you ABSOLUTELY sure you want to revoke this certificate? This action cannot be undone.')) return;
    try {
      const res = await api.patch(`/certificates/${id}/revoke`);
      if (res.data.success) {
        fetchCertificate();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to revoke certificate.');
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Certificate Details</h1>
          <button onClick={() => navigate(-1)} className="text-sm font-medium text-indigo-600 hover:text-indigo-900">
            &larr; Back
          </button>
        </div>

        {error ? (
          <div className="rounded-md bg-red-50 p-4 text-red-700 shadow">{error}</div>
        ) : certificate ? (
          <div className="overflow-hidden rounded-lg bg-white shadow">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium leading-6 text-gray-900">Certificate Information</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">Official issued credential.</p>
              </div>
              {(user?.role === 'ADMIN' || user?.role === 'STAFF') && (
                <div className="flex space-x-2">
                  {certificate.status === 'ACTIVE' && (
                    <button
                      onClick={handleRevoke}
                      className="inline-flex justify-center rounded-md border border-transparent bg-red-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-red-700"
                    >
                      Revoke
                    </button>
                  )}
                </div>
              )}
            </div>
            <div className="border-t border-gray-200">
              <dl>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Certificate ID</dt>
                  <dd className="mt-1 text-sm font-semibold text-indigo-600 sm:col-span-2 sm:mt-0">{certificate.certificateId}</dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Status</dt>
                  <dd className="mt-1 text-sm sm:col-span-2 sm:mt-0">
                    <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${certificate.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {certificate.status}
                    </span>
                  </dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Certificate Title</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">{certificate.certificateTitle}</dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Course Name</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">{certificate.courseName}</dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Issued To (Student)</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                    {certificate.student?.name} ({certificate.student?.studentId})
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Issuer Name</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">{certificate.issuerName}</dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Issuer Organization</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">{certificate.issuerOrganization}</dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Issue Date</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                    {new Date(certificate.issueDate).toLocaleDateString()}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default CertificateDetails;
