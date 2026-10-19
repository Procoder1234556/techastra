import { useState } from 'react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { BadgeCheck, Loader2 } from 'lucide-react';

type Props = {
  eventName: string;
  verified?: boolean;
  onChange?: (verified: boolean) => void;
};

export function EventVerifyBadge({ eventName, verified: initial, onChange }: Props) {
  const { user } = useAuth();
  const canVerify = user && ['admin', 'superadmin'].includes(user.role);
  const [verified, setVerified] = useState(!!initial);
  const [loading, setLoading] = useState(false);

  if (!canVerify) {
    if (!verified) return null;
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-600 dark:bg-blue-500/15 dark:text-blue-400">
        <BadgeCheck className="h-3.5 w-3.5" />
        Verified
      </span>
    );
  }

  const toggle = async () => {
    setLoading(true);
    const next = !verified;
    try {
      await api.patch(`/api/v1/events/verify/${encodeURIComponent(eventName)}`, { verified: next });
      setVerified(next);
      onChange?.(next);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={loading}
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition disabled:opacity-50 ${
        verified
          ? 'bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400'
          : 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800'
      }`}
    >
      {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <BadgeCheck className="h-3.5 w-3.5" />}
      {verified ? 'Verified' : 'Verify'}
    </button>
  );
}
