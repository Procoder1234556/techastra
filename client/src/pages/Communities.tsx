import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, type Community } from '../lib/api';
import { API } from '../lib/apiPaths';
import { useAuth } from '../context/AuthContext';

const TYPES = ['general', 'tech', 'design', 'startup'] as const;

export function Communities() {
  const { user } = useAuth();
  const [items, setItems] = useState<Community[]>([]);
  const [q, setQ] = useState('');
  const [type, setType] = useState<string>('');

  useEffect(() => {
    api.get<Community[]>('/api/v1/communities').then((res) => setItems(res.data));
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      if (type) {
        api.get<Community[]>(`${API.communitiesType}/${type}`).then((res) => setItems(res.data));
        return;
      }
      if (!q.trim()) {
        api.get<Community[]>('/api/v1/communities').then((res) => setItems(res.data));
        return;
      }
      api
        .get<Community[]>('/api/v1/communities/search', { params: { q: q.trim() } })
        .then((res) => setItems(res.data))
        .catch(() => {});
    }, 300);
    return () => clearTimeout(t);
  }, [q, type]);

  const duplicate = async (id: string) => {
    await api.post(API.communitiesDuplicate, { communityId: id });
    api.get<Community[]>('/api/v1/communities').then((res) => setItems(res.data));
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-display text-3xl font-bold">Communities</h1>
      <div className="mt-6 flex flex-wrap gap-2">
        {TYPES.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setType(type === t ? '' : t)}
            className={`rounded-full px-3 py-1 text-xs capitalize ${type === t ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900' : 'border dark:border-white/20'}`}
          >
            {t}
          </button>
        ))}
      </div>
      <input
        className="mt-4 w-full max-w-md rounded-xl border border-neutral-300 px-4 py-2 dark:border-white/20 dark:bg-neutral-900"
        placeholder="Search communities…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      <ul className="mt-8 grid gap-4 md:grid-cols-2">
        {items.map((c) => (
          <li key={c._id}>
            <Link
              to={`/community/${c._id}`}
              className="block rounded-2xl border border-neutral-200 p-5 dark:border-white/10"
            >
              <h2 className="font-semibold">{c.name}</h2>
              <p className="mt-2 text-sm text-neutral-500">{c.description}</p>
              <p className="mt-3 text-xs text-neutral-400">{c.memberCount?.toLocaleString()} members · {c.type}</p>
            </Link>
            {user && ['admin', 'superadmin', 'organizer'].includes(user.role) && (
              <button type="button" onClick={() => duplicate(c._id)} className="mt-1 text-xs underline">
                Duplicate
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
