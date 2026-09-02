import * as certificateService from '../services/certificateService.js';
import User from '../models/User.js';

// @desc    Create new certificate
// @route   POST /api/certificates
// @access  Private/Admin,Staff
export const createCertificate = async (req, res, next) => {
  try {
    const data = await certificateService.createCertificate(req.body);
    res.status(201).json({
      success: true,
      message: 'Certificate created successfully',
      data,
    });
  } catch (error) {
    if (error.statusCode) {
      res.status(error.statusCode);
    }
    next(error);
  }
};

// @desc    Get all certificates (with pagination and search)
// @route   GET /api/certificates
// @access  Private/Admin,Staff
export const getCertificates = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    let limit = parseInt(req.query.limit, 10) || 10;
    if (limit > 100) limit = 100;

    const query = {};
    if (req.query.status) {
      query.status = req.query.status;
    }

    if (req.query.q) {
      const searchRegex = new RegExp(req.query.q.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'), 'i');
      
      // Need to find matching students first if we want to search by student name/id
      const matchingStudents = await User.find({
        $or: [
          { name: searchRegex },
          { studentId: searchRegex }
        ]
      }).select('_id');
      const studentIds = matchingStudents.map(s => s._id);

      query.$or = [
        { certificateId: searchRegex },
        { certificateTitle: searchRegex },
        { courseName: searchRegex },
        { student: { $in: studentIds } }
      ];
    }

    const data = await certificateService.getCertificates(query, page, limit);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    if (error.statusCode) {
      res.status(error.statusCode);
    }
    next(error);
  }
};

// @desc    Get certificate by ID
// @route   GET /api/certificates/:id
// @access  Private/Admin,Staff,Student
export const getCertificateById = async (req, res, next) => {
  try {
    const cert = await certificateService.getCertificateById(req.params.id);

    // IDOR Protection: If STUDENT, ensure they own it
    if (req.user.role === 'STUDENT' && cert.student._id.toString() !== req.user.userId) {
      return res.status(403).json({ success: false, message: 'Access denied. You can only view your own certificates.' });
    }

    res.status(200).json({
      success: true,
      data: cert,
    });
  } catch (error) {
    if (error.statusCode) {
      res.status(error.statusCode);
    }
    next(error);
  }
};

// @desc    Get all certificates for a student by their unique studentId
// @route   GET /api/certificates/student/:studentId
// @access  Private/Admin,Staff,Student
export const getCertificatesByStudent = async (req, res, next) => {
  try {
    const targetStudent = await User.findOne({ studentId: req.params.studentId });
    if (!targetStudent) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // IDOR Protection: If STUDENT, ensure they are requesting their own studentId
    if (req.user.role === 'STUDENT' && targetStudent._id.toString() !== req.user.userId) {
      return res.status(403).json({ success: false, message: 'Access denied. You can only view your own certificates.' });
    }

    const page = parseInt(req.query.page, 10) || 1;
    let limit = parseInt(req.query.limit, 10) || 10;
    if (limit > 100) limit = 100;

    const data = await certificateService.getCertificatesByStudent(targetStudent._id, page, limit);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    if (error.statusCode) {
      res.status(error.statusCode);
    }
    next(error);
  }
};

// @desc    Update certificate
// @route   PUT /api/certificates/:id
// @access  Private/Admin,Staff
export const updateCertificate = async (req, res, next) => {
  try {
    const data = await certificateService.updateCertificate(req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: 'Certificate updated successfully',
      data,
    });
  } catch (error) {
    if (error.statusCode) {
      res.status(error.statusCode);
    }
    next(error);
  }
};

// @desc    Revoke certificate
// @route   PATCH /api/certificates/:id/revoke
// @access  Private/Admin,Staff
export const revokeCertificate = async (req, res, next) => {
  try {
    const data = await certificateService.revokeCertificate(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Certificate revoked successfully',
      data,
    });
  } catch (error) {
    if (error.statusCode) {
      res.status(error.statusCode);
    }
    next(error);
  }
};

import path from 'path';
import fs from 'fs';

// @desc    Generate PDF for certificate
// @route   POST /api/certificates/:id/generate
// @access  Private/Admin,Staff
export const generatePdf = async (req, res, next) => {
  try {
    const data = await certificateService.generatePdfForCertificate(req.params.id);
    res.status(200).json({
      success: true,
      message: 'PDF generated successfully',
      data,
    });
  } catch (error) {
    if (error.statusCode) res.status(error.statusCode);
    next(error);
  }
};

// @desc    Download PDF for certificate
// @route   GET /api/certificates/:id/download
// @access  Private/Admin,Staff,Student
export const downloadPdf = async (req, res, next) => {
  try {
    const cert = await certificateService.getCertificateById(req.params.id);

    // IDOR Protection: If STUDENT, ensure they own it
    if (req.user.role === 'STUDENT' && cert.student._id.toString() !== req.user.userId) {
      return res.status(403).json({ success: false, message: 'Access denied. You can only download your own certificates.' });
    }

    if (!cert.pdfPath) {
      return res.status(404).json({ success: false, message: 'PDF has not been generated for this certificate yet.' });
    }

    const ROOT_DIR = path.resolve();
    const pdfDir = path.join(ROOT_DIR, 'generated-certificates');
    const requestedFile = path.resolve(ROOT_DIR, cert.pdfPath);

    // Path traversal protection
    const relative = path.relative(pdfDir, requestedFile);
    const isSafe = relative && !relative.startsWith('..') && !path.isAbsolute(relative);
    
    if (!isSafe) {
      return res.status(403).json({ success: false, message: 'Invalid file path.' });
    }

    if (!fs.existsSync(requestedFile)) {
      return res.status(404).json({ success: false, message: 'PDF file not found on server.' });
    }

    res.download(requestedFile, `${cert.certificateId}.pdf`);
  } catch (error) {
    if (error.statusCode) res.status(error.statusCode);
    next(error);
  }
};
