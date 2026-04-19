import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import cron from 'node-cron';

import authRoutes from './routes/auth.js';
import taskRoutes from './routes/tasks.js';
import challengeRoutes from './routes/challenges.js';
import reportRoutes from './routes/reports.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();


// ✅ FINAL CORS FIX
const allowedOrigins = [
  'https://life-os-1-zcw0.onrender.com', // ✅ your frontend (IMPORTANT)
  'http://localhost:5173'
];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (Postman, mobile apps)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('❌ Blocked by CORS:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));


// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/challenges', challengeRoutes);
app.use('/api/reports', reportRoutes);


// Health check
app.get('/api/health', (_, res) =>
  res.json({ status: 'ok', timestamp: new Date() })
);


// Cron jobs
cron.schedule('0 20 * * 0', async () => {
  console.log('Running weekly report cron...');
});

cron.schedule('0 9 * * *', () => {
  console.log('Daily reminder triggered:', new Date().toISOString());
});


// Connect DB & Start
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/lifeos')
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () =>
      console.log(`🚀 Server running on port ${PORT}`)
    );
  })
  .catch(err => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });

export default app;
