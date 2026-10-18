import { useState } from 'react';
import { api } from '../../lib/api';

export function OrganizerCertificates() {
  const [userId, setUserId] = useState('');
  const [eventId, setEventId] = useState('');
  const [msg, setMsg] = useState('');

  const issue = async () => {
    await api.post('/api/v1/certificates/send', {
      userId,
      eventId,
      title: 'Certificate of Participation',
    });
    setMsg('Certificate issued.');
  };

  return (
    <div className="max-w-md space-y-3">
      <input
        className="w-full rounded-lg border px-3 py-2 dark:border-white/20"
        placeholder="User ID (UUID)"
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
      />
      <input
        className="w-full rounded-lg border px-3 py-2 dark:border-white/20"
        placeholder="Event ID (UUID)"
        value={eventId}
        onChange={(e) => setEventId(e.target.value)}
      />
      <button type="button" onClick={issue} className="rounded-full bg-neutral-900 px-4 py-2 text-sm text-white">
        Issue certificate
      </button>
      {msg && <p className="text-sm text-green-600">{msg}</p>}
    </div>
  );
}
