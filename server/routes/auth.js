import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, friend_email, parent_email } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'All fields required' });
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already in use' });
    const user = await User.create({ name, email, password, friend_email, parent_email });
    res.status(201).json({ token: signToken(user._id), user: { _id: user._id, name, email, xp: 0, level: 'Beginner', badges: [], currentStreak: 0 } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    res.json({
      token: signToken(user._id),
      user: { _id: user._id, name: user.name, email: user.email, xp: user.xp, level: user.level, badges: user.badges, currentStreak: user.currentStreak, longestStreak: user.longestStreak, friend_email: user.friend_email, parent_email: user.parent_email, friend_whatsapp: user.friend_whatsapp, parent_whatsapp: user.parent_whatsapp }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/auth/me
router.get('/me', protect, (req, res) => {
  res.json({ user: req.user });
});

// PUT /api/auth/profile
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, friend_email, parent_email, friend_whatsapp, parent_whatsapp } = req.body;
    const user = await User.findByIdAndUpdate(req.user._id, { name, friend_email, parent_email, friend_whatsapp, parent_whatsapp }, { new: true }).select('-password');
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
