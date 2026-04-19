import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, ChevronRight, ChevronLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: '', email: '', password: '', friend_email: '', parent_email: '' });
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step === 1) { setStep(2); return; }
    setLoading(true);
    try {
      await signup(form.name, form.email, form.password, form.friend_email, form.parent_email);
      toast.success('Welcome to LifeOS! Let\'s get disciplined 🔥');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 right-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl"
          style={{ background: 'radial-gradient(circle, #00e5ff, transparent)' }} />
      </div>

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4"
            style={{ background: 'linear-gradient(135deg, #00e5ff, #0070ff)', boxShadow: '0 0 40px rgba(0,229,255,0.4)' }}>
            ⚡
          </div>
          <h1 className="font-display font-bold text-3xl text-white">Join LifeOS</h1>
          <p className="text-white/40 text-sm mt-1">Build discipline. Track progress. Level up.</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-6 px-2">
          {[1, 2].map(s => (
            <div key={s} className={`flex-1 h-1 rounded-full transition-all duration-300 ${s <= step ? 'bg-cyan-400' : 'bg-white/10'}`} />
          ))}
        </div>

        <div className="card p-6">
          <h2 className="font-display font-bold text-xl text-white mb-1">
            {step === 1 ? 'Create Account' : 'Accountability Setup'}
          </h2>
          <p className="text-white/40 text-sm mb-6 font-body">
            {step === 1 ? 'Your basic info' : 'Who keeps you accountable? (optional)'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {step === 1 ? (
              <>
                <div>
                  <label className="block text-xs font-display font-medium text-white/50 uppercase tracking-wider mb-2">Full Name</label>
                  <input required value={form.name} onChange={set('name')} placeholder="Your name" className="input-cyber" />
                </div>
                <div>
                  <label className="block text-xs font-display font-medium text-white/50 uppercase tracking-wider mb-2">Email</label>
                  <input type="email" required value={form.email} onChange={set('email')} placeholder="you@example.com" className="input-cyber" />
                </div>
                <div>
                  <label className="block text-xs font-display font-medium text-white/50 uppercase tracking-wider mb-2">Password</label>
                  <input type="password" required minLength={6} value={form.password} onChange={set('password')} placeholder="Min 6 characters" className="input-cyber" />
                </div>
              </>
            ) : (
              <>
                <div className="card p-3 mb-4" style={{ borderColor: 'rgba(0,229,255,0.15)', background: 'rgba(0,229,255,0.03)' }}>
                  <p className="text-xs text-cyan-400/80 font-body">
                    📧 Weekly reports will be automatically sent to these emails every Sunday.
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-display font-medium text-white/50 uppercase tracking-wider mb-2">Friend's Email</label>
                  <input type="email" value={form.friend_email} onChange={set('friend_email')} placeholder="friend@example.com" className="input-cyber" />
                </div>
                <div>
                  <label className="block text-xs font-display font-medium text-white/50 uppercase tracking-wider mb-2">Parent's Email</label>
                  <input type="email" value={form.parent_email} onChange={set('parent_email')} placeholder="parent@example.com" className="input-cyber" />
                </div>
              </>
            )}

            <div className="flex gap-3 pt-2">
              {step === 2 && (
                <button type="button" onClick={() => setStep(1)} className="btn-cyber flex items-center gap-2">
                  <ChevronLeft size={16} /> Back
                </button>
              )}
              <button type="submit" disabled={loading}
                className="btn-primary flex-1 flex items-center justify-center gap-2">
                {loading ? <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> :
                  step === 1 ? <><ChevronRight size={16} /> Continue</> : <><Zap size={16} /> Launch LifeOS</>}
              </button>
            </div>
          </form>

          {step === 2 && (
            <button onClick={handleSubmit} className="w-full text-center text-sm text-white/30 hover:text-white/50 mt-3 transition-colors font-body">
              Skip for now
            </button>
          )}
        </div>

        <p className="text-center text-sm text-white/40 mt-4 font-body">
          Have an account?{' '}
          <Link to="/login" className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}
