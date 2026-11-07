import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { NotificationBell } from './NotificationBell';
import { Smartphone, Bot, Download } from 'lucide-react';

const nav = [
  { to: '/events', label: 'Events' },
  { to: '/jobs', label: 'Jobs' },
  { to: '/communities', label: 'Communities' },
  { to: '/devquests', label: 'DevQuests' },
  { to: '/mobile', label: 'Mobile Pass', icon: 'mobile' },
  { to: '/download', label: 'Download App', icon: 'download' },
  { to: '/developers', label: 'API & MCP', icon: 'bot' },
];

export function Layout() {
  const { user, loginAs, logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#0B0F19] text-neutral-900 dark:text-neutral-100">
      <header className="sticky top-0 z-50 border-b border-neutral-200/80 dark:border-white/10 bg-white/90 dark:bg-[#0B0F19]/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4">
          <Link to="/" className="font-display text-xl font-bold tracking-tight text-neutral-900 dark:text-white flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center text-xs text-white font-mono font-bold">T</span>
            Techastra
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `rounded-full px-3 py-1.5 text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-neutral-900 text-white dark:bg-indigo-600 dark:text-white'
                      : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
                  }`
                }
              >
                {item.icon === 'mobile' && <Smartphone className="w-3.5 h-3.5 text-indigo-400" />}
                {item.icon === 'download' && <Download className="w-3.5 h-3.5 text-pink-400" />}
                {item.icon === 'bot' && <Bot className="w-3.5 h-3.5 text-cyan-400" />}
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <NotificationBell />
                <Link
                  to="/profile"
                  className="hidden text-sm text-neutral-600 dark:text-neutral-300 sm:inline"
                >
                  {user.name}
                </Link>
                {['organizer', 'admin', 'superadmin', 'manager'].includes(user.role) && (
                  <Link
                    to={user.role === 'manager' ? '/manager' : user.role === 'organizer' ? '/organizer' : '/admin'}
                    className="rounded-full bg-neutral-100 px-3 py-1.5 text-xs font-medium dark:bg-white/10"
                  >
                    Dashboard
                  </Link>
                )}
                <button
                  type="button"
                  onClick={logout}
                  className="rounded-full border border-neutral-300 px-3 py-1 text-xs font-medium dark:border-white/20"
                >
                  Log out
                </button>
              </>
            ) : (
              <div className="flex items-center gap-1 text-xs">
                <span className="text-neutral-500 hidden sm:inline">Join as:</span>
                <button
                  type="button"
                  onClick={() => loginAs('student@techastra.local')}
                  className="rounded-full bg-indigo-600 px-2.5 py-1 text-white hover:bg-indigo-500 font-medium cursor-pointer"
                >
                  Student
                </button>
                <button
                  type="button"
                  onClick={() => loginAs('organizer@techastra.local')}
                  className="rounded-full bg-neutral-200 px-2.5 py-1 text-neutral-800 hover:bg-neutral-300 dark:bg-white/10 dark:text-white dark:hover:bg-white/20 font-medium cursor-pointer"
                >
                  Host
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-neutral-200 dark:border-white/10 py-6 text-center text-xs text-neutral-500 dark:text-neutral-400">
        <div className="mx-auto max-w-6xl px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>Techastra &copy; {new Date().getFullYear()} — Built for Builders</span>
          <div className="flex items-center gap-4">
            <Link to="/download" className="hover:text-indigo-400 transition-colors">Download App</Link>
            <Link to="/developers" className="hover:text-indigo-400 transition-colors">Developers & MCP</Link>
            <Link to="/mobile" className="hover:text-indigo-400 transition-colors">Mobile Simulator</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}