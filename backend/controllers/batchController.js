import * as batchService from '../services/batchService.js';
import multer from 'multer';
import path from 'path';

// Set up multer for temporary file storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(path.resolve(), 'uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.csv', '.xlsx', '.xls'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only CSV, XLSX, and XLS are allowed.'), false);
  }
};

export const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// @desc    Upload bulk certificate sheet
// @route   POST /api/batches/certificates
// @access  Private/Admin,Staff
export const uploadCertificateBatch = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded or invalid file format' });
    }

    const batch = await batchService.processCertificateBatch(req.file, req.user.userId);
    
    res.status(201).json({
      success: true,
      message: 'Bulk processing completed',
      data: batch
    });
  } catch (error) {
    if (error.statusCode) res.status(error.statusCode);
    next(error);
  }
};

// @desc    Get all batches
// @route   GET /api/batches
// @access  Private/Admin,Staff
export const getBatches = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    let limit = parseInt(req.query.limit, 10) || 10;
    if (limit > 50) limit = 50;

    const data = await batchService.getAllBatches(page, limit);
    res.status(200).json({ success: true, data });
  } catch (error) {
    if (error.statusCode) res.status(error.statusCode);
    next(error);
  }
};

// @desc    Get batch by ID
// @route   GET /api/batches/:id
// @access  Private/Admin,Staff
export const getBatchById = async (req, res, next) => {
  try {
    const data = await batchService.getBatchById(req.params.id);
    res.status(200).json({ success: true, data });
  } catch (error) {
    if (error.statusCode) res.status(error.statusCode);
    next(error);
  }
};
