import express from 'express';
import { 
  register, 
  login, 
  logout, 
  setupMFA, 
  verifyAndEnableMFA, 
  disableMFA, 
  refreshToken, 
  getCurrentUser 
} from '../controllers/authController.js';
import { authenticate, verifyRefreshToken } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/refresh-token', verifyRefreshToken, refreshToken);

// Protected routes
router.get('/me', authenticate, getCurrentUser);
router.post('/logout', authenticate, logout);
router.post('/mfa/setup', authenticate, setupMFA);
router.post('/mfa/verify', authenticate, verifyAndEnableMFA);
router.post('/mfa/disable', authenticate, disableMFA);

export default router;