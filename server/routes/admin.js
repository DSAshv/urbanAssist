import express from 'express';
import { getComplaintStats } from '../controllers/complaintController.js';
import { authenticate, isAdmin } from '../middleware/auth.js';
import { getUsers } from '../controllers/userController.js';

const router = express.Router();

// All routes require admin access
router.use(authenticate, isAdmin);

// Admin-only routes
router.get('/complaints/stats', getComplaintStats);
router.get('/users', getUsers);

export default router;