import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, BarElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { Send, RefreshCw, TrendingUp, Flame, Clock, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { CATEGORY_META } from '../utils/gamification';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

const chartDefaults = {
  plugins: { legend: { display: false }, tooltip: { backgroundColor: 'rgba(5,5,20,0.9)', borderColor: 'rgba(0,229,255,0.2)', borderWidth: 1, titleColor: '#e2e8f0', bodyColor: '#94a3b8', padding: 12, cornerRadius: 8 } },
  scales: {
    x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: 'rgba(255,255,255,0.4)', font: { family: 'JetBrains Mono', size: 11 } } },
    y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: 'rgba(255,255,255,0.4)', font: { family: 'JetBrains Mono', size: 11 } } }
  },
  responsive: true,
  maintainAspectRatio: false,
};

export default function ReportsPage() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/reports/weekly');
      setReport(data);
    } catch { toast.error('Failed to load report'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchReport(); }, []);

  const sendReport = async () => {
    setSending(true);
    try {
      const { data } = await api.post('/reports/send');
      const emailsSent = data.results?.emails?.filter(e => e.success).length || 0;
      toast.success(`Report sent to ${emailsSent} contact(s)! 📧`);
    } catch { toast.error('Failed to send report'); }
    finally { setSending(false); }
  };

  if (loading) return (
    <div className="space-y-4">
      {[1,2,3].map(i => <div key={i} className="h-40 rounded-2xl animate-pulse" style={{ background: 'rgba(255,255,255,0.04)' }} />)}
    </div>
  );

  if (!report) return null;

  const { stats, summary, dailyData, categories } = report;
  const days = Object.keys(dailyData || {});
  const dayLabels = days.map(d => new Date(d + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short' }));

  const lineData = {
    labels: dayLabels,
    datasets: [{
      data: days.map(d => dailyData[d]?.rate || 0),
      borderColor: '#00e5ff',
      backgroundColor: 'rgba(0,229,255,0.08)',
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#00e5ff',
      pointBorderColor: '#050510',
      pointBorderWidth: 2,
      pointRadius: 5,
    }]
  };

  const barData = {
    labels: dayLabels,
    datasets: [
      {
        label: 'Completed',
        data: days.map(d => dailyData[d]?.completed || 0),
        backgroundColor: 'rgba(0,229,255,0.7)',
        borderRadius: 6,
      },
      {
        label: 'Total',
        data: days.map(d => dailyData[d]?.total || 0),
        backgroundColor: 'rgba(255,255,255,0.06)',
        borderRadius: 6,
      }
    ]
  };

  const lineOpts = { ...chartDefaults, scales: { ...chartDefaults.scales, y: { ...chartDefaults.scales.y, min: 0, max: 100, ticks: { ...chartDefaults.scales.y.ticks, callback: v => `${v}%` } } } };
  const barOpts = { ...chartDefaults, plugins: { ...chartDefaults.plugins, legend: { display: true, labels: { color: 'rgba(255,255,255,0.5)', font: { family: 'DM Sans', size: 12 }, boxWidth: 12, borderRadius: 3 } } } };

  const scoreColor = stats.completionRate >= 80 ? '#34d399' : stats.completionRate >= 60 ? '#00e5ff' : stats.completionRate >= 40 ? '#fbbf24' : '#ef4444';

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-white">Weekly Report</h1>
          <p className="text-white/40 text-sm font-body mt-1">{report.period?.start} → {report.period?.end}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchReport} className="btn-cyber flex items-center gap-2 text-sm">
            <RefreshCw size={14} /> Refresh
          </button>
          <button onClick={sendReport} disabled={sending} className="btn-primary flex items-center gap-2 text-sm">
            {sending ? <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> : <Send size={14} />}
            Send Report
          </button>
        </div>
      </div>

      {/* Motivational summary */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="card p-5" style={{ borderColor: 'rgba(0,229,255,0.15)', background: 'rgba(0,229,255,0.03)' }}>
        <p className="text-sm font-body leading-relaxed" style={{ color: scoreColor }}>{summary}</p>
      </motion.div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: <TrendingUp size={18} />, label: 'Completion', value: `${stats.completionRate?.toFixed(0)}%`, color: scoreColor },
          { icon: <CheckCircle size={18} />, label: 'Tasks Done', value: `${stats.completedTasks}/${stats.totalTasks}`, color: '#34d399' },
          { icon: <Clock size={18} />, label: 'Coding Hrs', value: `${stats.codingHours}h`, color: '#00e5ff' },
          { icon: <Flame size={18} />, label: 'Streak', value: `${stats.streak}🔥`, color: '#fbbf24' },
        ].map(({ icon, label, value, color }) => (
          <motion.div key={label} whileHover={{ scale: 1.02 }} className="card p-4">
            <div className="flex items-center gap-2 mb-2" style={{ color }}>
              {icon}
              <span className="text-xs font-display font-medium text-white/50 uppercase tracking-wider">{label}</span>
            </div>
            <p className="font-display font-bold text-2xl" style={{ color }}>{value}</p>
          </motion.div>
        ))}
      </div>

      {/* Line chart */}
      <div className="card p-5">
        <h3 className="font-display font-semibold text-sm text-white/70 uppercase tracking-wider mb-4">Daily Completion Rate</h3>
        <div style={{ height: 200 }}>
          <Line data={lineData} options={lineOpts} />
        </div>
      </div>

      {/* Bar chart */}
      <div className="card p-5">
        <h3 className="font-display font-semibold text-sm text-white/70 uppercase tracking-wider mb-4">Tasks Per Day</h3>
        <div style={{ height: 200 }}>
          <Bar data={barData} options={barOpts} />
        </div>
      </div>

      {/* Category breakdown */}
      <div className="card p-5">
        <h3 className="font-display font-semibold text-sm text-white/70 uppercase tracking-wider mb-4">Category Breakdown</h3>
        <div className="space-y-3">
          {Object.entries(categories || {}).map(([cat, count]) => {
            const meta = CATEGORY_META[cat];
            const total = Object.values(categories).reduce((a, b) => a + b, 0) || 1;
            const pct = Math.round((count / total) * 100);
            return (
              <div key={cat}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-display font-medium" style={{ color: meta.color }}>{meta.emoji} {meta.label}</span>
                  <span className="font-mono text-xs text-white/50">{count} tasks</span>
                </div>
                <div className="progress-bar">
                  <motion.div className="progress-fill" initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }} transition={{ duration: 0.8 }}
                    style={{ background: `linear-gradient(90deg, ${meta.color}, ${meta.color}88)` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
