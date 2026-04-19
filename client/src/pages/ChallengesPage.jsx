import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Flame, Play, Trash2, CheckCircle, AlertCircle, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';

const CHALLENGE_CONFIGS = {
  '7day_coding': {
    name: '7-Day Coding Challenge',
    emoji: '💻',
    desc: 'Code every single day for 7 days straight.',
    days: 7,
    color: '#00e5ff',
    gradient: 'from-cyan-500/20 to-blue-500/20',
    border: 'rgba(0,229,255,0.3)',
  },
  '21day_discipline': {
    name: '21-Day Discipline Challenge',
    emoji: '⚔️',
    desc: 'Build unbreakable habits over 21 days. It takes 21 days to form a habit.',
    days: 21,
    color: '#a78bfa',
    gradient: 'from-violet-500/20 to-purple-500/20',
    border: 'rgba(167,139,250,0.3)',
  },
  '30day_transformation': {
    name: '30-Day Transformation',
    emoji: '🔥',
    desc: 'Transform your life completely in 30 days of consistent action.',
    days: 30,
    color: '#fbbf24',
    gradient: 'from-yellow-500/20 to-orange-500/20',
    border: 'rgba(251,191,36,0.3)',
  },
};

function ChallengeCard({ challenge, onCheckin, onMiss, onDelete }) {
  const config = CHALLENGE_CONFIGS[challenge.type];
  const today = new Date().toISOString().split('T')[0];
  const checkedInToday = challenge.completedDays?.includes(today);
  const progressPct = Math.round((challenge.totalDaysCompleted / challenge.durationDays) * 100);

  const daysLeft = Math.max(0, Math.ceil((new Date(challenge.endDate) - new Date()) / (1000 * 60 * 60 * 24)));

  return (
    <motion.div layout className="card p-5" style={{ borderColor: config.border, background: `rgba(0,0,0,0.3)` }}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{config.emoji}</span>
          <div>
            <p className="font-display font-bold text-white">{config.name}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-mono px-2 py-0.5 rounded-full"
                style={{ background: challenge.status === 'active' ? 'rgba(52,211,153,0.1)' : challenge.status === 'completed' ? 'rgba(251,191,36,0.1)' : 'rgba(239,68,68,0.1)', color: challenge.status === 'active' ? '#34d399' : challenge.status === 'completed' ? '#fbbf24' : '#ef4444', border: '1px solid currentColor' }}>
                {challenge.status}
              </span>
              {challenge.strictMode && (
                <span className="text-xs font-mono px-2 py-0.5 rounded-full text-red-400 border border-red-400/30 bg-red-400/10">⚡ strict</span>
              )}
            </div>
          </div>
        </div>
        <button onClick={() => onDelete(challenge._id)} className="p-2 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-400/10 transition-all">
          <Trash2 size={14} />
        </button>
      </div>

      {/* Streak */}
      <div className="grid grid-cols-3 gap-3 my-4">
        <div className="text-center card p-3" style={{ borderColor: 'rgba(251,191,36,0.15)', background: 'rgba(251,191,36,0.05)' }}>
          <p className="text-xl">🔥</p>
          <p className="font-display font-bold text-yellow-400">{challenge.currentStreak}</p>
          <p className="text-xs text-white/30">streak</p>
        </div>
        <div className="text-center card p-3">
          <p className="text-xl">📅</p>
          <p className="font-display font-bold text-white">{challenge.totalDaysCompleted}/{challenge.durationDays}</p>
          <p className="text-xs text-white/30">days done</p>
        </div>
        <div className="text-center card p-3">
          <p className="text-xl">⏳</p>
          <p className="font-display font-bold text-white">{daysLeft}</p>
          <p className="text-xs text-white/30">days left</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs font-mono text-white/40 mb-1.5">
          <span>Progress</span><span>{progressPct}%</span>
        </div>
        <div className="progress-bar">
          <motion.div className="progress-fill" initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }} transition={{ duration: 0.8 }}
            style={{ background: `linear-gradient(90deg, ${config.color}, ${config.color}88)` }} />
        </div>
      </div>

      {/* Day dots */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {Array.from({ length: challenge.durationDays }).map((_, i) => {
          const d = new Date(challenge.startDate);
          d.setDate(d.getDate() + i);
          const dateStr = d.toISOString().split('T')[0];
          const done = challenge.completedDays?.includes(dateStr);
          const missed = challenge.missedDays?.includes(dateStr);
          const isFuture = dateStr > today;
          return (
            <div key={i} className="w-4 h-4 rounded-sm transition-all"
              style={{
                background: done ? config.color : missed ? '#ef4444' : isFuture ? 'rgba(255,255,255,0.06)' : 'rgba(239,68,68,0.3)',
                opacity: isFuture ? 0.4 : 1,
              }} title={dateStr} />
          );
        })}
      </div>

      {/* Actions */}
      {challenge.status === 'active' && (
        <div className="flex gap-2">
          <button onClick={() => onCheckin(challenge._id)} disabled={checkedInToday}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-display font-semibold transition-all"
            style={{
              background: checkedInToday ? 'rgba(52,211,153,0.1)' : `linear-gradient(135deg, ${config.color}, ${config.color}aa)`,
              color: checkedInToday ? '#34d399' : '#000',
              border: checkedInToday ? '1px solid rgba(52,211,153,0.3)' : 'none',
              cursor: checkedInToday ? 'default' : 'pointer',
            }}>
            {checkedInToday ? <><CheckCircle size={16} /> Done for today!</> : <><CheckCircle size={16} /> Check In</>}
          </button>
          {!checkedInToday && (
            <button onClick={() => onMiss(challenge._id)}
              className="px-4 py-2.5 rounded-xl text-sm font-display font-semibold text-red-400 border border-red-400/20 hover:bg-red-400/10 transition-all">
              <AlertCircle size={16} />
            </button>
          )}
        </div>
      )}

      {challenge.status === 'completed' && (
        <div className="text-center py-3">
          <p className="text-2xl">🏆</p>
          <p className="font-display font-bold text-yellow-400 mt-1">Challenge Completed!</p>
        </div>
      )}
    </motion.div>
  );
}

