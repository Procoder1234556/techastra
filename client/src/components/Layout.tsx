import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const nav = [
  { to: '/events', label: 'Events' },
  { to: '/jobs', label: 'Jobs' },
  { to: '/communities', label: 'Communities' },
  { to: '/devquests', label: 'DevQuests' },
  { to: '/resources', label: 'Resources' },
];

export function Layout() {
  const { user, loginAs, logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 border-b border-neutral-200/80 dark:border-white/10 bg-white/90 dark:bg-neutral-950/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4">
          <Link to="/" className="font-display text-xl font-bold tracking-tight">
            TechAstra
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                      : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            {user ? (
              <>
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
                className="rounded-full bg-neutral-900 px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-neutral-900"
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
      <footer className="border-t border-neutral-200 dark:border-white/10 py-10 text-sm text-neutral-500">
        <div className="mx-auto max-w-6xl px-4 grid gap-6 md:grid-cols-3">
          <p>TechAstra — hackathons, jobs, and communities for builders.</p>
          <div className="flex flex-col gap-1">
            <Link to="/faq">FAQ</Link>
            <Link to="/privacy-policy">Privacy</Link>
            <Link to="/terms-of-service">Terms</Link>
          </div>
          <p>hello@techastra.com</p>
        </div>
      </footer>
    </div>
  );
}
