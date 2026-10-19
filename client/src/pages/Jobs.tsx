import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, type Job } from '../lib/api';
import { useAuth } from '../context/AuthContext';

export function Jobs() {
  const { user, loginAs } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [featured, setFeatured] = useState<Job[]>([]);
  const [q, setQ] = useState('');

  useEffect(() => {
    api.get<Job[]>('/api/v1/jobs').then((res) => setJobs(res.data));
    api.get<Job[]>('/api/v1/jobs/featured').then((res) => setFeatured(res.data));
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      if (!q.trim()) {
        api.get<Job[]>('/api/v1/jobs').then((res) => setJobs(res.data));
        return;
      }
      api
        .get<Job[]>('/api/v1/jobs/search', { params: { q: q.trim() } })
        .then((res) => setJobs(res.data))
        .catch(() => {});
    }, 300);
    return () => clearTimeout(t);
  }, [q]);

  const filtered = jobs;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-display text-3xl font-bold">Find Your Next Opportunity</h1>
      <input
        className="mt-6 w-full max-w-md rounded-xl border border-neutral-300 px-4 py-2 dark:border-white/20 dark:bg-neutral-900"
        placeholder="Search by role, company, location…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      {featured.length > 0 && !q.trim() && (
        <section className="mt-8">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">Featured</h2>
          <ul className="mt-4 grid gap-4 md:grid-cols-2">
            {featured.slice(0, 4).map((job) => (
              <li
                key={`feat-${job._id}`}
                className="rounded-2xl border border-violet-200 bg-violet-50/50 p-5 dark:border-violet-500/30 dark:bg-violet-500/10"
              >
                <h2 className="font-semibold">{job.title}</h2>
                <p className="text-sm text-neutral-500">{job.company}</p>
              </li>
            ))}
          </ul>
        </section>
      )}
      <ul className="mt-8 grid gap-4 md:grid-cols-2">
        {filtered.map((job) => (
          <li
            key={job._id}
            className="rounded-2xl border border-neutral-200 p-5 dark:border-white/10"
          >
            <h2 className="font-semibold">{job.title}</h2>
            <p className="text-sm text-neutral-500">{job.company}</p>
            <p className="mt-2 text-xs uppercase tracking-wide text-neutral-400">
              {job.workMode} · {job.type}
            </p>
            {job.skills && (
              <div className="mt-3 flex flex-wrap gap-1">
                {job.skills.map((s) => (
                  <span key={s} className="rounded bg-neutral-100 px-2 py-0.5 text-xs dark:bg-white/10">
                    {s}
                  </span>
                ))}
              </div>
            )}
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                className="rounded-full bg-neutral-900 px-3 py-1.5 text-xs text-white dark:bg-white dark:text-neutral-900"
                onClick={() => {
                  if (!user) loginAs('student@techastra.local');
                  else api.post(`/api/v1/jobs/${job._id}/apply`);
                }}
              >
                Apply Now
              </button>
              <Link to={`/view/${job._id}/applications`} className="text-xs underline self-center">
                Applications
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
