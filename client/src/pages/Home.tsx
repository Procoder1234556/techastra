import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

export function Home() {
  const { loginAs } = useAuth();

  return (
    <div>
      <section className="relative overflow-hidden border-b border-neutral-200 dark:border-white/10">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-200/40 via-transparent to-transparent dark:from-violet-900/30"
          aria-hidden
        />
        <div className="relative mx-auto max-w-6xl px-4 py-20 md:py-28 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-4xl md:text-6xl font-bold tracking-tight"
          >
            Build faster on <span className="text-violet-700 dark:text-violet-300">TechAstra</span>
          </motion.h1>
          <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
            Dive into hackathons, jobs, and communities on TechAstra.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              to="/events"
              className="rounded-full bg-neutral-900 px-6 py-3 text-sm font-semibold text-white dark:bg-white dark:text-neutral-900"
            >
              Explore Events
            </Link>
            <button
              type="button"
              onClick={() => loginAs('student@techastra.local')}
              className="rounded-full border border-neutral-300 px-6 py-3 text-sm font-semibold dark:border-white/20"
            >
              Join with 1-Click
            </button>
          </div>
          <p className="mt-6 text-xs text-neutral-400">
            Dev login: student@ / organizer@ / admin@techastra.local
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 grid md:grid-cols-3 gap-6">
        {[
          {
            title: 'Hackathons',
            desc: 'Discover and register for events in one click.',
            to: '/events',
          },
          {
            title: 'Job Board',
            desc: 'Browse internships and full-time roles.',
            to: '/jobs',
          },
          {
            title: 'Communities',
            desc: 'Connect with builders and chapter leads.',
            to: '/communities',
          },
        ].map((card) => (
          <Link
            key={card.title}
            to={card.to}
            className="rounded-2xl border border-neutral-200 p-6 hover:border-neutral-400 transition dark:border-white/10 dark:hover:border-white/30"
          >
            <h3 className="text-lg font-semibold">{card.title}</h3>
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">{card.desc}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}
