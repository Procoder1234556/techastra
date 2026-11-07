import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, type Event } from '../lib/api';
import { runRazorpayCheckout } from '../lib/razorpay';
import { useAuth } from '../context/AuthContext';
import { EventVerifyBadge } from '../components/EventVerifyBadge';
import { API } from '../lib/apiPaths';
import { Smartphone, Calendar, CheckCircle2, QrCode } from 'lucide-react';

type FaqItem = { question: string; answer?: string };

type EventDoc = Event & {
  bannerUrl?: string;
  description?: string;
  rules?: string;
  prizes?: string;
  verified?: boolean;
  faq?: FaqItem[];
};

export function EventDetail() {
  const { eventName } = useParams();
  const { user, loginAs } = useAuth();
  const [event, setEvent] = useState<EventDoc | null>(null);
  const [registering, setRegistering] = useState(false);
  const [message, setMessage] = useState('');
  const [checkedIn, setCheckedIn] = useState(false);

  useEffect(() => {
    if (!eventName) return;
    api.get<EventDoc>(`/api/v1/events/name/${encodeURIComponent(eventName)}`).then((res) => {
      setEvent(res.data);
    });
  }, [eventName]);

  useEffect(() => {
    if (!eventName || !user) return;
    api.get<{ checkedIn: boolean }>(`${API.checkinMy}/${encodeURIComponent(eventName)}`).then((res) => {
      setCheckedIn(res.data.checkedIn);
    });
  }, [eventName, user]);

  const register = async () => {
    if (!user) {
      loginAs('student@techastra.local');
      return;
    }
    if (!event) return;
    setRegistering(true);
    setMessage('');
    try {
      if (event.paid && (event.price ?? 0) > 0) {
        await runRazorpayCheckout({
          amountPaise: Math.round((event.price ?? 0) * 100),
          eventId: event._id,
          description: `Registration — ${event.name}`,
          prefill: { name: user.name, email: user.email },
        });
      }
      await api.post('/api/v1/events/register', { eventId: event._id });
      setMessage('Registered successfully!');
      setEvent({ ...event, hasRegistered: true });
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : 'Registration failed';
      setMessage(msg || 'Registration failed');
    } finally {
      setRegistering(false);
    }
  };

  const handleCalendarExport = () => {
    if (!event) return;
    const title = encodeURIComponent(event.name);
    const details = encodeURIComponent(event.description || event.subtitle || 'Techastra Hackathon');
    const location = encodeURIComponent(event.location || 'Bangalore Tech Center / Hybrid');
    const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}`;
    window.open(googleUrl, '_blank');
  };

  if (!event) {
    return <p className="p-8 text-center text-neutral-500">Loading event details...</p>;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      {event.bannerUrl && (
        <img src={event.bannerUrl} alt="" className="mb-8 h-48 w-full rounded-2xl object-cover md:h-64 border border-neutral-200 dark:border-white/10" />
      )}
      <div className="flex flex-wrap items-center gap-3">
        <p className="text-sm uppercase tracking-wide text-neutral-500 font-semibold">{event.eventType}</p>
        <EventVerifyBadge
          eventName={event.hackathon}
          verified={event.verified}
          onChange={(v) => setEvent((e) => (e ? { ...e, verified: v } : e))}
        />
        {checkedIn && (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" /> Checked in at Venue Gate
          </span>
        )}
      </div>

      <h1 className="font-display text-3xl md:text-4xl font-bold mt-2 text-neutral-900 dark:text-white">{event.name}</h1>
      <p className="mt-3 text-neutral-600 dark:text-neutral-400">{event.subtitle}</p>

      {/* Mobile Pass & Calendar Integration Pill Bar */}
      <div className="mt-6 p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-500/30 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shrink-0">
            <QrCode className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-neutral-900 dark:text-white">Luma-Grade Mobile Dynamic Pass</p>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">Anti-screenshot QR pass & 100ms offline gate scan</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCalendarExport}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-neutral-300 dark:border-white/20 bg-white dark:bg-neutral-900 text-xs font-medium hover:bg-neutral-50 dark:hover:bg-neutral-800"
          >
            <Calendar className="w-3.5 h-3.5 text-indigo-500" /> Add to Calendar
          </button>
          <Link
            to="/mobile"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500"
          >
            <Smartphone className="w-3.5 h-3.5" /> Open Mobile Pass
          </Link>
        </div>
      </div>

      {event.description && (
        <p className="mt-6 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">{event.description}</p>
      )}

      <dl className="mt-8 grid grid-cols-2 gap-4 text-sm bg-neutral-50 dark:bg-neutral-900/40 p-4 rounded-2xl border border-neutral-200 dark:border-white/10">
        <div>
          <dt className="text-neutral-500">When</dt>
          <dd className="font-medium text-neutral-900 dark:text-white">{event.startDate} — {event.endDate}</dd>
        </div>
        <div>
          <dt className="text-neutral-500">Where</dt>
          <dd className="font-medium text-neutral-900 dark:text-white">{event.location}</dd>
        </div>
        <div>
          <dt className="text-neutral-500">Team size</dt>
          <dd className="font-medium text-neutral-900 dark:text-white">{event.teamSize}</dd>
        </div>
        <div>
          <dt className="text-neutral-500">Prize Pool</dt>
          <dd className="font-medium text-indigo-600 dark:text-indigo-400 font-bold">{event.prizePool || event.prizes || 'TBA'}</dd>
        </div>
        {event.organizationName && (
          <div className="col-span-2">
            <dt className="text-neutral-500">Organizer</dt>
            <dd className="font-medium text-neutral-900 dark:text-white">{event.organizationName}</dd>
          </div>
        )}
      </dl>

      {event.theme && event.theme.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {event.theme.map((t) => (
            <span key={t} className="rounded-full bg-neutral-100 px-3 py-1 text-xs dark:bg-white/10 text-neutral-700 dark:text-neutral-300">
              {t}
            </span>
          ))}
        </div>
      )}

      {event.rules && (
        <section className="mt-10">
          <h2 className="font-semibold text-neutral-900 dark:text-white">Rules & Guidelines</h2>
          <p className="mt-2 whitespace-pre-wrap text-sm text-neutral-600 dark:text-neutral-400">{event.rules}</p>
        </section>
      )}

      {event.faq && event.faq.length > 0 && (
        <section className="mt-10">
          <h2 className="font-semibold text-neutral-900 dark:text-white">FAQ</h2>
          <ul className="mt-4 space-y-4 text-sm">
            {event.faq.map((item, i) => (
              <li key={i} className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900/40 border border-neutral-200 dark:border-white/10">
                <p className="font-medium text-neutral-900 dark:text-white">{item.question}</p>
                {item.answer && <p className="mt-1 text-neutral-500 dark:text-neutral-400">{item.answer}</p>}
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="mt-10 pt-6 border-t border-neutral-200 dark:border-white/10 flex flex-wrap items-center justify-between gap-4">
        <div>
          {event.paid && (event.price ?? 0) > 0 ? (
            <p className="text-sm font-semibold text-neutral-900 dark:text-white">
              Fee: <span className="text-indigo-600 dark:text-indigo-400 font-bold">₹{event.price}</span> (via Razorpay)
            </p>
          ) : (
            <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">Free Registration</p>
          )}
          {message && <p className="text-xs text-indigo-500 mt-1">{message}</p>}
        </div>

        <div className="flex gap-3">
          <Link
            to={`/event/${encodeURIComponent(event.hackathon)}/team-formation`}
            className="rounded-full border border-neutral-300 dark:border-white/20 px-6 py-2.5 text-sm font-semibold hover:bg-neutral-50 dark:hover:bg-neutral-800"
          >
            Find Squad / Team
          </Link>
          <button
            type="button"
            disabled={registering || event.hasRegistered}
            onClick={register}
            className="rounded-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 px-8 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30"
          >
            {event.hasRegistered ? 'Registered' : registering ? 'Processing...' : 'Register in 1-Click'}
          </button>
        </div>
      </div>
    </div>
  );
}