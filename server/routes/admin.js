import express from 'express';
import { getComplaintStats } from '../controllers/complaintController.js';
import { authenticate, isAdmin } from '../middleware/auth.js';
import { getUsers } from '../controllers/userController.js';
import { createUser, editUser } from '../controllers/userController.js';
import { suspendUser, unsuspendUser } from '../controllers/userController.js';
import { getEnvVariables, updateEnvVariables } from '../controllers/settingscontroller.js';

const router = express.Router();

// All routes require admin access
router.use(authenticate, isAdmin);

// Admin-only routes
router.get('/complaints/stats', getComplaintStats);
router.get('/users', getUsers);

// Route to create a new user
router.post('/users', createUser);

// Route to edit an existing user
router.put('/users/:userId', editUser);

// Route to suspend a user
router.post('/users/:userId/suspend', suspendUser);

// Route to unsuspend a user
router.post('/users/:userId/unsuspend', unsuspendUser);

router.get('/settings', getEnvVariables);
router.post('/settings', updateEnvVariables);


export default router;