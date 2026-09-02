import express from 'express';
import {
  uploadCertificateBatch,
  getBatches,
  getBatchById,
  upload
} from '../controllers/batchController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(authorizeRoles('ADMIN', 'STAFF'));

// Handles the upload file inside the route using the multer upload middleware
router.post('/certificates', (req, res, next) => {
  upload.single('file')(req, res, function (err) {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
}, uploadCertificateBatch);

router.get('/', getBatches);
router.get('/:id', getBatchById);

export default router;
