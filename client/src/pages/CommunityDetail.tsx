import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api, type Community } from '../lib/api';

export function CommunityDetail() {
  const { id } = useParams();
  const [community, setCommunity] = useState<Community | null>(null);

  useEffect(() => {
    if (!id) return;
    api.get<Community>(`/api/v1/communities/${id}`).then((res) => setCommunity(res.data));
  }, [id]);

  if (!community) return <p className="p-8 text-center">Loading…</p>;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="font-display text-3xl font-bold">{community.name}</h1>
      <p className="mt-4 text-neutral-600 dark:text-neutral-400">{community.description}</p>
    </div>
  );
}
