import express from 'express';
import Task from '../models/Task.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
import { sendWeeklyEmail, sendWhatsApp, generateMotivationalSummary } from '../utils/notifications.js';

const router = express.Router();

const getDateRange = (weeksAgo = 0) => {
  const now = new Date();
  const end = new Date(now);
  end.setDate(end.getDate() - weeksAgo * 7);
  const start = new Date(end);
  start.setDate(start.getDate() - 7);
  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0]
  };
};

// GET /api/reports/weekly
router.get('/weekly', protect, async (req, res) => {
  try {
    const { start, end } = getDateRange(0);
    const { start: prevStart, end: prevEnd } = getDateRange(1);

    const [tasks, prevTasks, user] = await Promise.all([
      Task.find({ user: req.user._id, date: { $gte: start, $lte: end } }),
      Task.find({ user: req.user._id, date: { $gte: prevStart, $lte: prevEnd } }),
      User.findById(req.user._id)
    ]);

    const completedTasks = tasks.filter(t => t.completed).length;
    const totalTasks = tasks.length;
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    const prevCompleted = prevTasks.filter(t => t.completed).length;
    const prevTotal = prevTasks.length;
    const prevCompletionRate = prevTotal > 0 ? (prevCompleted / prevTotal) * 100 : 0;

    const codingHours = tasks
      .filter(t => t.category === 'coding' && t.completed)
      .reduce((sum, t) => sum + (t.codingHours || 0), 0);

    const xpEarned = tasks.filter(t => t.completed).length * 10;

    // Daily breakdown for charts
    const dailyData = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayTasks = tasks.filter(t => t.date === dateStr);
      dailyData[dateStr] = {
        total: dayTasks.length,
        completed: dayTasks.filter(t => t.completed).length,
        rate: dayTasks.length > 0 ? Math.round((dayTasks.filter(t => t.completed).length / dayTasks.length) * 100) : 0
      };
    }

    // Category breakdown
    const categories = { coding: 0, study: 0, fitness: 0, personal_growth: 0 };
    tasks.filter(t => t.completed).forEach(t => { if (categories[t.category] !== undefined) categories[t.category]++; });

    const stats = { completionRate, prevCompletionRate, completedTasks, totalTasks, codingHours, streak: user.currentStreak, xpEarned };
    const summary = generateMotivationalSummary(stats);

    res.json({ stats, summary, dailyData, categories, period: { start, end } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/reports/send
router.post('/send', protect, async (req, res) => {
  try {
    const { start, end } = getDateRange(0);
    const { start: prevStart, end: prevEnd } = getDateRange(1);

    const [tasks, prevTasks, user] = await Promise.all([
      Task.find({ user: req.user._id, date: { $gte: start, $lte: end } }),
      Task.find({ user: req.user._id, date: { $gte: prevStart, $lte: prevEnd } }),
      User.findById(req.user._id)
    ]);

    const completedTasks = tasks.filter(t => t.completed).length;
    const totalTasks = tasks.length;
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    const prevCompleted = prevTasks.filter(t => t.completed).length;
    const prevTotal = prevTasks.length;
    const prevCompletionRate = prevTotal > 0 ? (prevCompleted / prevTotal) * 100 : 0;
    const codingHours = tasks.filter(t => t.category === 'coding' && t.completed).reduce((s, t) => s + (t.codingHours || 0), 0);
    const xpEarned = completedTasks * 10;

    const stats = { completionRate, prevCompletionRate, completedTasks, totalTasks, codingHours, streak: user.currentStreak, xpEarned };
    const summary = generateMotivationalSummary(stats);

    const emailTargets = [user.friend_email, user.parent_email].filter(Boolean);
    const results = { emails: [], whatsapp: [] };

    for (const email of emailTargets) {
      try {
        await sendWeeklyEmail({ to: email, userName: user.name, stats, summary });
        results.emails.push({ to: email, success: true });
      } catch (e) {
        results.emails.push({ to: email, success: false, error: e.message });
      }
    }

    const waTargets = [user.friend_whatsapp, user.parent_whatsapp].filter(Boolean);
    const waMessage = `⚡ LifeOS Weekly Report for ${user.name}\n\n✅ Completion: ${completionRate.toFixed(0)}%\n📋 Tasks: ${completedTasks}/${totalTasks}\n💻 Coding: ${codingHours}h\n🔥 Streak: ${user.currentStreak} days\n\n${summary}`;

    for (const phone of waTargets) {
      try {
        await sendWhatsApp(phone, waMessage);
        results.whatsapp.push({ to: phone, success: true });
      } catch (e) {
        results.whatsapp.push({ to: phone, success: false, error: e.message });
      }
    }

    res.json({ message: 'Reports sent', results });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
