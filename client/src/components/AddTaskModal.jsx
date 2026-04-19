import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Plus } from 'lucide-react';
import { CATEGORY_META } from '../utils/gamification';
import api from '../utils/api';
import toast from 'react-hot-toast';

const today = () => new Date().toISOString().split('T')[0];

export default function AddTaskModal({ onClose, onAdd }) {
  const [form, setForm] = useState({
    title: '', description: '', category: 'coding',
    date: today(), codingHours: 0, notes: ''
  });
  const [loading, setLoading] = useState(false);
  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error('Title required');
    setLoading(true);
    try {
      const { data } = await api.post('/tasks', form);
      onAdd(data.task);
      toast.success('Task added!');
      onClose();
    } catch { toast.error('Failed to add task'); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 pb-4 sm:pb-0">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
        className="relative w-full max-w-lg rounded-2xl p-6"
        style={{ background: 'rgba(8,8,24,0.98)', border: '1px solid rgba(0,229,255,0.15)', backdropFilter: 'blur(20px)' }}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display font-bold text-lg text-white">Add Task</h2>
          <button onClick={onClose} className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-all">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-display font-medium text-white/50 uppercase tracking-wider mb-2">Title *</label>
            <input required value={form.title} onChange={set('title')} placeholder="What will you do?" className="input-cyber" />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-display font-medium text-white/50 uppercase tracking-wider mb-2">Category</label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(CATEGORY_META).map(([key, meta]) => (
                <button key={key} type="button" onClick={() => setForm(p => ({ ...p, category: key }))}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-display font-medium transition-all duration-150"
                  style={{
                    background: form.category === key ? meta.bg : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${form.category === key ? meta.border : 'rgba(255,255,255,0.06)'}`,
                    color: form.category === key ? meta.color : 'rgba(255,255,255,0.5)',
                  }}>
                  {meta.emoji} {meta.label}
                </button>
              ))}
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-display font-medium text-white/50 uppercase tracking-wider mb-2">Date</label>
            <input type="date" value={form.date} onChange={set('date')} className="input-cyber" />
          </div>

          {/* Coding hours */}
          {form.category === 'coding' && (
            <div>
              <label className="block text-xs font-display font-medium text-white/50 uppercase tracking-wider mb-2">Coding Hours</label>
              <input type="number" min="0" max="24" step="0.5" value={form.codingHours}
                onChange={set('codingHours')} placeholder="0" className="input-cyber" />
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-xs font-display font-medium text-white/50 uppercase tracking-wider mb-2">Notes (optional)</label>
            <textarea value={form.notes} onChange={set('notes')} rows={2} placeholder="Any notes..."
              className="input-cyber resize-none" />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
            {loading ? <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> : <Plus size={16} />}
            {loading ? 'Adding...' : 'Add Task'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
