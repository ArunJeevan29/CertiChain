import mongoose from 'mongoose';

const ResultSchema = new mongoose.Schema({
  row: { type: Number, required: true },
  studentId: { type: String },
  status: { type: String, enum: ['SUCCESS', 'FAILED'], required: true },
  certificateId: { type: String },
  reason: { type: String }
}, { _id: false });

const CertificateBatchSchema = new mongoose.Schema({
  batchId: {
    type: String,
    required: true,
    unique: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  filename: {
    type: String,
    required: true
  },
  totalRows: {
    type: Number,
    default: 0
  },
  successfulRows: {
    type: Number,
    default: 0
  },
  failedRows: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'COMPLETED_WITH_ERRORS', 'FAILED'],
    default: 'PENDING'
  },
  results: [ResultSchema],
  completedAt: {
    type: Date
  }
}, { timestamps: true });

const CertificateBatch = mongoose.model('CertificateBatch', CertificateBatchSchema);

export default CertificateBatch;
