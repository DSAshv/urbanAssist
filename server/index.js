import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import apiRouter from './api/index.js';
import axios from 'axios';

// Initialize environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json()); // <-- Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // <-- Parse URL-encoded bodies

app.get('/api/reverse-geocode', async (req, res) => {
  const { lat, lon } = req.query;
  try {
    const response = await axios.get(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`
    );
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch geocode' });
  }
});

// API route to send push notification
app.post('/api/send-notification', async (req, res) => {
  const { token, title, body } = req.body;

  try {
    await sendPushNotification(token, title, body);
    res.status(200).send({ message: 'Notification sent successfully' });
  } catch (error) {
    res.status(500).send({ error: 'Failed to send notification' });
  }
});


// Get __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL,   // <-- allow frontend origin only
  credentials: true                  // <CLIENT_URL-- allow sending cookies
}));

// After you create `app`
app.use(cookieParser());

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
