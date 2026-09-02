import express from 'express';
import {
  getStudents,
  getMyProfile,
  getStudentById,
  getStudentByStudentId,
  updateStudent,
  deleteStudent
} from '../controllers/studentController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import { validateMongoId, validateStudentUpdate } from '../middleware/validationMiddleware.js';

const router = express.Router();

// All student routes require authentication
router.use(protect);

// @route   GET /api/students/me
// @access  Private/Student
router.get('/me', authorizeRoles('STUDENT'), getMyProfile);

// @route   GET /api/students
// @access  Private/Admin,Staff
router.get('/', authorizeRoles('ADMIN', 'STAFF'), getStudents);

// @route   GET /api/students/student-id/:studentId
// @access  Private/Admin,Staff,Student
router.get('/student-id/:studentId', getStudentByStudentId);

// @route   GET /api/students/:id
// @access  Private/Admin,Staff,Student
router.get('/:id', validateMongoId, getStudentById);

// @route   PUT /api/students/:id
// @access  Private/Admin,Staff,Student
router.put('/:id', validateMongoId, validateStudentUpdate, updateStudent);

// @route   DELETE /api/students/:id
// @access  Private/Admin,Staff
router.delete('/:id', validateMongoId, authorizeRoles('ADMIN', 'STAFF'), deleteStudent);

export default router;
