import * as authService from '../services/authService.js';

// @desc    Register a new student
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
  try {
    const { name, email, password, college, department, registerNumber } = req.body;

    const studentData = { name, email, password, college, department, registerNumber };
    const user = await authService.registerStudent(studentData);

    res.status(201).json({
      success: true,
      message: 'Student registered successfully',
      data: user,
    });
  } catch (error) {
    // If the error has a statusCode set from the service, use it. Otherwise pass to global error handler.
    if (error.statusCode) {
      res.status(error.statusCode);
    }
    next(error);
  }
};

// @desc    Login a user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const data = await authService.loginUser(email, password);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: data,
    });
  } catch (error) {
    if (error.statusCode) {
      res.status(error.statusCode);
    }
    next(error);
  }
};
