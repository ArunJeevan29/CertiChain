import User from '../models/User.js';

export const getAllStudents = async (query = {}, page = 1, limit = 10, sort = { name: 1 }) => {
  const skip = (page - 1) * limit;
  const filter = { ...query, role: 'STUDENT' };

  const students = await User.find(filter)
    .select('-password')
    .sort(sort)
    .skip(skip)
    .limit(limit);

  const totalStudents = await User.countDocuments(filter);

  return {
    students,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      totalStudents,
      totalPages: Math.ceil(totalStudents / limit) || 1,
    }
  };
};

export const getStudentById = async (id) => {
  const student = await User.findOne({ _id: id, role: 'STUDENT' }).select('-password');
  if (!student) {
    const error = new Error('Student not found');
    error.statusCode = 404;
    throw error;
  }
  return student;
};

export const getStudentByStudentId = async (studentId) => {
  const student = await User.findOne({ studentId, role: 'STUDENT' }).select('-password');
  if (!student) {
    const error = new Error('Student not found');
    error.statusCode = 404;
    throw error;
  }
  return student;
};

export const updateStudent = async (id, updateData) => {
  // Ensure we only update specific fields, NEVER role or studentId
  const allowedUpdates = {};
  if (updateData.name) allowedUpdates.name = updateData.name;
  if (updateData.email) allowedUpdates.email = updateData.email;
  if (updateData.college) allowedUpdates.college = updateData.college;
  if (updateData.department) allowedUpdates.department = updateData.department;
  if (updateData.registerNumber) allowedUpdates.registerNumber = updateData.registerNumber;

  if (Object.keys(allowedUpdates).length === 0) {
    const error = new Error('No valid fields provided for update');
    error.statusCode = 400;
    throw error;
  }

  // Check for duplicate email if email is being updated
  if (allowedUpdates.email) {
    const existingEmail = await User.findOne({ email: allowedUpdates.email, _id: { $ne: id } });
    if (existingEmail) {
      const error = new Error('Email is already in use by another student');
      error.statusCode = 400;
      throw error;
    }
  }

  const updatedStudent = await User.findOneAndUpdate(
    { _id: id, role: 'STUDENT' },
    { $set: allowedUpdates },
    { new: true, runValidators: true }
  ).select('-password');

  if (!updatedStudent) {
    const error = new Error('Student not found or could not be updated');
    error.statusCode = 404;
    throw error;
  }

  return updatedStudent;
};

export const deleteStudent = async (id) => {
  const deletedStudent = await User.findOneAndDelete({ _id: id, role: 'STUDENT' });
  if (!deletedStudent) {
    const error = new Error('Student not found');
    error.statusCode = 404;
    throw error;
  }
  return deletedStudent;
};
