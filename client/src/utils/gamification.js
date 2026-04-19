export const CATEGORY_META = {
  coding: { label: 'Coding', emoji: '💻', color: '#00e5ff', bg: 'rgba(0,229,255,0.1)', border: 'rgba(0,229,255,0.3)' },
  study: { label: 'Study', emoji: '📚', color: '#a78bfa', bg: 'rgba(167,139,250,0.1)', border: 'rgba(167,139,250,0.3)' },
  fitness: { label: 'Fitness', emoji: '🏃', color: '#34d399', bg: 'rgba(52,211,153,0.1)', border: 'rgba(52,211,153,0.3)' },
  personal_growth: { label: 'Personal Growth', emoji: '🧠', color: '#fbbf24', bg: 'rgba(251,191,36,0.1)', border: 'rgba(251,191,36,0.3)' },
};

export const BADGE_META = {
  first_task:    { emoji: '⭐', label: 'First Step', desc: 'Complete your first task' },
  ten_tasks:     { emoji: '🔟', label: 'Gaining Momentum', desc: 'Complete 10 tasks' },
  fifty_tasks:   { emoji: '🏆', label: 'Task Machine', desc: 'Complete 50 tasks' },
  week_streak:   { emoji: '🔥', label: 'On Fire', desc: '7-day streak' },
  legend_streak: { emoji: '👑', label: 'Unstoppable', desc: '21-day streak' },
  warrior:       { emoji: '⚔️', label: 'Warrior', desc: 'Reach 200 XP' },
  legend:        { emoji: '🌟', label: 'Legend', desc: 'Reach 500 XP' },
};

export const LEVEL_META = {
  Beginner: { color: '#6b7280', gradient: 'from-gray-500 to-gray-600', next: 'Warrior', xpNeeded: 200 },
  Warrior:  { color: '#a78bfa', gradient: 'from-violet-500 to-purple-600', next: 'Legend', xpNeeded: 500 },
  Legend:   { color: '#fbbf24', gradient: 'from-yellow-400 to-orange-500', next: null, xpNeeded: null },
};

export const getDynamicMessage = (score) => {
  if (score === 100) return { msg: "PERFECT DAY! You're an absolute legend 👑🔥", color: '#fbbf24' };
  if (score >= 80)  return { msg: "You're unstoppable today 🔥 Keep this energy!", color: '#34d399' };
  if (score >= 60)  return { msg: "Solid progress ⚡ Finish strong!", color: '#00e5ff' };
  if (score >= 40)  return { msg: "You're halfway there 💪 Don't stop now!", color: '#a78bfa' };
  if (score >= 20)  return { msg: "Bro… you can do way better than this 😤", color: '#fbbf24' };
  if (score > 0)    return { msg: "Your future self is disappointed 😭 Get moving!", color: '#f87171' };
  return { msg: "Bro… you skipped everything again? 💀 Wake up!", color: '#ef4444' };
};

export const getMemeForScore = (score) => {
  if (score >= 80) return { emoji: '🔥', text: 'SIGMA GRINDSET ACTIVATED', sub: 'You are built different' };
  if (score >= 60) return { emoji: '💪', text: 'ABOVE AVERAGE HUMAN', sub: 'The gym noticed you' };
  if (score >= 40) return { emoji: '😐', text: 'MEDIOCRITY SPEED-RUN', sub: 'You could be doing more' };
  if (score >= 20) return { emoji: '💀', text: 'PROCRASTINATION BOSS', sub: 'Achievement unlocked: Excuses' };
  return { emoji: '🪦', text: 'RIP PRODUCTIVITY', sub: 'Cause of death: Comfort zone' };
};

export const getLevelProgress = (xp) => {
  if (xp < 200) return { pct: (xp / 200) * 100, current: 'Beginner', next: 'Warrior', xpLeft: 200 - xp };
  if (xp < 500) return { pct: ((xp - 200) / 300) * 100, current: 'Warrior', next: 'Legend', xpLeft: 500 - xp };
  return { pct: 100, current: 'Legend', next: null, xpLeft: 0 };
};
