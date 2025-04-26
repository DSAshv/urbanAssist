import express from 'express';
import { authenticate, isAdmin } from '../middleware/auth.js';
import { uploadImage, handleUploadError } from '../middleware/upload.js';

const router = express.Router();

// User profile routes
router.get('/profile', authenticate, (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      user: req.user
    }
  });
});

// Update profile route will be implemented here
router.patch('/profile', authenticate, uploadImage, handleUploadError, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Profile updated successfully'
  });
});

export default router;