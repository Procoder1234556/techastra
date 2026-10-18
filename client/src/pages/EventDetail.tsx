import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api, type Event } from '../lib/api';
import { useAuth } from '../context/AuthContext';

export function EventDetail() {
  const { eventName } = useParams();
  const { user, loginAs } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [registering, setRegistering] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!eventName) return;
    api.get<Event>(`/api/v1/events/name/${encodeURIComponent(eventName)}`).then((res) => {
      setEvent(res.data);
    });
  }, [eventName]);

  const register = async () => {
    if (!user) {
      loginAs('student@techastra.local');
      return;
    }
    if (!event) return;
    setRegistering(true);
    setMessage('');
    try {
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

  const bannerUrl = (event as Event & { bannerUrl?: string }).bannerUrl;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      {bannerUrl && (
        <img src={bannerUrl} alt="" className="mb-8 h-48 w-full rounded-2xl object-cover" />
      )}
      <p className="text-sm uppercase tracking-wide text-neutral-500">{event.eventType}</p>
      <h1 className="font-display text-3xl md:text-4xl font-bold mt-2">{event.name}</h1>
      <p className="mt-3 text-neutral-600 dark:text-neutral-400">{event.subtitle}</p>
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
          <dd className="font-medium">{event.prizePool || 'TBA'}</dd>
        </div>
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
      <div className="mt-10">
        <button
          type="button"
          disabled={registering || event.hasRegistered}
          onClick={register}
          className="rounded-full bg-neutral-900 px-8 py-3 text-sm font-semibold text-white disabled:opacity-50 dark:bg-white dark:text-neutral-900"
        >
          {event.hasRegistered ? 'Already registered' : registering ? 'Registering…' : '1-Click Register'}
        </button>
        {message && <p className="mt-3 text-sm text-green-600">{message}</p>}
      </div>
    </div>
  );
}
