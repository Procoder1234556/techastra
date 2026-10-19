import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Building2, Calendar, FileText, HelpCircle, ListChecks } from 'lucide-react';
import { api } from '../lib/api';
import { runRazorpayCheckout } from '../lib/razorpay';
import { useAuth } from '../context/AuthContext';
import { API } from '../lib/apiPaths';

const STEPS = [
  { id: 'basic', title: 'Basic Info', icon: Building2, description: 'Name & organization' },
  { id: 'details', title: 'Event Details', icon: Calendar, description: 'Dates, location & teams' },
  { id: 'content', title: 'Content', icon: FileText, description: 'Themes, prizes & rules' },
  { id: 'schedule', title: 'FAQ', icon: HelpCircle, description: 'Frequently asked questions' },
  { id: 'questions', title: 'Reg. Questions', icon: ListChecks, description: 'Custom registration fields' },
] as const;

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
  prizes: string;
  rules: string;
  description: string;
  faq: string;
  bannerUrl: string;
  paid: boolean;
  price: number;
  live: boolean;
  customQuestions: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
};

export function HostEvent() {
  const { user, loginAs } = useAuth();
  const [searchParams] = useSearchParams();
  const editSlug = searchParams.get('edit') || '';
  const [step, setStep] = useState(0);
  const [msg, setMsg] = useState('');
  const [createdSlug, setCreatedSlug] = useState('');
  const [paying, setPaying] = useState(false);
  const [data, setData] = useState<WizardData>({
    name: '',
    subtitle: '',
    location: '',
    eventType: 'hackathon',
    startDate: new Date().toISOString().slice(0, 10),
    endDate: new Date().toISOString().slice(0, 10),
    teamSize: '2-4',
    organizationName: 'Techastra',
    theme: '',
    prizes: '',
    rules: '',
    description: '',
    faq: '',
    bannerUrl: '',
    paid: false,
    price: 499,
    live: true,
    customQuestions: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
  });

  const patch = (partial: Partial<WizardData>) => setData((d) => ({ ...d, ...partial }));

  useEffect(() => {
    if (!editSlug || !user) return;
    api.get<Record<string, unknown>>(`/api/v1/events/name/${encodeURIComponent(editSlug)}`).then((res) => {
      const e = res.data;
      setCreatedSlug(String(e.hackathon || editSlug));
      const faq = Array.isArray(e.faq)
        ? (e.faq as { question: string; answer?: string }[]).map((f) => `${f.question}${f.answer ? ` | ${f.answer}` : ''}`).join('\n')
        : '';
      const regQ = Array.isArray(e.registrationQuestions)
        ? (e.registrationQuestions as { label: string }[]).map((q) => q.label).join('\n')
        : '';
      const contact = (e.contact as { name?: string; email?: string; phoneNumber?: string }) || {};
      patch({
        name: String(e.name || ''),
        subtitle: String(e.subtitle || ''),
        location: String(e.location || ''),
        eventType: String(e.eventType || 'hackathon'),
        startDate: String(e.startDate || '').slice(0, 10),
        endDate: String(e.endDate || '').slice(0, 10),
        teamSize: String(e.teamSize || '2-4'),
        organizationName: String(e.organizationName || ''),
        theme: Array.isArray(e.theme) ? e.theme.join(', ') : '',
        prizes: String(e.prizes || ''),
        rules: String(e.rules || ''),
        description: String(e.description || ''),
        faq,
        bannerUrl: String(e.bannerUrl || ''),
        paid: Boolean(e.paid),
        price: Number(e.price) || 0,
        live: e.live !== false,
        customQuestions: regQ,
        contactName: contact.name || '',
        contactEmail: contact.email || '',
        contactPhone: contact.phoneNumber || '',
      });
    });
  }, [editSlug, user]);

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
    const required = ['name', 'organizationName', 'startDate', 'endDate', 'location'] as const;
    const missing = required.filter((k) => !data[k]?.trim());
    if (missing.length) {
      setMsg(`Please fill required fields: ${missing.join(', ')}`);
      return;
    }
    const questions = data.customQuestions
      .split('\n')
      .map((q) => q.trim())
      .filter(Boolean)
      .map((label, i) => ({ id: `q${i + 1}`, label, type: 'text', required: false }));

    const faqItems = data.faq
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [q, a] = line.split('|').map((s) => s.trim());
        return { question: q || line, answer: a || '' };
      });

    const payload = {
      name: data.name,
      subtitle: data.subtitle,
      location: data.location,
      eventType: data.eventType,
      startDate: data.startDate,
      endDate: data.endDate,
      teamSize: data.teamSize,
      organizationName: data.organizationName,
      theme: data.theme ? data.theme.split(',').map((t) => t.trim()) : [],
      prizes: data.prizes,
      rules: data.rules,
      description: data.description,
      faq: faqItems,
      bannerUrl: data.bannerUrl,
      paid: data.paid,
      price: data.paid ? data.price : 0,
      live: data.live,
      registrationQuestions: questions,
      contact: {
        name: data.contactName,
        email: data.contactEmail,
        phoneNumber: data.contactPhone,
      },
    };

    const res = editSlug
      ? await api.put<{ hackathon: string; _id: string }>(
          `${API.eventsUpdate}/${encodeURIComponent(editSlug)}`,
          payload,
        )
      : await api.post<{ hackathon: string; _id: string }>('/api/v1/events/create', payload);
    setCreatedSlug(res.data.hackathon);

    if (!editSlug && data.paid && data.price > 0) {
      setPaying(true);
      try {
        const outcome = await runRazorpayCheckout({
          amountPaise: Math.round(data.price * 100),
          eventId: res.data._id,
          description: `Paid event listing — ${data.name}`,
          prefill: { name: user.name, email: user.email },
        });
        setMsg(
          outcome === 'paid'
            ? 'Event created and payment received.'
            : 'Event created (mock checkout — set RAZORPAY_KEY_ID in .env for live payments).',
        );
      } catch (err) {
        setMsg(
          `Event created, but payment was not completed: ${err instanceof Error ? err.message : 'unknown error'}. You can retry from the organizer dashboard.`,
        );
      } finally {
        setPaying(false);
      }
    } else {
      setMsg(editSlug ? 'Event updated successfully!' : 'Event created successfully!');
    }
  };

  const current = STEPS[step];

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="font-display text-3xl font-bold text-center">
        {editSlug ? 'Edit event' : 'Host an event'}
      </h1>
      <p className="mt-2 text-center text-sm text-neutral-500">
        Step {step + 1} of {STEPS.length}: {current.title}
      </p>
      <div className="mt-6 flex justify-center gap-2">
        {STEPS.map((s, i) => (
          <div
            key={s.id}
            title={s.description}
            className={`h-1.5 w-10 rounded-full ${i <= step ? 'bg-gray-900 dark:bg-white' : 'bg-neutral-200 dark:bg-white/20'}`}
          />
        ))}
      </div>

      <div className="mt-8 text-center mb-6">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-neutral-200 dark:border-white/10">
          <current.icon className="h-6 w-6 text-neutral-600 dark:text-neutral-400" />
        </div>
        <h3 className="mt-3 font-semibold">{current.title}</h3>
        <p className="text-sm text-neutral-500">{current.description}</p>
      </div>

      <div className="space-y-4">
        {step === 0 && (
          <>
            <input
              className="w-full rounded-lg border px-3 py-2 dark:border-white/20"
              placeholder="Event name *"
              value={data.name}
              onChange={(e) => patch({ name: e.target.value })}
            />
            <input
              className="w-full rounded-lg border px-3 py-2 dark:border-white/20"
              placeholder="Subtitle"
              value={data.subtitle}
              onChange={(e) => patch({ subtitle: e.target.value })}
            />
            <input
              className="w-full rounded-lg border px-3 py-2 dark:border-white/20"
              placeholder="Organization name *"
              value={data.organizationName}
              onChange={(e) => patch({ organizationName: e.target.value })}
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
              placeholder="Location *"
              value={data.location}
              onChange={(e) => patch({ location: e.target.value })}
            />
            <input
              className="w-full rounded-lg border px-3 py-2 dark:border-white/20"
              placeholder="Team size (e.g. 2-4)"
              value={data.teamSize}
              onChange={(e) => patch({ teamSize: e.target.value })}
            />
            <input
              className="w-full rounded-lg border px-3 py-2 dark:border-white/20"
              placeholder="Contact name"
              value={data.contactName}
              onChange={(e) => patch({ contactName: e.target.value })}
            />
            <input
              className="w-full rounded-lg border px-3 py-2 dark:border-white/20"
              placeholder="Contact email"
              value={data.contactEmail}
              onChange={(e) => patch({ contactEmail: e.target.value })}
            />
          </>
        )}
        {step === 2 && (
          <>
            <textarea
              className="w-full rounded-lg border px-3 py-2 dark:border-white/20"
              rows={3}
              placeholder="Description"
              value={data.description}
              onChange={(e) => patch({ description: e.target.value })}
            />
            <input
              className="w-full rounded-lg border px-3 py-2 dark:border-white/20"
              placeholder="Themes (comma-separated)"
              value={data.theme}
              onChange={(e) => patch({ theme: e.target.value })}
            />
            <textarea
              className="w-full rounded-lg border px-3 py-2 dark:border-white/20"
              rows={2}
              placeholder="Prizes"
              value={data.prizes}
              onChange={(e) => patch({ prizes: e.target.value })}
            />
            <textarea
              className="w-full rounded-lg border px-3 py-2 dark:border-white/20"
              rows={3}
              placeholder="Rules"
              value={data.rules}
              onChange={(e) => patch({ rules: e.target.value })}
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
              <img src={data.bannerUrl} alt="Banner" className="h-32 w-full rounded-lg object-cover" />
            )}
          </>
        )}
        {step === 3 && (
          <textarea
            className="w-full rounded-lg border px-3 py-2 dark:border-white/20"
            rows={8}
            placeholder="FAQ — one per line, optional answer after |&#10;What is the team size? | 2-4 members"
            value={data.faq}
            onChange={(e) => patch({ faq: e.target.value })}
          />
        )}
        {step === 4 && (
          <>
            <textarea
              className="w-full rounded-lg border px-3 py-2 dark:border-white/20"
              rows={4}
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
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={data.live} onChange={(e) => patch({ live: e.target.checked })} />
              List publicly when published
            </label>
          </>
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
        {step < STEPS.length - 1 ? (
          <button
            type="button"
            onClick={() => setStep((s) => s + 1)}
            className="rounded-full bg-gray-900 px-4 py-2 text-sm text-white dark:bg-white dark:text-gray-900"
          >
            Continue
          </button>
        ) : (
          <button
            type="button"
            onClick={submit}
            disabled={paying}
            className="rounded-full bg-gray-900 px-4 py-2 text-sm text-white disabled:opacity-60 dark:bg-white dark:text-gray-900"
          >
            {paying
              ? 'Opening checkout…'
              : editSlug
                ? 'Save changes'
                : data.paid && data.price > 0
                  ? 'Publish & pay'
                  : 'Publish event'}
          </button>
        )}
      </div>

      {msg && (
        <p className="mt-4 text-sm text-green-600 dark:text-green-400">
          {msg}{' '}
          {createdSlug && (
            <Link to={`/event/${createdSlug}`} className="underline">
              View event
            </Link>
          )}
        </p>
      )}
    </div>
  );
}
