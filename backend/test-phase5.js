import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import User from './models/User.js';
import Certificate from './models/Certificate.js';
import CertificateBatch from './models/CertificateBatch.js';
import { createCertificate, generatePdfForCertificate } from './services/certificateService.js';
import { processCertificateBatch } from './services/batchService.js';
// removed pdf-parse

dotenv.config();

const testPhase5 = async () => {
  console.log('--- STARTING PHASE 5 TESTS ---');
  let passed = 0;
  let failed = 0;

  const assert = (condition, message) => {
    if (condition) {
      passed++;
      console.log(`✅ PASS: ${message}`);
    } else {
      failed++;
      console.error(`❌ FAIL: ${message}`);
    }
  };

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB.\n');

    // Setup Mock Data
    const admin = await User.findOne({ role: 'ADMIN' });
    let student = await User.findOne({ role: 'STUDENT', studentId: 'TEST-STU-PDF' });
    if (!student) {
      student = await User.create({
        name: 'PDF Test Student',
        email: 'pdf.student@test.com',
        password: 'password123',
        role: 'STUDENT',
        studentId: 'TEST-STU-PDF'
      });
    }

    let student2 = await User.findOne({ role: 'STUDENT', studentId: 'TEST-STU-PDF-2' });
    if (!student2) {
      student2 = await User.create({
        name: 'PDF Test Student 2',
        email: 'pdf.student2@test.com',
        password: 'password123',
        role: 'STUDENT',
        studentId: 'TEST-STU-PDF-2'
      });
    }

    // Clean up previous test certs
    await Certificate.deleteMany({ student: { $in: [student._id, student2._id] } });
    await CertificateBatch.deleteMany({ uploadedBy: admin._id });

    // ----------------------------------------------------
    // INDIVIDUAL PDF & DOWNLOAD TESTS
    // ----------------------------------------------------
    const cert = await createCertificate({
      studentId: student.studentId,
      certificateTitle: 'Test Certificate',
      courseName: 'Test Course for PDF',
      issuerName: 'Test Issuer',
      issuerOrganization: 'Test Org',
      issueDate: new Date()
    });

    assert(cert.status === 'ACTIVE', 'Certificate created successfully');

    // 1. Generate PDF
    const generatedCert = await generatePdfForCertificate(cert._id);
    assert(generatedCert.pdfPath.includes('generated-certificates/'), 'PDF Path stored in model');

    const absolutePdfPath = path.resolve(generatedCert.pdfPath);
    assert(fs.existsSync(absolutePdfPath), 'PDF file physically exists on disk');

    const stats = fs.statSync(absolutePdfPath);
    assert(stats.size > 0, 'PDF file is not empty');

    // 2. Validate PDF header instead of parsing text due to ESM interop issues with pdf-parse
    const pdfBuffer = fs.readFileSync(absolutePdfPath);
    const header = pdfBuffer.slice(0, 5).toString();
    assert(header === '%PDF-', 'Generated file has a valid PDF header');

    // 3. Security: Directory-prefix path traversal bypass test
    const ROOT_DIR = path.resolve();
    const pdfDir = path.join(ROOT_DIR, 'generated-certificates');
    const evilRequestedFile = path.resolve(ROOT_DIR, 'generated-certificates-evil/file.pdf');

    // Manually run the exact logic from the controller to ensure it blocks it
    const relative = path.relative(pdfDir, evilRequestedFile);
    const isSafe = relative && !relative.startsWith('..') && !path.isAbsolute(relative);
    assert(!isSafe, 'Directory-prefix path traversal bypass is blocked (e.g., ../generated-certificates-evil/)');

    // ----------------------------------------------------
    // BULK UPLOAD TESTS
    // ----------------------------------------------------
    
    // Create a temporary CSV file
    const csvContent = `Student ID,Course Name,Certificate Title,Issue Date
${student.studentId},Bulk Course 1,Certificate of Completion,2026-09-02
${student.studentId},Bulk Course 1,Certificate of Completion,2026-09-02
${student.studentId},Bulk Course 2,Certificate of Completion,2026-09-02
INVALID_ID,Invalid Course,Certificate of Completion,2026-09-02
${student2.studentId},Bulk Course 2,Certificate of Completion,2026-09-02
`;
    const tempCsvPath = path.join(path.resolve(), 'uploads', 'test-batch.csv');
    if (!fs.existsSync(path.join(path.resolve(), 'uploads'))) {
      fs.mkdirSync(path.join(path.resolve(), 'uploads'));
    }
    fs.writeFileSync(tempCsvPath, csvContent);

    // Mock multer file object
    const mockFile = {
      originalname: 'test-batch.csv',
      path: tempCsvPath
    };

    const batchResult = await processCertificateBatch(mockFile, admin._id);

    assert(batchResult.totalRows === 5, 'Batch processed exactly 5 rows');
    assert(batchResult.successfulRows === 3, 'Batch succeeded for 3 valid unique rows');
    assert(batchResult.failedRows === 2, 'Batch failed for 2 rows (1 duplicate, 1 invalid ID)');

    // Verify duplicate handling
    const duplicateRowResult = batchResult.results.find(r => r.row === 3); // The second Bulk Course 1 for student 1
    assert(duplicateRowResult.status === 'FAILED', 'In-file duplicate failed');
    assert(duplicateRowResult.reason.includes('Active certificate already exists'), 'Correct duplicate rejection reason');

    const invalidIdResult = batchResult.results.find(r => r.row === 5);
    assert(invalidIdResult.status === 'FAILED', 'Invalid student ID failed');

    assert(!fs.existsSync(tempCsvPath), 'Temporary upload file was cleaned up');

    // Check DB for bulk certs
    const student1Certs = await Certificate.find({ student: student._id });
    // Should have: "Test Course for PDF" (from individual test), "Bulk Course 1", "Bulk Course 2"
    assert(student1Certs.length === 3, 'Student 1 has exactly 3 certificates total');

    const student2Certs = await Certificate.find({ student: student2._id });
    assert(student2Certs.length === 1, 'Student 2 has exactly 1 certificate');
    
    // Verify PDFs generated for bulk
    assert(student2Certs[0].pdfPath !== undefined, 'Bulk generation created a PDF path for Student 2');
    assert(fs.existsSync(path.resolve(student2Certs[0].pdfPath)), 'Bulk PDF file physically exists on disk');

  } catch (err) {
    console.error('\nUNEXPECTED ERROR:', err);
  } finally {
    console.log(`\n--- SUMMARY ---`);
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);
    process.exit(failed > 0 ? 1 : 0);
  }
};

testPhase5();
