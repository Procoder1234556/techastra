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
  Smartphone,
  ShieldCheck,
  QrCode,
  Calendar,
  WifiOff
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
    <div className="bg-white dark:bg-[#0B0F19]">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-neutral-200 dark:border-white/10">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-300/30 via-transparent to-transparent dark:from-indigo-900/40"
          aria-hidden
        />
        <div className="relative mx-auto max-w-6xl px-4 py-20 md:py-28 text-center">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 mb-4"
          >
            <Smartphone className="w-3.5 h-3.5" /> Live Mobile Passes & Gate Check-in Active
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="font-display text-4xl md:text-6xl font-bold tracking-tight text-gray-900 dark:text-white"
          >
            The Operating System for <span className="text-indigo-600 dark:text-indigo-400">Student Builders</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-5 text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto"
          >
            Discover verified hackathons, earn XP on DevQuests, generate dynamic mobile event passes, and scan attendees with 100ms offline verification.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mt-8 flex flex-wrap justify-center gap-3"
          >
            <Link
              to="/events"
              className="rounded-full bg-gray-900 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 dark:bg-indigo-600 dark:hover:bg-indigo-500"
            >
              Explore Events
            </Link>
            <Link
              to="/mobile"
              className="inline-flex items-center gap-2 rounded-full border border-indigo-500/40 bg-indigo-500/10 px-6 py-3 text-sm font-semibold text-indigo-600 dark:text-indigo-300 hover:bg-indigo-500/20"
            >
              <Smartphone className="h-4 w-4" />
              Launch Mobile Pass & Scanner
            </Link>
            <button
              type="button"
              onClick={() => loginAs('student@techastra.local')}
              className="inline-flex items-center gap-2 rounded-full border border-neutral-300 px-6 py-3 text-sm font-semibold dark:border-white/20"
            >
              <Zap className="h-4 w-4" />
              Join with 1-Click
            </button>
          </motion.div>
        </div>
      </section>

      {/* Partners Banner */}
      <section className="border-b border-neutral-200 py-12 dark:border-white/10">
        <p className="text-center text-xs uppercase tracking-widest text-neutral-400 mb-8">Trusted by builder communities across 500+ colleges</p>
        <PartnerLogos />
      </section>

      {/* Mobile App & Offline Pass Showcase */}
      <section className="mx-auto max-w-6xl px-4 py-16 border-b border-neutral-200 dark:border-white/10">
        <div className="rounded-3xl bg-gradient-to-br from-[#111827] to-[#161E2E] border border-indigo-500/30 p-8 md:p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="grid md:grid-cols-2 gap-8 items-center relative z-10">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 mb-4">
                <QrCode className="w-3.5 h-3.5" /> Luma-Inspired Mobile UX
              </span>
              <h2 className="text-2xl md:text-4xl font-display font-bold text-white tracking-tight">
                Digital Pass, Gate Scanner & Offline Mode
              </h2>
              <p className="mt-4 text-sm md:text-base text-gray-300 leading-relaxed">
                No cell signal in campus basements? Techastra encrypts your event pass directly onto your phone. Organizers scan QR codes instantly at 30fps with automatic duplicate protection.
              </p>
              <ul className="mt-6 space-y-3 text-sm text-gray-300">
                <li className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span><strong>Anti-Screenshot Protection:</strong> Live pulsating watermark prevents badge sharing.</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <WifiOff className="w-4 h-4 text-amber-400 shrink-0" />
                  <span><strong>Venue Offline Mode:</strong> Instant ticket verification without waiting on cell networks.</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Calendar className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span><strong>1-Tap Calendar Export:</strong> Native Apple & Google Calendar synchronisation.</span>
                </li>
              </ul>
              <div className="mt-8 flex gap-3">
                <Link
                  to="/mobile"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30"
                >
                  <Smartphone className="w-4 h-4" /> Try Interactive Mobile Experience
                </Link>
              </div>
            </div>

            {/* Mobile Visual Simulation Card */}
            <div className="flex justify-center">
              <div className="w-72 bg-[#0B0F19] border-2 border-gray-800 rounded-3xl p-4 shadow-2xl space-y-3">
                <div className="flex justify-between items-center text-[10px] text-gray-400 font-mono">
                  <span>TECHASTRA PASS</span>
                  <span className="text-emerald-400">&bull; VERIFIED</span>
                </div>
                <div className="w-full h-36 bg-[#161E2E] rounded-2xl flex flex-col items-center justify-center border border-indigo-500/30 relative">
                  <QrCode className="w-16 h-16 text-indigo-400" />
                  <span className="text-[9px] font-mono text-gray-400 mt-1">TA:REG9921:HMAC_SECURE</span>
                  <div className="absolute bottom-1 right-2 text-[8px] text-emerald-400 font-mono">OFFLINE CACHED</div>
                </div>
                <div className="text-xs space-y-1">
                  <p className="font-bold text-white text-sm">Techastra National Hack 2026</p>
                  <p className="text-[11px] text-gray-400">Nov 20 - 22 &bull; Bangalore Tech Center</p>
                </div>
                <div className="pt-2 border-t border-gray-800 flex justify-between items-center text-[11px]">
                  <span className="text-indigo-400 font-mono">ROLE: HACKER</span>
                  <span className="text-cyan-400 font-bold">142/300 Checked In</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-b border-neutral-200 bg-neutral-50 py-14 dark:border-white/10 dark:bg-neutral-900/40">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <h2 className="font-display text-2xl md:text-4xl font-bold text-gray-900 dark:text-white">
            Everything you need on one unified platform
          </h2>
          <div className="mt-10 grid grid-cols-2 gap-6 md:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.label}>
                <p className="text-2xl md:text-3xl font-bold text-indigo-600 dark:text-indigo-400">{s.value}</p>
                <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="mx-auto max-w-6xl px-4 py-16 border-b border-neutral-200 dark:border-white/10">
        <h2 className="text-center font-display text-2xl md:text-3xl font-bold">Platform capabilities</h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: Trophy, title: 'Hackathons', desc: 'Discover and join events that match your skills.', to: '/events' },
            { icon: Briefcase, title: 'Job board', desc: 'Tech opportunities from companies hiring builders.', to: '/jobs' },
            { icon: Users, title: 'Communities', desc: 'Chapters, clubs, and mentor networks.', to: '/communities' },
            { icon: UserPlus, title: 'Team building', desc: 'Form teams and collaborate on submissions.', to: '/events' },
            { icon: FolderKanban, title: 'DevQuests', desc: 'Earn XP, solve bounties, and climb leaderboards.', to: '/devquests' },
            { icon: Search, title: 'Smart discovery', desc: 'Filter by stack, theme, and format.', to: '/events' },
          ].map((card) => (
            <Link
              key={card.title}
              to={card.to}
              className="rounded-2xl border border-neutral-200 p-5 hover:border-neutral-400 dark:border-white/10 dark:hover:border-white/25 transition-all"
            >
              <card.icon className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
              <h3 className="mt-3 font-semibold">{card.title}</h3>
              <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{card.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative mx-auto max-w-6xl px-4 py-16 md:py-24 overflow-hidden">
        <div className="relative max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-display font-bold text-gray-900 dark:text-white">
            Built for <span className="text-indigo-600 dark:text-indigo-400">ambitious developers</span>
          </h2>
          <p className="mt-4 text-base md:text-lg text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
            Techastra is built for developers and students. Discover, register, build squads, and ship projects.
          </p>
          <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-sm text-gray-700 dark:bg-neutral-800 dark:text-gray-300">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            4.8 from 500+ participants
          </div>
        </div>
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
      </section>

      {/* CTA Footer Section */}
      <section className="border-t border-neutral-200 bg-gray-900 py-16 text-center text-white dark:border-white/10">
        <h2 className="font-display text-3xl md:text-4xl font-bold">Ready to revolutionize your hackathon journey?</h2>
        <p className="mx-auto mt-4 max-w-lg text-gray-300">
          Join thousands of students building skills, portfolios, and futures with Techastra.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <button
            type="button"
            onClick={() => loginAs('student@techastra.local')}
            className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-100"
          >
            <Zap className="h-4 w-4" />
            Join with 1-Click
          </button>
          <Link
            to="/mobile"
            className="inline-flex items-center gap-2 rounded-full border border-white/20 px-8 py-3 text-sm font-semibold text-white hover:bg-white/10"
          >
            <Smartphone className="h-4 w-4" />
            Open Mobile Pass
          </Link>
        </div>
      </section>
    </div>
  );
}