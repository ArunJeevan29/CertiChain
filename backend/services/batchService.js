import xlsx from 'xlsx';
import fs from 'fs';
import CertificateBatch from '../models/CertificateBatch.js';
import User from '../models/User.js';
import Certificate from '../models/Certificate.js';
import { generateCertificateId } from '../utils/certificateIdGenerator.js';
import { generateCertificatePDF } from './pdfService.js';

const generateBatchId = () => {
  const timestamp = Date.now().toString().slice(-6);
  const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `BATCH-${new Date().getFullYear()}-${timestamp}${randomStr}`;
};

export const processCertificateBatch = async (file, uploadedBy) => {
  const batch = await CertificateBatch.create({
    batchId: generateBatchId(),
    uploadedBy,
    filename: file.originalname,
    status: 'PROCESSING'
  });

  try {
    // Read the Excel/CSV file
    const workbook = xlsx.readFile(file.path);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);
    
    batch.totalRows = data.length;
    
    const results = [];
    let successfulRows = 0;
    let failedRows = 0;

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const rowNumber = i + 2; // Assuming row 1 is headers

      try {
        const studentId = row['Student ID'];
        if (!studentId) {
          throw new Error('Missing Student ID');
        }

        const courseName = row['Course Name'] || 'General Certificate';
        const certificateTitle = row['Certificate Title'] || 'Certificate of Completion';
        const issueDate = row['Issue Date'] ? new Date(row['Issue Date']) : new Date();

        // 1. Find user by student ID
        const student = await User.findOne({ studentId, role: 'STUDENT' });
        if (!student) {
          throw new Error(`Student not found or is not a STUDENT: ${studentId}`);
        }

        // 2. Normalize course name for duplicate checking
        const normalizedCourseName = courseName.trim().toLowerCase();

        // 3. Duplicate check - must not have an ACTIVE cert for same logical course
        // Note: we fetch all ACTIVE certs for student, then do case-insensitive check in memory or DB
        const existingCert = await Certificate.findOne({
          student: student._id,
          status: 'ACTIVE'
        });

        // Doing explicit RegExp query for exact case-insensitive match on normalizedCourseName would be better:
        const duplicateMatch = await Certificate.findOne({
          student: student._id,
          status: 'ACTIVE',
          courseName: new RegExp(`^${normalizedCourseName.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, 'i')
        });

        if (duplicateMatch) {
          throw new Error(`Active certificate already exists for this student and course`);
        }
        
        // 4. Generate unique Certificate ID
        let certId;
        let isUnique = false;
        while (!isUnique) {
          certId = generateCertificateId();
          const existingCertId = await Certificate.findOne({ certificateId: certId });
          if (!existingCertId) {
            isUnique = true;
          }
        }

        // 5. Create the Certificate Record
        const certificate = await Certificate.create({
          certificateId: certId,
          student: student._id,
          certificateTitle,
          courseName,
          issuerName: 'CertiChain System', // Default fallback if omitted
          issuerOrganization: 'CertiChain Institute', // Default fallback if omitted
          issueDate,
          status: 'ACTIVE',
        });

        // 6. Generate PDF
        const pdfPath = await generateCertificatePDF(certificate, student);
        
        // 7. Store PDF Path
        certificate.pdfPath = pdfPath;
        await certificate.save();

        successfulRows++;
        results.push({
          row: rowNumber,
          studentId,
          status: 'SUCCESS',
          certificateId: certId
        });

      } catch (err) {
        failedRows++;
        results.push({
          row: rowNumber,
          studentId: row['Student ID'] || 'UNKNOWN',
          status: 'FAILED',
          reason: err.message
        });
      }
    }

    batch.successfulRows = successfulRows;
    batch.failedRows = failedRows;
    batch.results = results;
    batch.status = failedRows > 0 ? (successfulRows > 0 ? 'COMPLETED_WITH_ERRORS' : 'FAILED') : 'COMPLETED';
    batch.completedAt = new Date();
    await batch.save();

  } catch (err) {
    batch.status = 'FAILED';
    batch.results.push({
      row: 0,
      status: 'FAILED',
      reason: `Fatal error processing file: ${err.message}`
    });
    batch.completedAt = new Date();
    await batch.save();
  } finally {
    // Cleanup temporary file
    try {
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    } catch (cleanupErr) {
      console.error(`Failed to cleanup temp file: ${file.path}`);
    }
  }

  return batch;
};

export const getAllBatches = async (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  const batches = await CertificateBatch.find()
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('uploadedBy', 'name email');
    
  const total = await CertificateBatch.countDocuments();
  
  return {
    batches,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / limit) || 1
    }
  };
};

export const getBatchById = async (id) => {
  const batch = await CertificateBatch.findById(id).populate('uploadedBy', 'name email');
  if (!batch) {
    const error = new Error('Batch not found');
    error.statusCode = 404;
    throw error;
  }
  return batch;
};
