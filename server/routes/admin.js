import express from 'express';
import { getComplaintStats } from '../controllers/complaintController.js';
import { authenticate, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// All routes require admin access
router.use(authenticate, isAdmin);

// Admin-only routes
router.get('/complaints/stats', getComplaintStats);

export default router;