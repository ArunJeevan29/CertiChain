import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

const BulkCertificateGeneration = () => {
  const { user } = useContext(AuthContext);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [batchResult, setBatchResult] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError(null);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file first.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    setError(null);
    setBatchResult(null);

    try {
      const res = await api.post('/batches/certificates', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      if (res.data.success) {
        setBatchResult(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'File upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Bulk Certificate Generation</h1>
          <Link to="/certificates" className="text-sm font-medium text-indigo-600 hover:text-indigo-900">
            &larr; Back to Certificates
          </Link>
        </div>

        <div className="rounded-lg bg-white p-6 shadow mb-8">
          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Select Spreadsheet (CSV, XLSX, XLS)</label>
              <input
                type="file"
                accept=".csv, .xlsx, .xls"
                onChange={handleFileChange}
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
              <p className="mt-2 text-xs text-gray-500">
                Required Column: <strong>Student ID</strong>. Optional Columns: <strong>Course Name, Certificate Title, Issue Date</strong>.
              </p>
            </div>
            {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded">{error}</div>}
            <button
              type="submit"
              disabled={!file || loading}
              className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Upload and Process'}
            </button>
          </form>
        </div>

        {batchResult && (
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Batch Results: {batchResult.status}</h2>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded text-center">
                <span className="block text-2xl font-bold text-gray-900">{batchResult.totalRows}</span>
                <span className="text-sm text-gray-500">Total Rows</span>
              </div>
              <div className="bg-green-50 p-4 rounded text-center">
                <span className="block text-2xl font-bold text-green-600">{batchResult.successfulRows}</span>
                <span className="text-sm text-green-600">Successful</span>
              </div>
              <div className="bg-red-50 p-4 rounded text-center">
                <span className="block text-2xl font-bold text-red-600">{batchResult.failedRows}</span>
                <span className="text-sm text-red-600">Failed</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Row</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Student ID</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Status</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {batchResult.results.map((r, idx) => (
                    <tr key={idx}>
                      <td className="whitespace-nowrap px-4 py-2 text-sm text-gray-500">{r.row}</td>
                      <td className="whitespace-nowrap px-4 py-2 text-sm text-gray-900">{r.studentId}</td>
                      <td className="whitespace-nowrap px-4 py-2 text-sm">
                        <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${r.status === 'SUCCESS' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-500">
                        {r.status === 'SUCCESS' ? (
                          <Link to={`/certificate/${r.certificateId}`} className="text-indigo-600 hover:underline">{r.certificateId}</Link>
                        ) : (
                          <span className="text-red-500">{r.reason}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BulkCertificateGeneration;
