import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { LayoutDashboard, BarChart2, Trophy, User, LogOut, Zap, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getLevelProgress, LEVEL_META } from '../utils/gamification';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/reports', icon: BarChart2, label: 'Reports' },
  { to: '/challenges', icon: Trophy, label: 'Challenges' },
  { to: '/profile', icon: User, label: 'Profile' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const levelInfo = getLevelProgress(user?.xp || 0);
  const levelMeta = LEVEL_META[levelInfo.current] || LEVEL_META.Beginner;

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-black font-bold text-lg"
            style={{ background: 'linear-gradient(135deg, #00e5ff, #0070ff)' }}>
            ⚡
          </div>
          <div>
            <p className="font-display font-bold text-white text-base leading-none">LifeOS</p>
            <p className="font-mono text-xs text-cyan-400/60 mt-0.5">Discipline System</p>
          </div>
        </div>
      </div>

      {/* User card */}
      <div className="px-4 py-4 border-b border-white/5">
        <div className="card p-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-black"
              style={{ background: `linear-gradient(135deg, ${levelMeta.color}, #0070ff)` }}>
              {user?.name?.[0]?.toUpperCase() || '?'}
            </div>
            <div className="min-w-0">
              <p className="font-display font-semibold text-white text-sm truncate">{user?.name}</p>
              <p className="text-xs font-mono" style={{ color: levelMeta.color }}>{levelInfo.current}</p>
            </div>
            <div className="ml-auto text-right">
              <p className="font-mono text-xs text-cyan-400">{user?.xp || 0}</p>
              <p className="text-xs text-white/30">XP</p>
            </div>
          </div>
          <div className="mt-2.5">
            <div className="progress-bar">
              <motion.div className="progress-fill" initial={{ width: 0 }}
                animate={{ width: `${levelInfo.pct}%` }} transition={{ duration: 1, delay: 0.3 }} />
            </div>
            {levelInfo.next && (
              <p className="text-xs text-white/30 mt-1">{levelInfo.xpLeft} XP to {levelInfo.next}</p>
            )}
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} end={to === '/'} onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-display font-medium transition-all duration-200 ${
                isActive
                  ? 'text-cyan-400 bg-cyan-400/10 border border-cyan-400/20'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              }`
            }>
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Streak badge */}
      {user?.currentStreak > 0 && (
        <div className="px-4 pb-3">
          <div className="card p-3 text-center" style={{ borderColor: 'rgba(251,191,36,0.2)', background: 'rgba(251,191,36,0.05)' }}>
            <p className="text-2xl">🔥</p>
            <p className="font-display font-bold text-yellow-400 text-lg">{user.currentStreak}</p>
            <p className="text-xs text-white/40">Day Streak</p>
          </div>
        </div>
      )}

      {/* Logout */}
      <div className="px-3 pb-6">
        <button onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-display font-medium text-white/40 hover:text-red-400 hover:bg-red-400/10 transition-all duration-200">
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-white/5 fixed inset-y-0 left-0 z-30"
        style={{ background: 'rgba(5,5,20,0.8)', backdropFilter: 'blur(20px)' }}>
        <SidebarContent />
      </aside>

      {/* Mobile nav bar */}
      <div className="md:hidden fixed top-0 inset-x-0 z-40 flex items-center justify-between px-4 py-3 border-b border-white/5"
        style={{ background: 'rgba(5,5,20,0.95)', backdropFilter: 'blur(20px)' }}>
        <div className="flex items-center gap-2">
          <span className="text-xl">⚡</span>
          <span className="font-display font-bold text-white">LifeOS</span>
        </div>
        <div className="flex items-center gap-2">
          {user?.currentStreak > 0 && (
            <span className="font-mono text-sm text-yellow-400">🔥 {user.currentStreak}</span>
          )}
          <span className="font-mono text-xs text-cyan-400">{user?.xp || 0} XP</span>
          <button onClick={() => setMobileOpen(true)} className="p-2 rounded-lg text-white/60 hover:text-white">
            <Menu size={20} />
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="md:hidden fixed inset-y-0 left-0 z-50 w-72 border-r border-white/10"
              style={{ background: 'rgba(5,5,20,0.98)', backdropFilter: 'blur(20px)' }}>
              <button onClick={() => setMobileOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-lg text-white/40 hover:text-white">
                <X size={20} />
              </button>
              <SidebarContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <main className="flex-1 md:ml-64 min-h-screen">
        <div className="pt-14 md:pt-0 px-4 md:px-8 py-6 max-w-5xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div key={location.pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}>
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
