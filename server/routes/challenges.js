import express from 'express';
import Challenge from '../models/Challenge.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

const CHALLENGE_CONFIGS = {
  '7day_coding': { name: '7-Day Coding Challenge', durationDays: 7 },
  '21day_discipline': { name: '21-Day Discipline Challenge', durationDays: 21 },
  '30day_transformation': { name: '30-Day Transformation', durationDays: 30 }
};

// GET /api/challenges
router.get('/', protect, async (req, res) => {
  try {
    const challenges = await Challenge.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ challenges });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/challenges/start
router.post('/start', protect, async (req, res) => {
  try {
    const { type, strictMode = true } = req.body;
    const config = CHALLENGE_CONFIGS[type];
    if (!config) return res.status(400).json({ message: 'Invalid challenge type' });

    const existing = await Challenge.findOne({ user: req.user._id, type, status: 'active' });
    if (existing) return res.status(400).json({ message: 'Challenge already active' });

    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + config.durationDays);

    const challenge = await Challenge.create({
      user: req.user._id,
      type,
      name: config.name,
      durationDays: config.durationDays,
      startDate,
      endDate,
      strictMode
    });
    res.status(201).json({ challenge });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/challenges/:id/checkin
router.post('/:id/checkin', protect, async (req, res) => {
  try {
    const challenge = await Challenge.findOne({ _id: req.params.id, user: req.user._id });
    if (!challenge) return res.status(404).json({ message: 'Challenge not found' });
    if (challenge.status !== 'active') return res.status(400).json({ message: 'Challenge not active' });

    const today = new Date().toISOString().split('T')[0];
    if (challenge.completedDays.includes(today)) {
      return res.status(400).json({ message: 'Already checked in today' });
    }

    challenge.completedDays.push(today);
    challenge.totalDaysCompleted += 1;

    // Calculate streak
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (challenge.completedDays.includes(yesterdayStr)) {
      challenge.currentStreak += 1;
    } else {
      challenge.currentStreak = 1;
    }

    if (challenge.currentStreak > challenge.longestStreak) {
      challenge.longestStreak = challenge.currentStreak;
    }

    // Check completion
    if (challenge.totalDaysCompleted >= challenge.durationDays) {
      challenge.status = 'completed';
    }

    await challenge.save();
    res.json({ challenge });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/challenges/:id/miss
router.post('/:id/miss', protect, async (req, res) => {
  try {
    const challenge = await Challenge.findOne({ _id: req.params.id, user: req.user._id });
    if (!challenge) return res.status(404).json({ message: 'Challenge not found' });

    const today = new Date().toISOString().split('T')[0];
    if (!challenge.missedDays.includes(today)) {
      challenge.missedDays.push(today);
    }

    if (challenge.strictMode) {
      challenge.currentStreak = 0;
    }

    await challenge.save();
    res.json({ challenge });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/challenges/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    await Challenge.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ message: 'Challenge removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
