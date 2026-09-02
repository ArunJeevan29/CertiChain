import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import { securityMiddleware } from './middleware/securityMiddleware.js';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';

dotenv.config();

const app = express();

// Apply security middleware (helmet, cors, rate limiter)
securityMiddleware(app);

// JSON request parsing
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'success', message: 'Backend is running and database is connected.' });
});

import authRoutes from './routes/authRoutes.js';
import testRoutes from './routes/testRoutes.js';
import studentRoutes from './routes/studentRoutes.js';

// Apply error handling middleware
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api', testRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Connect to MongoDB Atlas, then start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
});
