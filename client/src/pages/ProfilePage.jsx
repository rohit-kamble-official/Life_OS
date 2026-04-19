import { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, Mail, Phone, User, Trophy, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { BADGE_META, getLevelProgress, LEVEL_META } from '../utils/gamification';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    friend_email: user?.friend_email || '',
    parent_email: user?.parent_email || '',
    friend_whatsapp: user?.friend_whatsapp || '',
    parent_whatsapp: user?.parent_whatsapp || '',
  });
  const [saving, setSaving] = useState(false);
  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put('/auth/profile', form);
      updateUser(data.user);
      toast.success('Profile saved!');
    } catch { toast.error('Failed to save'); }
    finally { setSaving(false); }
  };

  const levelInfo = getLevelProgress(user?.xp || 0);
  const levelMeta = LEVEL_META[levelInfo.current] || LEVEL_META.Beginner;

  return (
    <div className="space-y-6 pb-8 max-w-lg">
      <div>
        <h1 className="font-display font-bold text-2xl text-white">Profile</h1>
        <p className="text-white/40 text-sm font-body mt-1">Your stats and accountability settings</p>
      </div>

      {/* Stats card */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="card p-6 text-center">
        <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-black mx-auto mb-4"
          style={{ background: `linear-gradient(135deg, ${levelMeta.color}, #0070ff)`, boxShadow: `0 0 30px ${levelMeta.color}40` }}>
          {user?.name?.[0]?.toUpperCase() || '?'}
        </div>
        <h2 className="font-display font-bold text-xl text-white">{user?.name}</h2>
        <p className="text-white/40 text-sm font-body">{user?.email}</p>
        <div className="flex justify-center gap-4 mt-4">
          <div className="text-center">
            <p className="font-display font-bold text-xl" style={{ color: levelMeta.color }}>{user?.xp || 0}</p>
            <p className="text-xs text-white/30">XP</p>
          </div>
          <div className="text-center">
            <p className="font-display font-bold text-xl text-yellow-400">🔥 {user?.currentStreak || 0}</p>
            <p className="text-xs text-white/30">Streak</p>
          </div>
          <div className="text-center">
            <p className="font-display font-bold text-xl text-white">{user?.totalCompleted || 0}</p>
            <p className="text-xs text-white/30">Tasks Done</p>
          </div>
        </div>

        {/* Level bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs font-mono mb-1.5">
            <span style={{ color: levelMeta.color }}>{levelInfo.current}</span>
            {levelInfo.next && <span className="text-white/30">{levelInfo.next} in {levelInfo.xpLeft} XP</span>}
          </div>
          <div className="progress-bar">
            <motion.div className="progress-fill" initial={{ width: 0 }}
              animate={{ width: `${levelInfo.pct}%` }} transition={{ duration: 1 }}
              style={{ background: `linear-gradient(90deg, ${levelMeta.color}, #0070ff)` }} />
          </div>
        </div>
      </motion.div>

      {/* Badges */}
      {user?.badges?.length > 0 && (
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Trophy size={16} className="text-yellow-400" />
            <h3 className="font-display font-semibold text-white">Badges Earned</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {user.badges.map(b => {
              const meta = BADGE_META[b];
              if (!meta) return null;
              return (
                <motion.div key={b} whileHover={{ scale: 1.03 }}
                  className="card p-3 flex items-center gap-3"
                  style={{ borderColor: 'rgba(251,191,36,0.2)', background: 'rgba(251,191,36,0.04)' }}>
                  <span className="text-2xl">{meta.emoji}</span>
                  <div>
                    <p className="font-display font-semibold text-sm text-yellow-400">{meta.label}</p>
                    <p className="text-xs text-white/40 font-body">{meta.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Edit form */}
      <form onSubmit={handleSave} className="card p-5 space-y-4">
        <h3 className="font-display font-semibold text-white flex items-center gap-2">
          <User size={16} className="text-cyan-400" /> Account Settings
        </h3>

        <div>
          <label className="block text-xs font-display font-medium text-white/50 uppercase tracking-wider mb-2">Display Name</label>
          <input value={form.name} onChange={set('name')} className="input-cyber" />
        </div>

        <div className="border-t border-white/5 pt-4">
          <div className="flex items-center gap-2 mb-3">
            <Mail size={14} className="text-cyan-400" />
            <p className="font-display font-semibold text-sm text-white">Accountability Emails</p>
          </div>
          <p className="text-xs text-white/40 font-body mb-3">Weekly reports will be sent to these addresses every Sunday.</p>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-display font-medium text-white/50 uppercase tracking-wider mb-2">Friend's Email</label>
              <input type="email" value={form.friend_email} onChange={set('friend_email')} placeholder="friend@example.com" className="input-cyber" />
            </div>
            <div>
              <label className="block text-xs font-display font-medium text-white/50 uppercase tracking-wider mb-2">Parent's Email</label>
              <input type="email" value={form.parent_email} onChange={set('parent_email')} placeholder="parent@example.com" className="input-cyber" />
            </div>
          </div>
        </div>

        <div className="border-t border-white/5 pt-4">
          <div className="flex items-center gap-2 mb-3">
            <Phone size={14} className="text-green-400" />
            <p className="font-display font-semibold text-sm text-white">WhatsApp Numbers</p>
          </div>
          <p className="text-xs text-white/40 font-body mb-3">Include country code (e.g. +917000000000)</p>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-display font-medium text-white/50 uppercase tracking-wider mb-2">Friend's WhatsApp</label>
              <input value={form.friend_whatsapp} onChange={set('friend_whatsapp')} placeholder="+91 98765 43210" className="input-cyber" />
            </div>
            <div>
              <label className="block text-xs font-display font-medium text-white/50 uppercase tracking-wider mb-2">Parent's WhatsApp</label>
              <input value={form.parent_whatsapp} onChange={set('parent_whatsapp')} placeholder="+91 98765 43210" className="input-cyber" />
            </div>
          </div>
        </div>

        <button type="submit" disabled={saving} className="btn-primary w-full flex items-center justify-center gap-2">
          {saving ? <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> : <Save size={16} />}
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>

      {/* Danger zone */}
      <div className="card p-4 text-center" style={{ borderColor: 'rgba(239,68,68,0.1)' }}>
        <p className="text-xs text-white/30 font-body">Member since {new Date(user?.createdAt || Date.now()).toLocaleDateString()}</p>
      </div>
    </div>
  );
}