export default function ChallengesPage() {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/challenges')
      .then(({ data }) => setChallenges(data.challenges))
      .catch(() => toast.error('Failed to load challenges'))
      .finally(() => setLoading(false));
  }, []);

  const startChallenge = async (type) => {
    try {
      const { data } = await api.post('/challenges/start', { type, strictMode: true });
      setChallenges(prev => [data.challenge, ...prev]);
      toast.success(`${CHALLENGE_CONFIGS[type].name} started! 🔥`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to start');
    }
  };

  const checkin = async (id) => {
    try {
      const { data } = await api.post(`/challenges/${id}/checkin`);
      setChallenges(prev => prev.map(c => c._id === id ? data.challenge : c));
      toast.success('Day checked in! 🔥 Keep the streak!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const miss = async (id) => {
    try {
      const { data } = await api.post(`/challenges/${id}/miss`);
      setChallenges(prev => prev.map(c => c._id === id ? data.challenge : c));
      toast('Streak reset 💀 Don\'t let it happen again!', { icon: '⚠️' });
    } catch { toast.error('Failed'); }
  };

  const deleteChallenge = async (id) => {
    try {
      await api.delete(`/challenges/${id}`);
      setChallenges(prev => prev.filter(c => c._id !== id));
      toast.success('Challenge removed');
    } catch { toast.error('Failed'); }
  };

  const activeChallengeTypes = challenges.filter(c => c.status === 'active').map(c => c.type);

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="font-display font-bold text-2xl text-white">Challenges</h1>
        <p className="text-white/40 text-sm font-body mt-1">Pick a challenge. Commit. Don't break the chain.</p>
      </div>

      {/* Available challenges */}
      <div>
        <h2 className="font-display font-semibold text-sm text-white/50 uppercase tracking-wider mb-3">Start a Challenge</h2>
        <div className="grid gap-3">
          {Object.entries(CHALLENGE_CONFIGS).map(([type, config]) => {
            const isActive = activeChallengeTypes.includes(type);
            return (
              <motion.div key={type} whileHover={{ scale: isActive ? 1 : 1.01 }}
                className="card p-4 flex items-center gap-4"
                style={{ borderColor: isActive ? config.border : 'rgba(255,255,255,0.06)', background: isActive ? `rgba(0,0,0,0.4)` : 'rgba(255,255,255,0.03)' }}>
                <span className="text-3xl flex-shrink-0">{config.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-display font-bold text-white text-sm">{config.name}</p>
                  <p className="text-xs text-white/40 font-body mt-0.5">{config.desc}</p>
                  <p className="text-xs font-mono mt-1" style={{ color: config.color }}>{config.days} days</p>
                </div>
                <button onClick={() => !isActive && startChallenge(type)} disabled={isActive}
                  className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-display font-semibold transition-all"
                  style={{
                    background: isActive ? 'rgba(52,211,153,0.1)' : `linear-gradient(135deg, ${config.color}, ${config.color}88)`,
                    color: isActive ? '#34d399' : '#000',
                    border: isActive ? '1px solid rgba(52,211,153,0.2)' : 'none',
                    cursor: isActive ? 'default' : 'pointer',
                  }}>
                  {isActive ? <><Lock size={12} /> Active</> : <><Play size={12} /> Start</>}
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Active / past challenges */}
      {challenges.length > 0 && (
        <div>
          <h2 className="font-display font-semibold text-sm text-white/50 uppercase tracking-wider mb-3">Your Challenges</h2>
          {loading ? (
            <div className="h-40 rounded-2xl animate-pulse" style={{ background: 'rgba(255,255,255,0.04)' }} />
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {challenges.map(c => (
                  <ChallengeCard key={c._id} challenge={c} onCheckin={checkin} onMiss={miss} onDelete={deleteChallenge} />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
