import express from 'express';
import {
  createCertificate,
  getCertificates,
  getCertificateById,
  getCertificatesByStudent,
  updateCertificate,
  revokeCertificate,
  generatePdf,
  downloadPdf
} from '../controllers/certificateController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import { validateMongoId, validateCreateCertificate } from '../middleware/validationMiddleware.js';

const router = express.Router();

// All certificate routes require authentication
router.use(protect);

// @route   POST /api/certificates
// @access  Private/Admin,Staff
router.post('/', authorizeRoles('ADMIN', 'STAFF'), validateCreateCertificate, createCertificate);

// @route   GET /api/certificates
// @access  Private/Admin,Staff
router.get('/', authorizeRoles('ADMIN', 'STAFF'), getCertificates);

// @route   GET /api/certificates/student/:studentId
// @access  Private/Admin,Staff,Student
router.get('/student/:studentId', getCertificatesByStudent);

// @route   GET /api/certificates/:id
// @access  Private/Admin,Staff,Student
router.get('/:id', validateMongoId, getCertificateById);

// @route   PUT /api/certificates/:id
// @access  Private/Admin,Staff
router.put('/:id', validateMongoId, authorizeRoles('ADMIN', 'STAFF'), updateCertificate);

// @route   PATCH /api/certificates/:id/revoke
// @access  Private/Admin,Staff
router.patch('/:id/revoke', validateMongoId, authorizeRoles('ADMIN', 'STAFF'), revokeCertificate);

// @route   POST /api/certificates/:id/generate
// @access  Private/Admin,Staff
router.post('/:id/generate', validateMongoId, authorizeRoles('ADMIN', 'STAFF'), generatePdf);

// @route   GET /api/certificates/:id/download
// @access  Private/Admin,Staff,Student
router.get('/:id/download', validateMongoId, authorizeRoles('ADMIN', 'STAFF', 'STUDENT'), downloadPdf);

export default router;
