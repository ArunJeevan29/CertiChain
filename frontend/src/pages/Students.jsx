import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

const Students = () => {
  const { logout } = useContext(AuthContext);
  const [students, setStudents] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [deleteMessage, setDeleteMessage] = useState('');

  const fetchStudents = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/students?page=${page}&limit=10&q=${searchTerm}`);
      if (res.data.success) {
        setStudents(res.data.data.students);
        setPagination(res.data.data.pagination);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch students.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [page]); // Search is manual via button, so we don't trigger on searchTerm change

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1); // Reset to page 1 on new search
    fetchStudents();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this student?')) return;
    try {
      const res = await api.delete(`/students/${id}`);
      if (res.data.success) {
        setDeleteMessage('Student deleted successfully.');
        setTimeout(() => setDeleteMessage(''), 3000);
        fetchStudents(); // Refresh the list
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete student.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between">
            <div className="flex items-center space-x-8">
              <h1 className="text-xl font-bold text-gray-900">Student Management</h1>
              <Link to="/admin" className="text-sm font-medium text-gray-500 hover:text-gray-900">Dashboard</Link>
            </div>
            <div className="flex items-center">
              <button
                onClick={logout}
                className="rounded-md bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-200"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col justify-between sm:flex-row sm:items-center">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Registered Students {pagination && <span className="text-sm text-gray-500">({pagination.totalStudents} total)</span>}
          </h2>
          <form onSubmit={handleSearch} className="mt-4 flex sm:mt-0">
            <input
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full rounded-l-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
            />
            <button
              type="submit"
              className="inline-flex justify-center rounded-r-md border border-l-0 border-gray-300 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Search
            </button>
          </form>
        </div>

        {deleteMessage && (
          <div className="mb-4 rounded-md bg-green-50 p-4 text-sm text-green-700">
            {deleteMessage}
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="overflow-hidden rounded-lg bg-white shadow">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading students...</div>
          ) : students.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No students found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Student ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Department</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Register Number</th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {students.map((student) => (
                    <tr key={student._id}>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-indigo-600">
                        {student.studentId}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">{student.name}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{student.email}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{student.department}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{student.registerNumber}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                        <Link to={`/student/${student._id}`} className="text-indigo-600 hover:text-indigo-900">View</Link>
                        <span className="mx-2 text-gray-300">|</span>
                        <Link to={`/student/${student._id}/edit`} className="text-blue-600 hover:text-blue-900">Edit</Link>
                        <span className="mx-2 text-gray-300">|</span>
                        <button onClick={() => handleDelete(student._id)} className="text-red-600 hover:text-red-900">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {/* Pagination Controls */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing page <span className="font-medium">{pagination.page}</span> of <span className="font-medium">{pagination.totalPages}</span>
                  </p>
                </div>
                <div>
                  <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                    <button
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page === 1}
                      className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setPage(Math.min(pagination.totalPages, page + 1))}
                      disabled={page === pagination.totalPages}
                      className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Students;
