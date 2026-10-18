import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, type Community } from '../lib/api';

export function Communities() {
  const [items, setItems] = useState<Community[]>([]);

  useEffect(() => {
    api.get<Community[]>('/api/v1/communities').then((res) => setItems(res.data));
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-display text-3xl font-bold">Communities</h1>
      <ul className="mt-8 grid gap-4 md:grid-cols-2">
        {items.map((c) => (
          <li key={c._id}>
            <Link
              to={`/community/${c._id}`}
              className="block rounded-2xl border border-neutral-200 p-5 dark:border-white/10"
            >
              <h2 className="font-semibold">{c.name}</h2>
              <p className="mt-2 text-sm text-neutral-500">{c.description}</p>
              <p className="mt-3 text-xs text-neutral-400">{c.memberCount?.toLocaleString()} members</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
