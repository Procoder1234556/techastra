import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { API } from '../../lib/apiPaths';

type Contact = { _id: string; name: string; email: string; city?: string; role?: string };

export function MailerHubContactsTab() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');
  const [cities, setCities] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [importMsg, setImportMsg] = useState('');

  const loadLocations = () => {
    api.get<{ locations: { city: string }[] }>('/api/v1/mailerhub/contacts/locations').then((r) => {
      setCities((r.data.locations || []).map((l) => l.city).filter(Boolean));
    });
  };

  const loadContacts = () => {
    setLoading(true);
    api
      .get<{ contacts: Contact[]; total: number }>('/api/v1/mailerhub/contacts', {
        params: { search: search || undefined, city: city || undefined, limit: 100 },
      })
      .then((r) => {
        setContacts(r.data.contacts || []);
        setTotal(r.data.total ?? 0);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadLocations();
    loadContacts();
  }, []);

  useEffect(() => {
    loadContacts();
  }, [city]);

  const importCsv = async (file: File) => {
    const text = await file.text();
    const rows = text
      .split(/\r?\n/)
      .slice(1)
      .map((line) => {
        const [email, name] = line.split(',').map((c) => c.replace(/^"|"$/g, '').trim());
        return email ? { email, name: name || email } : null;
      })
      .filter(Boolean);
    const res = await api.post(API.mailerhubContactsImport, { rows });
    setImportMsg(`Imported ${res.data.imported ?? rows.length} rows`);
    loadContacts();
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <h2 className="text-lg font-semibold">Userbase contacts</h2>
        <p className="mt-1 text-sm text-white/40">Search registered users for campaigns and exports.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <input
            className="min-w-[200px] flex-1 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm"
            placeholder="Search name or email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          >
            <option value="">All colleges</option>
            {cities.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={loadContacts}
            className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-neutral-900"
          >
            Search
          </button>
          <label className="cursor-pointer rounded-full border border-white/20 px-4 py-2 text-sm">
            Import CSV
            <input
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && importCsv(e.target.files[0])}
            />
          </label>
        </div>
        <p className="mt-2 text-xs text-white/40">{total} contacts</p>
        {importMsg && <p className="mt-1 text-xs text-emerald-300">{importMsg}</p>}
      </div>
      {loading ? (
        <p className="text-sm text-white/40">Loading…</p>
      ) : (
        <ul className="max-h-[420px] overflow-y-auto space-y-1 text-sm">
          {contacts.map((c) => (
            <li key={c._id} className="flex justify-between border-b border-white/5 py-2 text-white/70">
              <span>{c.name}</span>
              <span className="text-white/40">{c.email}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
