import express from 'express';
import Task from '../models/Task.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Multer setup for proof uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/proofs';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `${req.user._id}-${Date.now()}${path.extname(file.originalname)}`);
  }
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

const updateUserXP = async (userId, xpDelta) => {
  const user = await User.findById(userId);
  if (!user) return;
  user.xp = Math.max(0, user.xp + xpDelta);
  user.updateLevel();
  user.checkBadges();
  await user.save();
  return user;
};

// GET /api/tasks?date=YYYY-MM-DD
router.get('/', protect, async (req, res) => {
  try {
    const { date } = req.query;
    const query = { user: req.user._id };
    if (date) query.date = date;
    const tasks = await Task.find(query).sort({ createdAt: -1 });
    res.json({ tasks });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/tasks/range?start=YYYY-MM-DD&end=YYYY-MM-DD
router.get('/range', protect, async (req, res) => {
  try {
    const { start, end } = req.query;
    const tasks = await Task.find({
      user: req.user._id,
      date: { $gte: start, $lte: end }
    });
    res.json({ tasks });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/tasks
router.post('/', protect, async (req, res) => {
  try {
    const { title, description, category, date, codingHours, notes } = req.body;
    const task = await Task.create({ user: req.user._id, title, description, category, date, codingHours, notes });
    res.status(201).json({ task });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/tasks/:id
router.put('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const wasCompleted = task.completed;
    const { title, description, category, completed, codingHours, notes } = req.body;

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (category !== undefined) task.category = category;
    if (codingHours !== undefined) task.codingHours = codingHours;
    if (notes !== undefined) task.notes = notes;

    let updatedUser = null;
    if (completed !== undefined && completed !== wasCompleted) {
      task.completed = completed;
      task.completedAt = completed ? new Date() : null;

      if (completed) {
        task.xpEarned = 10;
        updatedUser = await updateUserXP(req.user._id, 10);
        const user = await User.findById(req.user._id);
        user.totalCompleted = (user.totalCompleted || 0) + 1;
        await user.save();
      } else {
        task.xpEarned = 0;
        updatedUser = await updateUserXP(req.user._id, -5);
        const user = await User.findById(req.user._id);
        user.totalMissed = (user.totalMissed || 0) + 1;
        await user.save();
      }
    }

    await task.save();
    res.json({ task, user: updatedUser });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/tasks/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/tasks/:id/proof
router.post('/:id/proof', protect, upload.single('proof'), async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    task.proofFile = {
      url: `/uploads/proofs/${req.file.filename}`,
      filename: req.file.originalname,
      mimetype: req.file.mimetype
    };
    await task.save();
    res.json({ task });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
