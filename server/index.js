import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import apiRouter from './api/index.js';

// Initialize environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json()); // <-- Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // <-- Parse URL-encoded bodies

// Get __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CORS configuration
app.use(cors({
  origin: 'http://localhost:5173',   // <-- allow frontend origin only
  credentials: true                  // <-- allow sending cookies
}));

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API routes
app.use('/api', apiRouter);

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('🔥', err.stack);
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'development' ? err.message : 'Server error',
  });
});

// Handle 404 - Not Found
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

export default app;
