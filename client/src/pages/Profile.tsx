import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, type Event } from '../lib/api';
import { useAuth } from '../context/AuthContext';

export function Profile() {
  const { user } = useAuth();
  const [applied, setApplied] = useState<Event[]>([]);

  useEffect(() => {
    api.get<Event[]>('/api/v1/events/getapplied').then((res) => setApplied(res.data));
  }, []);

  if (!user) return null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-display text-3xl font-bold">Profile</h1>
      <div className="mt-6 rounded-2xl border border-neutral-200 p-6 dark:border-white/10">
        <p className="text-lg font-semibold">{user.name}</p>
        <p className="text-neutral-500">{user.email}</p>
        <p className="mt-2 text-sm">Role: {user.role}</p>
        {user.xp != null && <p className="text-sm">XP: {user.xp}</p>}
      </div>
      <h2 className="mt-10 font-semibold">Your events</h2>
      <ul className="mt-4 space-y-2">
        {applied.map((e) => (
          <li key={e._id}>
            <Link to={`/event/${e.hackathon}`} className="text-sm underline">
              {e.name}
            </Link>
          </li>
        ))}
        {applied.length === 0 && <li className="text-sm text-neutral-500">No registrations yet.</li>}
      </ul>
    </div>
  );
}
