import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, type Event } from '../lib/api';
import { runRazorpayCheckout } from '../lib/razorpay';
import { useAuth } from '../context/AuthContext';
import { EventVerifyBadge } from '../components/EventVerifyBadge';
import { API } from '../lib/apiPaths';

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

  if (!event) {
    return <p className="p-8 text-center">Loading event…</p>;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      {event.bannerUrl && (
        <img src={event.bannerUrl} alt="" className="mb-8 h-48 w-full rounded-2xl object-cover md:h-64" />
      )}
      <div className="flex flex-wrap items-center gap-3">
        <p className="text-sm uppercase tracking-wide text-neutral-500">{event.eventType}</p>
        <EventVerifyBadge
          eventName={event.hackathon}
          verified={event.verified}
          onChange={(v) => setEvent((e) => (e ? { ...e, verified: v } : e))}
        />
      </div>
      <h1 className="font-display text-3xl md:text-4xl font-bold mt-2">{event.name}</h1>
      <p className="mt-3 text-neutral-600 dark:text-neutral-400">{event.subtitle}</p>
      {event.description && (
        <p className="mt-6 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">{event.description}</p>
      )}
      <dl className="mt-8 grid grid-cols-2 gap-4 text-sm">
        <div>
          <dt className="text-neutral-500">When</dt>
          <dd className="font-medium">{event.startDate} – {event.endDate}</dd>
        </div>
        <div>
          <dt className="text-neutral-500">Where</dt>
          <dd className="font-medium">{event.location}</dd>
        </div>
        <div>
          <dt className="text-neutral-500">Team size</dt>
          <dd className="font-medium">{event.teamSize}</dd>
        </div>
        <div>
          <dt className="text-neutral-500">Prize</dt>
          <dd className="font-medium">{event.prizePool || event.prizes || 'TBA'}</dd>
        </div>
        {event.organizationName && (
          <div className="col-span-2">
            <dt className="text-neutral-500">Organizer</dt>
            <dd className="font-medium">{event.organizationName}</dd>
          </div>
        )}
      </dl>
      {event.theme && event.theme.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {event.theme.map((t) => (
            <span key={t} className="rounded-full bg-neutral-100 px-3 py-1 text-xs dark:bg-white/10">
              {t}
            </span>
          ))}
        </div>
      )}
      {event.rules && (
        <section className="mt-10">
          <h2 className="font-semibold">Rules</h2>
          <p className="mt-2 whitespace-pre-wrap text-sm text-neutral-600 dark:text-neutral-400">{event.rules}</p>
        </section>
      )}
      {event.faq && event.faq.length > 0 && (
        <section className="mt-10">
          <h2 className="font-semibold">FAQ</h2>
          <ul className="mt-4 space-y-4 text-sm">
            {event.faq.map((item, i) => (
              <li key={i}>
                <p className="font-medium">{item.question}</p>
                {item.answer && <p className="mt-1 text-neutral-500">{item.answer}</p>}
              </li>
            ))}
          </ul>
        </section>
      )}
      {event.paid && (event.price ?? 0) > 0 && (
        <p className="mt-8 text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Registration fee: ₹{event.price} (pay at checkout)
        </p>
      )}
      <div className="mt-10 flex flex-wrap gap-3">
        <button
          type="button"
          disabled={registering || event.hasRegistered}
          onClick={register}
          className="rounded-full bg-neutral-900 px-8 py-3 text-sm font-semibold text-white disabled:opacity-50 dark:bg-white dark:text-neutral-900"
        >
          {event.hasRegistered
            ? 'Already registered'
            : registering
              ? 'Processing…'
              : event.paid && (event.price ?? 0) > 0
                ? `Register · ₹${event.price}`
                : '1-Click Register'}
        </button>
        {event.hasRegistered && (
          <Link
            to={`/event/${event.hackathon}/team-formation`}
            className="rounded-full border px-6 py-3 text-sm font-semibold dark:border-white/20"
          >
            Team formation
          </Link>
        )}
      </div>
      {event.hasRegistered && checkedIn && (
        <p className="mt-3 text-sm text-blue-600 dark:text-blue-400">You are checked in for this event.</p>
      )}
      {message && <p className="mt-3 text-sm text-green-600">{message}</p>}
    </div>
  );
}
