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


// ==============================
// ✅ CORS (FINAL FIX)
// ==============================
const allowedOrigins = [
  'https://life-os-1-zcw0.onrender.com',
  'http://localhost:5173'
];

app.use(cors({
  origin: function (origin, callback) {
    // allow bots / no-origin requests (Google, Postman, etc.)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('❌ Blocked by CORS:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));


// ==============================
// Middleware
// ==============================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// ==============================
// Routes
// ==============================
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/challenges', challengeRoutes);
app.use('/api/reports', reportRoutes);


// ==============================
// ✅ SEO ROUTES (FINAL FIX)
// ==============================

// Sitemap (FIXED CONTENT-TYPE)
app.get('/sitemap.xml', (req, res) => {
  res.type('application/xml'); // ✅ IMPORTANT FIX

  res.status(200).send(`<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
      <loc>https://life-os-1-zcw0.onrender.com/</loc>
      <priority>1.0</priority>
    </url>
    <url>
      <loc>https://life-os-1-zcw0.onrender.com/login</loc>
    </url>
    <url>
      <loc>https://life-os-1-zcw0.onrender.com/signup</loc>
    </url>
  </urlset>`);
});


// Robots.txt
app.get('/robots.txt', (req, res) => {
  res.type('text/plain');

  res.send(`User-agent: *
Allow: /

Sitemap: https://life-os-1-zcw0.onrender.com/sitemap.xml`);
});


// ==============================
// Health check
// ==============================
app.get('/api/health', (_, res) =>
  res.json({ status: 'ok', timestamp: new Date() })
);


// ==============================
// Cron jobs
// ==============================
cron.schedule('0 20 * * 0', async () => {
  console.log('Running weekly report cron...');
});

cron.schedule('0 9 * * *', () => {
  console.log('Daily reminder triggered:', new Date().toISOString());
});


// ==============================
// DB + Server Start
// ==============================
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