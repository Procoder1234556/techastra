import { Link } from 'react-router-dom';

export function ManagerDashboard() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-display text-3xl font-bold">Manager dashboard</h1>
      <p className="mt-4 text-neutral-600">Cross-event operations and approvals.</p>
      <Link to="/organizer/participants" className="mt-6 inline-block text-sm underline">
        View all participants →
      </Link>
    </div>
  );
}
