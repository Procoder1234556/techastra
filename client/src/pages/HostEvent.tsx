import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';

type WizardData = {
  name: string;
  subtitle: string;
  location: string;
  eventType: string;
  startDate: string;
  endDate: string;
  teamSize: string;
  organizationName: string;
  theme: string;
  bannerUrl: string;
  paid: boolean;
  price: number;
  live: boolean;
  customQuestions: string;
};

const steps = ['Basics', 'Schedule', 'Details', 'Publish'];

export function HostEvent() {
  const { user, loginAs } = useAuth();
  const [step, setStep] = useState(0);
  const [msg, setMsg] = useState('');
  const [createdSlug, setCreatedSlug] = useState('');
  const [data, setData] = useState<WizardData>({
    name: '',
    subtitle: '',
    location: '',
    eventType: 'hackathon',
    startDate: new Date().toISOString().slice(0, 10),
    endDate: new Date().toISOString().slice(0, 10),
    teamSize: '2-4',
    organizationName: 'TechAstra',
    theme: '',
    bannerUrl: '',
    paid: false,
    price: 499,
    live: true,
    customQuestions: '',
  });

  const patch = (partial: Partial<WizardData>) => setData((d) => ({ ...d, ...partial }));

  const uploadBanner = async (file: File) => {
    if (!user) return loginAs('organizer@techastra.local');
    const form = new FormData();
    form.append('banner', file);
    const res = await api.post<{ url: string }>('/api/v1/upload/banner', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    patch({ bannerUrl: res.data.url });
  };

  const submit = async () => {
    if (!user) return loginAs('organizer@techastra.local');
    if (!data.name.trim()) {
      setMsg('Event name is required.');
      return;
    }
    const questions = data.customQuestions
      .split('\n')
      .map((q) => q.trim())
      .filter(Boolean)
      .map((label, i) => ({ id: `q${i + 1}`, label, type: 'text', required: false }));

    const res = await api.post<{ hackathon: string; _id: string }>('/api/v1/events/create', {
      name: data.name,
      subtitle: data.subtitle,
      location: data.location,
      eventType: data.eventType,
      startDate: data.startDate,
      endDate: data.endDate,
      teamSize: data.teamSize,
      organizationName: data.organizationName,
      theme: data.theme ? data.theme.split(',').map((t) => t.trim()) : [],
      bannerUrl: data.bannerUrl,
      paid: data.paid,
      price: data.paid ? data.price : 0,
      live: data.live,
      registrationQuestions: questions,
    });
    setCreatedSlug(res.data.hackathon);
    if (data.paid && data.price > 0) {
      await api.post('/api/v1/payment/create-order', {
        eventId: res.data._id,
        amount: data.price * 100,
      });
    }
    setMsg('Event published. Share the link with participants.');
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="font-display text-3xl font-bold">Host an event</h1>
      <p className="mt-2 text-sm text-neutral-500">Step {step + 1} of {steps.length}: {steps[step]}</p>
      <div className="mt-4 flex gap-2">
        {steps.map((label, i) => (
          <div
            key={label}
            className={`h-1 flex-1 rounded-full ${i <= step ? 'bg-neutral-900 dark:bg-white' : 'bg-neutral-200 dark:bg-white/20'}`}
          />
        ))}
      </div>

      <div className="mt-8 space-y-4">
        {step === 0 && (
          <>
            <input
              className="w-full rounded-lg border px-3 py-2 dark:border-white/20"
              placeholder="Event name"
              value={data.name}
              onChange={(e) => patch({ name: e.target.value })}
            />
            <input
              className="w-full rounded-lg border px-3 py-2 dark:border-white/20"
              placeholder="Subtitle"
              value={data.subtitle}
              onChange={(e) => patch({ subtitle: e.target.value })}
            />
            <select
              className="w-full rounded-lg border px-3 py-2 dark:border-white/20 dark:bg-neutral-950"
              value={data.eventType}
              onChange={(e) => patch({ eventType: e.target.value })}
            >
              <option value="hackathon">Hackathon</option>
              <option value="workshop">Workshop</option>
              <option value="meetup">Meetup</option>
            </select>
          </>
        )}
        {step === 1 && (
          <>
            <input
              type="date"
              className="w-full rounded-lg border px-3 py-2 dark:border-white/20"
              value={data.startDate}
              onChange={(e) => patch({ startDate: e.target.value })}
            />
            <input
              type="date"
              className="w-full rounded-lg border px-3 py-2 dark:border-white/20"
              value={data.endDate}
              onChange={(e) => patch({ endDate: e.target.value })}
            />
            <input
              className="w-full rounded-lg border px-3 py-2 dark:border-white/20"
              placeholder="Location or Online"
              value={data.location}
              onChange={(e) => patch({ location: e.target.value })}
            />
          </>
        )}
        {step === 2 && (
          <>
            <input
              className="w-full rounded-lg border px-3 py-2 dark:border-white/20"
              placeholder="Organization name"
              value={data.organizationName}
              onChange={(e) => patch({ organizationName: e.target.value })}
            />
            <input
              className="w-full rounded-lg border px-3 py-2 dark:border-white/20"
              placeholder="Themes (comma-separated)"
              value={data.theme}
              onChange={(e) => patch({ theme: e.target.value })}
            />
            <input
              className="w-full rounded-lg border px-3 py-2 dark:border-white/20"
              placeholder="Team size (e.g. 2-4)"
              value={data.teamSize}
              onChange={(e) => patch({ teamSize: e.target.value })}
            />
            <label className="block text-sm">
              Banner image
              <input
                type="file"
                accept="image/*"
                className="mt-1 w-full text-sm"
                onChange={(e) => e.target.files?.[0] && uploadBanner(e.target.files[0])}
              />
            </label>
            {data.bannerUrl && (
              <img src={data.bannerUrl} alt="Banner preview" className="h-32 w-full rounded-lg object-cover" />
            )}
            <textarea
              className="w-full rounded-lg border px-3 py-2 dark:border-white/20"
              rows={3}
              placeholder="Custom registration questions (one per line)"
              value={data.customQuestions}
              onChange={(e) => patch({ customQuestions: e.target.value })}
            />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={data.paid} onChange={(e) => patch({ paid: e.target.checked })} />
              Paid event (Razorpay / mock checkout)
            </label>
            {data.paid && (
              <input
                type="number"
                className="w-full rounded-lg border px-3 py-2 dark:border-white/20"
                placeholder="Price in INR"
                value={data.price}
                onChange={(e) => patch({ price: Number(e.target.value) })}
              />
            )}
          </>
        )}
        {step === 3 && (
          <div className="rounded-xl border border-neutral-200 p-4 text-sm dark:border-white/10">
            <p className="font-semibold">{data.name || 'Untitled event'}</p>
            <p className="text-neutral-500">{data.subtitle}</p>
            <p className="mt-2">{data.startDate} → {data.endDate} · {data.location || 'TBD'}</p>
            <p className="mt-1">{data.eventType} · {data.organizationName}</p>
            {data.paid && <p className="mt-1">₹{data.price} registration</p>}
            <label className="mt-4 flex items-center gap-2">
              <input type="checkbox" checked={data.live} onChange={(e) => patch({ live: e.target.checked })} />
              List publicly when published
            </label>
          </div>
        )}
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        {step > 0 && (
          <button
            type="button"
            onClick={() => setStep((s) => s - 1)}
            className="rounded-full border px-4 py-2 text-sm dark:border-white/20"
          >
            Back
          </button>
        )}
        {step < steps.length - 1 ? (
          <button
            type="button"
            onClick={() => setStep((s) => s + 1)}
            className="rounded-full bg-neutral-900 px-4 py-2 text-sm text-white dark:bg-white dark:text-neutral-900"
          >
            Continue
          </button>
        ) : (
          <button
            type="button"
            onClick={submit}
            className="rounded-full bg-neutral-900 px-4 py-2 text-sm text-white dark:bg-white dark:text-neutral-900"
          >
            Publish event
          </button>
        )}
      </div>

      {msg && (
        <p className="mt-4 text-sm text-green-600 dark:text-green-400">
          {msg}{' '}
          {createdSlug && (
            <Link to={`/events/${createdSlug}`} className="underline">
              View event
            </Link>
          )}
        </p>
      )}
    </div>
  );
}
