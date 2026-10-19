import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, type Event } from '../lib/api';
import { API } from '../lib/apiPaths';
import { useAuth } from '../context/AuthContext';

export function Profile() {
  const { user } = useAuth();
  const [applied, setApplied] = useState<Event[]>([]);
  const [colleges, setColleges] = useState<string[]>([]);
  const [college, setCollege] = useState('');
  const [collegeMsg, setCollegeMsg] = useState('');
  const [newCollege, setNewCollege] = useState('');

  useEffect(() => {
    api.get<Event[]>('/api/v1/events/getapplied').then((res) => setApplied(res.data));
    api.get<string[]>('/api/v1/colleges').then((res) => setColleges(res.data));
  }, []);

  useEffect(() => {
    if (user?.college) setCollege(user.college);
  }, [user?.college]);

  const saveCollege = async () => {
    const res = await api.post('/api/v1/colleges/select', { college });
    setCollegeMsg('College updated');
    setCollege(res.data.college || college);
  };

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

      <div className="mt-8">
        <h2 className="font-semibold">College</h2>
        <div className="mt-2 flex flex-wrap gap-2">
          <select
            className="flex-1 min-w-[200px] rounded-lg border px-3 py-2 dark:border-white/20 dark:bg-neutral-950"
            value={college}
            onChange={(e) => setCollege(e.target.value)}
          >
            <option value="">Select college</option>
            {colleges.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={saveCollege}
            className="rounded-full bg-gray-900 px-4 py-2 text-sm text-white dark:bg-white dark:text-gray-900"
          >
            Save
          </button>
        </div>
        {collegeMsg && <p className="mt-2 text-sm text-green-600">{collegeMsg}</p>}
        {user.role === 'admin' || user.role === 'superadmin' ? (
          <div className="mt-4 flex flex-wrap gap-2">
            <input
              className="flex-1 min-w-[200px] rounded-lg border px-3 py-2 text-sm dark:border-white/20"
              placeholder="Add college to directory"
              value={newCollege}
              onChange={(e) => setNewCollege(e.target.value)}
            />
            <button
              type="button"
              onClick={async () => {
                await api.post(API.collegesAdd, { name: newCollege.trim() });
                setCollegeMsg('College added to directory');
                api.get<string[]>('/api/v1/colleges').then((res) => setColleges(res.data));
              }}
              className="rounded-full border px-4 py-2 text-sm dark:border-white/20"
            >
              Add college
            </button>
          </div>
        ) : null}
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
