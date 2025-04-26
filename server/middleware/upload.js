import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create uploads directory if it doesn't exist
const uploadDir = process.env.UPLOAD_DIR || path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Set storage engine
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    // Use a unique filename: timestamp + user ID (if available) + original name
    const userId = req.user ? req.user._id : 'anonymous';
    const uniquePrefix = `${Date.now()}-${userId}`;
    cb(null, `${uniquePrefix}-${file.originalname.replace(/\s+/g, '-')}`);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // Accept images only
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
    return cb(new Error('Only image files are allowed!'), false);
  }
  cb(null, true);
};

// File size limit from env or default to 5MB
const maxSize = process.env.MAX_FILE_SIZE || 5 * 1024 * 1024;

// Initialize upload
export const upload = multer({
  storage: storage,
  limits: { fileSize: maxSize },
  fileFilter: fileFilter
});

// Middleware to handle multiple image uploads
export const uploadImages = upload.array('images', 5);

// Middleware to handle single image upload
export const uploadImage = upload.single('image');

// Middleware to handle error from multer
export const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: `File size too large. Maximum file size is ${maxSize / (1024 * 1024)}MB.`
      });
    }
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  
  if (err) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  
  next();
};