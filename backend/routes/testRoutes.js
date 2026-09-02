import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

// @desc    Admin test route
// @route   GET /api/admin/test
// @access  Private/Admin
router.get('/admin/test', protect, authorizeRoles('ADMIN'), (req, res) => {
  res.status(200).json({ success: true, message: 'Admin access granted' });
});

// @desc    Staff test route
// @route   GET /api/staff/test
// @access  Private/Staff or Admin
router.get('/staff/test', protect, authorizeRoles('STAFF', 'ADMIN'), (req, res) => {
  res.status(200).json({ success: true, message: 'Staff access granted' });
});

// @desc    Student test route
// @route   GET /api/student/test
// @access  Private/Student
router.get('/student/test', protect, authorizeRoles('STUDENT'), (req, res) => {
  res.status(200).json({ success: true, message: 'Student access granted' });
});

export default router;
