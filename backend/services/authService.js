import User from '../models/User.js';
import { generateStudentId } from '../utils/studentIdGenerator.js';
import jwt from 'jsonwebtoken';

export const registerStudent = async (studentData) => {
  const { name, email, password, college, department, registerNumber } = studentData;

  // Check if user already exists by email
  const userExists = await User.findOne({ email });
  if (userExists) {
    const error = new Error('User with this email already exists');
    error.statusCode = 400;
    throw error;
  }

  // Check if register number exists
  if (registerNumber) {
    const regExists = await User.findOne({ registerNumber });
    if (regExists) {
      const error = new Error('User with this register number already exists');
      error.statusCode = 400;
      throw error;
    }
  }

  // Generate unique student ID
  let studentId;
  let isUnique = false;
  while (!isUnique) {
    studentId = generateStudentId();
    const existingId = await User.findOne({ studentId });
    if (!existingId) {
      isUnique = true;
    }
  }

  // Create user with forced STUDENT role
  const user = await User.create({
    name,
    email,
    password,
    role: 'STUDENT',
    college,
    department,
    registerNumber,
    studentId,
  });

  // Return user without password
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    college: user.college,
    department: user.department,
    registerNumber: user.registerNumber,
    studentId: user.studentId,
  };
};

export const loginUser = async (email, password) => {
  // Find user by email
  const user = await User.findOne({ email });

  if (!user) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  // Check password
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  // Generate JWT token
  const payload = {
    userId: user._id,
    role: user.role,
  };
  
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  });

  return {
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      studentId: user.role === 'STUDENT' ? user.studentId : undefined,
    }
  };
};
