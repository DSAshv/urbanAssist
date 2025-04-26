import express from 'express';
import authRoutes from '../routes/auth.js';
import complaintRoutes from '../routes/complaints.js';
import adminRoutes from '../routes/admin.js';
import userRoutes from '../routes/users.js';

const router = express.Router();

// Mount routes
router.use('/auth', authRoutes);
router.use('/complaints', complaintRoutes);
router.use('/admin', adminRoutes);
router.use('/users', userRoutes);

export default router;