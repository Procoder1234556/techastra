import { useEffect, useState } from 'react';
import { api } from '../../lib/api';

type UserRow = { email: string; name?: string; role?: string };

export function MailerHubAdminTab() {
  const [check, setCheck] = useState<Record<string, unknown> | null>(null);
  const [users, setUsers] = useState<UserRow[]>([]);

  useEffect(() => {
    api.get('/api/v1/mailerhub/system-check').then((r) => setCheck(r.data));
    api.get<{ emails?: UserRow[] }>('/api/v1/mailerhub/users').then((r) => {
      setUsers(r.data.emails || (r.data as { users?: UserRow[] }).users || []);
    });
  }, []);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <h2 className="text-lg font-semibold">System check</h2>
        {check && (
          <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
            {Object.entries(check).map(([k, v]) => (
              <div key={k}>
                <dt className="text-white/40">{k}</dt>
                <dd>{String(v)}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <h3 className="font-medium">Mailer user directory</h3>
        <p className="mt-1 text-xs text-white/40">{users.length} accounts</p>
        <ul className="mt-4 max-h-80 overflow-y-auto space-y-1 text-sm">
          {users.slice(0, 100).map((u) => (
            <li key={u.email} className="flex justify-between border-b border-white/5 py-1.5">
              <span>{u.name || u.email}</span>
              <span className="text-white/40">{u.role}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
