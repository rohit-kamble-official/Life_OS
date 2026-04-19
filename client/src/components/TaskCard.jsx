import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Trash2, Edit3, Paperclip, ChevronDown, ChevronUp, Clock } from 'lucide-react';
import { CATEGORY_META } from '../utils/gamification';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function TaskCard({ task, onUpdate, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editNotes, setEditNotes] = useState(task.notes || '');
  const [editHours, setEditHours] = useState(task.codingHours || 0);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();
  const meta = CATEGORY_META[task.category] || CATEGORY_META.personal_growth;

  const toggleComplete = async () => {
    try {
      const { data } = await api.put(`/tasks/${task._id}`, { completed: !task.completed });
      onUpdate(data.task, data.user);
      if (!task.completed) {
        toast.success('+10 XP earned! ⚡', { icon: '💫' });
      }
    } catch { toast.error('Failed to update task'); }
  };

  const saveEdit = async () => {
    try {
      const { data } = await api.put(`/tasks/${task._id}`, {
        title: editTitle, notes: editNotes, codingHours: Number(editHours)
      });
      onUpdate(data.task);
      setEditing(false);
      toast.success('Task updated');
    } catch { toast.error('Failed to save'); }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/tasks/${task._id}`);
      onDelete(task._id);
      toast.success('Task removed');
    } catch { toast.error('Failed to delete'); }
  };

  const handleProofUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('proof', file);
    try {
      const { data } = await api.post(`/tasks/${task._id}/proof`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      onUpdate(data.task);
      toast.success('Proof uploaded! 📎');
    } catch { toast.error('Upload failed'); }
    finally { setUploading(false); }
  };

  return (
    <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }}
      className="rounded-2xl overflow-hidden transition-all duration-200"
      style={{
        background: task.completed ? 'rgba(52,211,153,0.04)' : 'rgba(255,255,255,0.03)',
        border: `1px solid ${task.completed ? 'rgba(52,211,153,0.2)' : 'rgba(255,255,255,0.06)'}`,
      }}>
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Complete button */}
          <button onClick={toggleComplete}
            className="flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 mt-0.5"
            style={{
              borderColor: task.completed ? '#34d399' : meta.color + '60',
              background: task.completed ? '#34d399' : 'transparent',
            }}>
            {task.completed && <Check size={12} color="#000" strokeWidth={3} />}
          </button>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {editing ? (
              <input value={editTitle} onChange={e => setEditTitle(e.target.value)}
                className="input-cyber text-sm py-1 px-2" autoFocus />
            ) : (
              <p className={`font-display font-medium text-sm leading-snug ${task.completed ? 'line-through text-white/30' : 'text-white'}`}>
                {task.title}
              </p>
            )}
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-mono"
                style={{ background: meta.bg, color: meta.color, border: `1px solid ${meta.border}` }}>
                {meta.emoji} {meta.label}
              </span>
              {task.proofFile && (
                <span className="text-xs text-white/40 flex items-center gap-1">
                  <Paperclip size={10} /> proof
                </span>
              )}
              {task.xpEarned > 0 && (
                <span className="text-xs text-cyan-400 font-mono">+{task.xpEarned}xp</span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <button onClick={() => { setEditing(p => !p); setExpanded(true); }}
              className="p-1.5 rounded-lg text-white/30 hover:text-cyan-400 hover:bg-cyan-400/10 transition-all">
              <Edit3 size={14} />
            </button>
            <button onClick={handleDelete}
              className="p-1.5 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-400/10 transition-all">
              <Trash2 size={14} />
            </button>
            <button onClick={() => setExpanded(p => !p)}
              className="p-1.5 rounded-lg text-white/30 hover:text-white transition-all">
              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>
        </div>
      </div>

      {/* Expanded area */}
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-white/5">
            <div className="p-4 space-y-3">
              {task.category === 'coding' && (
                <div className="flex items-center gap-3">
                  <Clock size={14} className="text-cyan-400" />
                  {editing ? (
                    <input type="number" min="0" max="24" step="0.5" value={editHours}
                      onChange={e => setEditHours(e.target.value)}
                      className="input-cyber py-1 px-2 text-sm w-24" />
                  ) : (
                    <span className="text-sm text-white/60 font-body">{task.codingHours || 0}h coding</span>
                  )}
                </div>
              )}

              {editing ? (
                <textarea value={editNotes} onChange={e => setEditNotes(e.target.value)}
                  placeholder="Add notes..." rows={2}
                  className="input-cyber text-sm resize-none" />
              ) : task.notes ? (
                <p className="text-sm text-white/50 font-body">{task.notes}</p>
              ) : null}

              {editing && (
                <div className="flex gap-2">
                  <button onClick={saveEdit} className="btn-primary py-1.5 text-xs">Save</button>
                  <button onClick={() => setEditing(false)} className="btn-cyber py-1.5 text-xs">Cancel</button>
                </div>
              )}

              {/* Proof upload */}
              <div>
                <input ref={fileRef} type="file" accept="image/*,video/*,.pdf" className="hidden" onChange={handleProofUpload} />
                {task.proofFile ? (
                  <a href={task.proofFile.url} target="_blank" rel="noreferrer"
                    className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors">
                    <Paperclip size={12} /> View proof: {task.proofFile.filename}
                  </a>
                ) : (
                  <button onClick={() => fileRef.current.click()} disabled={uploading}
                    className="text-xs text-white/40 hover:text-cyan-400 flex items-center gap-1.5 transition-colors">
                    <Paperclip size={12} /> {uploading ? 'Uploading...' : 'Upload proof'}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
