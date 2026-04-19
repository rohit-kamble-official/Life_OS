import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Zap, Target, Flame, Trophy } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import TaskCard from '../components/TaskCard';
import AddTaskModal from '../components/AddTaskModal';
import { getDynamicMessage, getMemeForScore, CATEGORY_META, getLevelProgress, LEVEL_META } from '../utils/gamification';

const todayStr = () => new Date().toISOString().split('T')[0];

const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

export default function DashboardPage() {
  const { user, updateUser, refreshUser } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [filter, setFilter] = useState('all');
  const [selectedDate, setSelectedDate] = useState(todayStr());

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/tasks?date=${selectedDate}`);
      setTasks(data.tasks);
    } catch { toast.error('Failed to load tasks'); }
    finally { setLoading(false); }
  }, [selectedDate]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const completedCount = tasks.filter(t => t.completed).length;
  const totalCount = tasks.length;
  const score = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const dynamicMsg = getDynamicMessage(score);
  const meme = getMemeForScore(score);

  const filteredTasks = tasks.filter(t => {
    if (filter === 'all') return true;
    if (filter === 'done') return t.completed;
    if (filter === 'pending') return !t.completed;
    return t.category === filter;
  });

  const handleTaskUpdate = (updatedTask, updatedUser) => {
    setTasks(prev => prev.map(t => t._id === updatedTask._id ? updatedTask : t));
    if (updatedUser) updateUser(updatedUser);
  };

  const handleTaskDelete = (id) => setTasks(prev => prev.filter(t => t._id !== id));

  const handleTaskAdd = (task) => {
    setTasks(prev => [task, ...prev]);
    refreshUser();
  };

  const levelInfo = getLevelProgress(user?.xp || 0);
  const levelMeta = LEVEL_META[levelInfo.current] || LEVEL_META.Beginner;

  const scoreColor = score >= 80 ? '#34d399' : score >= 60 ? '#00e5ff' : score >= 40 ? '#fbbf24' : '#ef4444';

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-white">
            Hey, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-white/40 text-sm font-body mt-1">{formatDate(selectedDate)}</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={16} /> New Task
        </button>
      </div>

      {/* Date picker */}
      <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
        className="input-cyber text-sm py-2 max-w-xs" max={todayStr()} />

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: '⚡', label: 'XP', value: user?.xp || 0, color: '#00e5ff' },
          { icon: '🔥', label: 'Streak', value: `${user?.currentStreak || 0}d`, color: '#fbbf24' },
          { icon: '✅', label: 'Today', value: `${completedCount}/${totalCount}`, color: '#34d399' },
          { icon: '🏆', label: 'Level', value: levelInfo.current, color: levelMeta.color },
        ].map(({ icon, label, value, color }) => (
          <motion.div key={label} whileHover={{ scale: 1.02 }} className="card p-4 text-center">
            <p className="text-2xl mb-1">{icon}</p>
            <p className="font-display font-bold text-lg" style={{ color }}>{value}</p>
            <p className="text-xs text-white/40 font-body mt-0.5">{label}</p>
          </motion.div>
        ))}
      </div>

      {/* Discipline score */}
      <motion.div className="card p-5" whileHover={{ borderColor: 'rgba(0,229,255,0.2)' }}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="font-display font-bold text-sm text-white/50 uppercase tracking-wider">Discipline Score</p>
            <motion.p key={score} initial={{ scale: 1.3 }} animate={{ scale: 1 }}
              className="font-display font-bold text-4xl mt-1" style={{ color: scoreColor }}>
              {score}%
            </motion.p>
          </div>
          <div className="text-right">
            <p className="text-2xl">{meme.emoji}</p>
            <p className="font-display font-bold text-xs mt-1" style={{ color: scoreColor }}>{meme.text}</p>
            <p className="text-xs text-white/30 font-body">{meme.sub}</p>
          </div>
        </div>
        <div className="progress-bar">
          <motion.div className="progress-fill" initial={{ width: 0 }}
            animate={{ width: `${score}%` }} transition={{ duration: 0.8, ease: 'easeOut' }}
            style={{ background: `linear-gradient(90deg, ${scoreColor}, ${scoreColor}aa)` }} />
        </div>
        <motion.p key={dynamicMsg.msg} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="text-sm font-body mt-3" style={{ color: dynamicMsg.color }}>
          {dynamicMsg.msg}
        </motion.p>
      </motion.div>

      {/* XP level bar */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-display font-medium" style={{ color: levelMeta.color }}>{levelInfo.current}</span>
          {levelInfo.next && <span className="text-xs text-white/30 font-body">{levelInfo.xpLeft} XP to {levelInfo.next}</span>}
        </div>
        <div className="progress-bar">
          <motion.div className="progress-fill" initial={{ width: 0 }}
            animate={{ width: `${levelInfo.pct}%` }} transition={{ duration: 1, delay: 0.2 }}
            style={{ background: `linear-gradient(90deg, ${levelMeta.color}, #0070ff)` }} />
        </div>
      </div>

      {/* Badges */}
      {user?.badges?.length > 0 && (
        <div className="card p-4">
          <p className="text-xs font-display font-medium text-white/50 uppercase tracking-wider mb-3">Badges</p>
          <div className="flex flex-wrap gap-2">
            {user.badges.map(b => (
              <motion.div key={b} whileHover={{ scale: 1.1 }}
                className="px-3 py-1.5 rounded-full text-xs font-display font-medium"
                style={{ background: 'rgba(0,229,255,0.1)', border: '1px solid rgba(0,229,255,0.2)', color: '#00e5ff' }}>
                {b === 'first_task' ? '⭐ First Step' :
                 b === 'ten_tasks' ? '🔟 10 Tasks' :
                 b === 'fifty_tasks' ? '🏆 Task Machine' :
                 b === 'week_streak' ? '🔥 On Fire' :
                 b === 'legend_streak' ? '👑 Unstoppable' :
                 b === 'warrior' ? '⚔️ Warrior' :
                 b === 'legend' ? '🌟 Legend' : b}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Tasks section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-bold text-lg text-white">Tasks</h2>
          <span className="font-mono text-xs text-white/40">{completedCount}/{totalCount} done</span>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 flex-wrap mb-4">
          {[
            { key: 'all', label: 'All' },
            { key: 'pending', label: 'Pending' },
            { key: 'done', label: 'Done' },
            ...Object.entries(CATEGORY_META).map(([k, v]) => ({ key: k, label: `${v.emoji} ${v.label}` }))
          ].map(({ key, label }) => (
            <button key={key} onClick={() => setFilter(key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-display font-medium transition-all duration-150 ${
                filter === key
                  ? 'bg-cyan-400/15 text-cyan-400 border border-cyan-400/30'
                  : 'text-white/40 border border-white/08 hover:text-white/70 hover:border-white/15'
              }`}>
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 rounded-2xl animate-pulse" style={{ background: 'rgba(255,255,255,0.04)' }} />
            ))}
          </div>
        ) : filteredTasks.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="card p-10 text-center">
            <p className="text-4xl mb-3">📋</p>
            <p className="font-display font-medium text-white/50">
              {filter === 'all' ? 'No tasks yet. Add one!' : `No ${filter} tasks`}
            </p>
            {filter === 'all' && (
              <button onClick={() => setShowAdd(true)} className="btn-cyber mt-4 mx-auto flex items-center gap-2">
                <Plus size={14} /> Add First Task
              </button>
            )}
          </motion.div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {filteredTasks.map(task => (
                <TaskCard key={task._id} task={task} onUpdate={handleTaskUpdate} onDelete={handleTaskDelete} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Add Task Modal */}
      <AnimatePresence>
        {showAdd && <AddTaskModal onClose={() => setShowAdd(false)} onAdd={handleTaskAdd} />}
      </AnimatePresence>
    </div>
  );
}
