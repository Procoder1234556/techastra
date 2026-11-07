import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { NotificationBell } from './NotificationBell';
import { Smartphone, Bot } from 'lucide-react';

const nav = [
  { to: '/events', label: 'Events' },
  { to: '/jobs', label: 'Jobs' },
  { to: '/communities', label: 'Communities' },
  { to: '/devquests', label: 'DevQuests' },
  { to: '/mobile', label: 'Mobile Pass', icon: 'mobile' },
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
                  className="rounded-full border border-neutral-300 px-3 py-1.5 text-sm dark:border-white/20"
                >
                  Log out
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => loginAs('student@techastra.local')}
                className="rounded-full bg-neutral-900 px-4 py-2 text-sm font-medium text-white dark:bg-indigo-600 dark:hover:bg-indigo-500"
              >
                Join with 1-Click
              </button>
            )}
          </div>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-neutral-200 dark:border-white/10 py-10 text-sm text-neutral-500 bg-neutral-50 dark:bg-[#070A11]">
        <div className="mx-auto max-w-6xl px-4 grid gap-6 md:grid-cols-4">
          <div>
            <p className="font-semibold text-neutral-900 dark:text-white mb-2">Techastra Platform</p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Community operating system for hackathons, DevQuests, verified credentials, and mobile event passes.
            </p>
          </div>
          <div className="flex flex-col gap-1 text-xs">
            <p className="font-semibold text-neutral-900 dark:text-white mb-1">Explore</p>
            <Link to="/events" className="hover:text-neutral-900 dark:hover:text-white">Hackathons & Events</Link>
            <Link to="/devquests" className="hover:text-neutral-900 dark:hover:text-white">DevQuests & XP</Link>
            <Link to="/communities" className="hover:text-neutral-900 dark:hover:text-white">Campus Communities</Link>
            <Link to="/mobile" className="hover:text-neutral-900 dark:hover:text-white">Mobile Pass & Gate Scanner</Link>
          </div>
          <div className="flex flex-col gap-1 text-xs">
            <p className="font-semibold text-neutral-900 dark:text-white mb-1">Developers & Agents</p>
            <Link to="/developers" className="hover:text-neutral-900 dark:hover:text-white font-medium text-indigo-500">Developer Portal</Link>
            <Link to="/api-docs" className="hover:text-neutral-900 dark:hover:text-white">OpenAPI 3.1 Spec</Link>
            <Link to="/developers#mcp-section" className="hover:text-neutral-900 dark:hover:text-white">Connect AI Agents (MCP)</Link>
          </div>
          <div>
            <p className="font-semibold text-neutral-900 dark:text-white mb-1">Direct Contact</p>
            <p className="text-xs">hello@techastra.local</p>
            <p className="text-[11px] text-neutral-400 mt-2">Bangalore &bull; All India Campus Network</p>
          </div>
        </div>
      </footer>
    </div>
  );
}