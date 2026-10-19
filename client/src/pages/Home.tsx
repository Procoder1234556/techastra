import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Briefcase,
  FolderKanban,
  Search,
  Star,
  Trophy,
  UserPlus,
  Users,
  Zap,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PartnerLogos } from '../components/PartnerLogos';
import { TESTIMONIALS } from '../content/testimonials';

const STATS = [
  { label: 'Developers', value: '1M+' },
  { label: 'Hackathons', value: '900+' },
  { label: 'Partners', value: '225+' },
  { label: 'Projects', value: '120k+' },
];

export function Home() {
  const { loginAs } = useAuth();

  return (
    <div className="bg-white dark:bg-neutral-950">
      <section className="relative overflow-hidden border-b border-neutral-200 dark:border-white/10">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-300/30 via-transparent to-transparent dark:from-violet-900/40"
          aria-hidden
        />
        <div className="relative mx-auto max-w-6xl px-4 py-20 md:py-28 text-center">
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm font-medium text-violet-700 dark:text-violet-300"
          >
            Unlock your hackathon potential
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mt-3 font-display text-4xl md:text-6xl font-bold tracking-tight text-gray-900 dark:text-white"
          >
            One-click for your success
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-5 text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto"
          >
            Dive into hackathons where innovative technology meets collaborative problem-solving — discover,
            register, and build with one profile.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mt-8 flex flex-wrap justify-center gap-3"
          >
            <Link
              to="/events"
              className="rounded-full bg-gray-900 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 dark:bg-white dark:text-gray-900"
            >
              Explore Events
            </Link>
            <button
              type="button"
              onClick={() => loginAs('student@techastra.local')}
              className="inline-flex items-center gap-2 rounded-full border border-neutral-300 px-6 py-3 text-sm font-semibold dark:border-white/20"
            >
              <Zap className="h-4 w-4" />
              Join with 1-Click
            </button>
            <Link
              to="/HostEvent"
              className="rounded-full border border-neutral-300 px-6 py-3 text-sm font-semibold dark:border-white/20"
            >
              Host an Event
            </Link>
          </motion.div>
        </div>
      </section>

      <section className="border-b border-neutral-200 py-12 dark:border-white/10">
        <p className="text-center text-xs uppercase tracking-widest text-neutral-400 mb-8">Trusted by teams at</p>
        <PartnerLogos />
      </section>

      <section className="border-b border-neutral-200 bg-neutral-50 py-14 dark:border-white/10 dark:bg-neutral-900/40">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <h2 className="font-display text-2xl md:text-4xl font-bold text-gray-900 dark:text-white">
            Everything you need on one intuitive platform
          </h2>
          <div className="mt-10 grid grid-cols-2 gap-6 md:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.label}>
                <p className="text-2xl md:text-3xl font-bold text-violet-600 dark:text-violet-400">{s.value}</p>
                <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 border-b border-neutral-200 dark:border-white/10">
        <h2 className="text-center font-display text-2xl md:text-3xl font-bold">Platform features</h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: Trophy, title: 'Hackathons', desc: 'Discover and join events that match your skills.', to: '/events' },
            { icon: Briefcase, title: 'Job board', desc: 'Tech opportunities from companies hiring builders.', to: '/jobs' },
            { icon: Users, title: 'Communities', desc: 'Chapters, clubs, and mentor networks.', to: '/communities' },
            { icon: UserPlus, title: 'Team building', desc: 'Form teams and collaborate on submissions.', to: '/events' },
            { icon: FolderKanban, title: 'Projects', desc: 'Showcase work and organizer project reviews.', to: '/devquests' },
            { icon: Search, title: 'Smart discovery', desc: 'Filter by stack, theme, and format.', to: '/events' },
          ].map((card) => (
            <Link
              key={card.title}
              to={card.to}
              className="rounded-2xl border border-neutral-200 p-5 hover:border-neutral-400 dark:border-white/10 dark:hover:border-white/25"
            >
              <card.icon className="h-7 w-7 text-violet-600 dark:text-violet-400" />
              <h3 className="mt-3 font-semibold">{card.title}</h3>
              <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{card.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 md:py-20 border-b border-neutral-200 dark:border-white/10">
        <h2 className="text-center font-display text-3xl md:text-4xl font-bold">How Techastra works</h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-neutral-500 dark:text-neutral-400">
          One platform, zero hassle — from discovery to participation.
        </p>
        <ol className="mt-12 grid gap-8 md:grid-cols-4">
          {[
            { step: '1-Click registration', text: 'Build your profile once and join any hackathon instantly.' },
            { step: 'Smart discovery', text: 'Filter by AI/ML, Web3, open source, and more.' },
            { step: 'Team formation', text: 'Find teammates with complementary skills or invite friends.' },
            { step: 'Skill development', text: 'Earn XP, badges, and portfolio-ready project history.' },
          ].map((item, i) => (
            <li key={item.step} className="relative rounded-2xl border border-neutral-200 p-5 dark:border-white/10">
              <span className="text-xs font-bold text-violet-600 dark:text-violet-400">0{i + 1}</span>
              <h3 className="mt-2 font-semibold">{item.step}</h3>
              <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">{item.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="relative mx-auto max-w-6xl px-4 py-16 md:py-24 overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-violet-200/20 via-transparent to-transparent dark:from-violet-900/20"
          aria-hidden
        />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative max-w-3xl mx-auto text-center mb-12"
        >
          <h2 className="text-3xl md:text-5xl font-display font-bold text-gray-900 dark:text-white">
            Built for <span className="italic">ambitious developers</span>
          </h2>
          <p className="mt-4 text-base md:text-lg text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
            Techastra is built for developers and students. No jargon, no confusion — just a platform to discover,
            register, and ship projects at hackathons.
          </p>
          <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-sm text-gray-700 dark:bg-neutral-800 dark:text-gray-300">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            4.8 from 500+ participants
          </div>
        </motion.div>
        <div className="grid gap-4 md:grid-cols-2">
          {TESTIMONIALS.map((t) => (
            <blockquote
              key={t.name}
              className="rounded-2xl border border-neutral-200 p-6 text-left dark:border-white/10"
            >
              <p className="text-sm text-neutral-700 dark:text-neutral-300">&ldquo;{t.quote}&rdquo;</p>
              <footer className="mt-4 text-sm font-semibold">{t.name}</footer>
              <p className="text-xs text-neutral-500">{t.title}</p>
            </blockquote>
          ))}
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: Trophy, title: 'Hackathons', desc: 'Featured events, filters, and instant registration.', to: '/events' },
            { icon: Users, title: 'Communities', desc: 'Chapters, clubs, and builder networks.', to: '/communities' },
            { icon: Zap, title: 'DevQuests', desc: 'XP, bounties, and leaderboard challenges.', to: '/devquests' },
          ].map((card) => (
            <Link
              key={card.title}
              to={card.to}
              className="rounded-2xl border border-neutral-200 p-6 hover:border-neutral-400 transition dark:border-white/10 dark:hover:border-white/25"
            >
              <card.icon className="h-8 w-8 text-violet-600 dark:text-violet-400" />
              <h3 className="mt-4 text-lg font-semibold">{card.title}</h3>
              <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">{card.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-t border-neutral-200 bg-gray-900 py-16 text-center text-white dark:border-white/10">
        <h2 className="font-display text-3xl md:text-4xl font-bold">Ready to revolutionize your hackathon experience?</h2>
        <p className="mx-auto mt-4 max-w-lg text-gray-300">
          Join thousands of students building skills, portfolios, and futures with Techastra.
        </p>
        <button
          type="button"
          onClick={() => loginAs('student@techastra.local')}
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-8 py-3 text-sm font-semibold text-gray-900"
        >
          <Zap className="h-4 w-4" />
          Join with 1-Click
        </button>
      </section>
    </div>
  );
}
