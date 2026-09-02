import Certificate from '../models/Certificate.js';
import User from '../models/User.js';
import { generateCertificateId } from '../utils/certificateIdGenerator.js';

export const createCertificate = async (data) => {
  const { studentId, certificateTitle, courseName, issuerName, issuerOrganization, issueDate } = data;

  // Verify student exists and is a STUDENT
  const student = await User.findOne({ studentId, role: 'STUDENT' });
  if (!student) {
    const error = new Error('Invalid student ID or student does not exist');
    error.statusCode = 404;
    throw error;
  }

  // Generate unique certificate ID
  let certId;
  let isUnique = false;
  while (!isUnique) {
    certId = generateCertificateId();
    const existingCert = await Certificate.findOne({ certificateId: certId });
    if (!existingCert) {
      isUnique = true;
    }
  }

  // Create certificate
  const certificate = await Certificate.create({
    certificateId: certId,
    student: student._id,
    certificateTitle,
    courseName,
    issuerName,
    issuerOrganization,
    issueDate,
    status: 'ACTIVE',
  });

  return certificate.populate('student', '-password');
};

export const getCertificates = async (query = {}, page = 1, limit = 10, sort = { createdAt: -1 }) => {
  const skip = (page - 1) * limit;

  const certificates = await Certificate.find(query)
    .populate('student', '-password')
    .sort(sort)
    .skip(skip)
    .limit(limit);

  const total = await Certificate.countDocuments(query);

  return {
    certificates,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / limit) || 1,
    }
  };
};

export const getCertificateById = async (id) => {
  const certificate = await Certificate.findById(id).populate('student', '-password');
  if (!certificate) {
    const error = new Error('Certificate not found');
    error.statusCode = 404;
    throw error;
  }
  return certificate;
};

export const getCertificatesByStudent = async (studentMongoId, page = 1, limit = 10) => {
  return await getCertificates({ student: studentMongoId }, page, limit);
};

export const updateCertificate = async (id, updateData) => {
  // Verify certificate exists and is not revoked
  const cert = await Certificate.findById(id);
  if (!cert) {
    const error = new Error('Certificate not found');
    error.statusCode = 404;
    throw error;
  }

  if (cert.status === 'REVOKED') {
    const error = new Error('Cannot update a revoked certificate');
    error.statusCode = 400;
    throw error;
  }

  // Allowed fields explicitly checked
  const allowedUpdates = {};
  if (updateData.certificateTitle) allowedUpdates.certificateTitle = updateData.certificateTitle;
  if (updateData.courseName) allowedUpdates.courseName = updateData.courseName;
  if (updateData.issuerName) allowedUpdates.issuerName = updateData.issuerName;
  if (updateData.issuerOrganization) allowedUpdates.issuerOrganization = updateData.issuerOrganization;
  if (updateData.issueDate) allowedUpdates.issueDate = updateData.issueDate;

  if (Object.keys(allowedUpdates).length === 0) {
    const error = new Error('No valid fields provided for update');
    error.statusCode = 400;
    throw error;
  }

  const updatedCert = await Certificate.findByIdAndUpdate(
    id,
    { $set: allowedUpdates },
    { new: true, runValidators: true }
  ).populate('student', '-password');

  return updatedCert;
};

export const revokeCertificate = async (id) => {
  const cert = await Certificate.findById(id);
  if (!cert) {
    const error = new Error('Certificate not found');
    error.statusCode = 404;
    throw error;
  }

  if (cert.status === 'REVOKED') {
    const error = new Error('Certificate is already revoked');
    error.statusCode = 400;
    throw error;
  }

  cert.status = 'REVOKED';
  await cert.save();
  return cert.populate('student', '-password');
};
