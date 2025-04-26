import express from 'express';
import { 
  createComplaint, 
  getComplaints, 
  getComplaintById, 
  updateComplaintStatus,
  assignComplaint,
  addComment,
  getNearbyComplaints
} from '../controllers/complaintController.js';
import { authenticate, isAdmin } from '../middleware/auth.js';
import { uploadImages, handleUploadError } from '../middleware/upload.js';

const router = express.Router();

// User routes
router.post('/', authenticate, uploadImages, handleUploadError, createComplaint);
router.get('/', authenticate, getComplaints);
router.get('/nearby', authenticate, getNearbyComplaints);
router.get('/:id', authenticate, getComplaintById);
router.post('/:id/comments', authenticate, addComment);

// Admin routes
router.patch('/:id/status', authenticate, isAdmin, updateComplaintStatus);
router.patch('/:id/assign', authenticate, isAdmin, assignComplaint);

export default router;