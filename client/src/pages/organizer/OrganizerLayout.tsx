import { NavLink, Outlet } from 'react-router-dom';

const links = [
  { to: '/organizer', end: true, label: 'Overview' },
  { to: '/organizer/participants', label: 'Participants' },
  { to: '/organizer/communications', label: 'Communications' },
  { to: '/organizer/checkin', label: 'Check-in' },
  { to: '/organizer/certificates', label: 'Certificates' },
  { to: '/organizer/stats', label: 'Stats' },
  { to: '/organizer/projects', label: 'Projects' },
  { to: '/organizer/invite', label: 'Invite' },
  { to: '/organizer/event-mailer', label: 'Event mailer' },
];

export function OrganizerLayout() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-display text-3xl font-bold">Organizer</h1>
      <nav className="mt-6 flex flex-wrap gap-2">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.end}
            className={({ isActive }) =>
              `rounded-full px-3 py-1.5 text-sm font-medium ${
                isActive
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                  : 'bg-neutral-100 dark:bg-white/10'
              }`
            }
          >
            {l.label}
          </NavLink>
        ))}
      </nav>
      <div className="mt-8">
        <Outlet />
      </div>
    </div>
  );
}
