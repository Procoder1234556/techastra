import { useCallback, useEffect, useRef, useState } from 'react';
import { Bell } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';

type NotificationRow = {
  _id: string;
  title: string;
  body?: string;
  message?: string;
  read?: boolean;
  createdAt?: string;
};

function timeAgo(iso?: string) {
  if (!iso) return '';
  const sec = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (sec < 60) return 'just now';
  const m = Math.floor(sec / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return d < 7 ? `${d}d ago` : new Date(iso).toLocaleDateString();
}

export function NotificationBell() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(0);
  const [items, setItems] = useState<NotificationRow[]>([]);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const refreshCount = useCallback(() => {
    if (!user?._id) return;
    api.get<{ count: number }>('/api/v1/notifications/unread-count').then((r) => setCount(r.data.count));
  }, [user?._id]);

  const loadList = useCallback(() => {
    if (!user?._id) return;
    setLoading(true);
    api
      .get<NotificationRow[]>('/api/v1/notifications')
      .then((r) => setItems(Array.isArray(r.data) ? r.data : []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [user?._id]);

  useEffect(() => {
    refreshCount();
    const t = setInterval(refreshCount, 60_000);
    return () => clearInterval(t);
  }, [refreshCount]);

  useEffect(() => {
    if (!open) return;
    loadList();
    const onDoc = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open, loadList]);

  const markRead = async (row: NotificationRow) => {
    if (row.read) return;
    await api.put(`/api/v1/notifications/${row._id}/read`);
    setItems((prev) => prev.map((n) => (n._id === row._id ? { ...n, read: true } : n)));
    setCount((c) => Math.max(0, c - 1));
  };

  const markAllRead = async () => {
    await api.put('/api/v1/notifications/read-all');
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    setCount(0);
  };

  if (!user?._id) return null;

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="relative rounded-full p-2 text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-white/10"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {count > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-bold text-white">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 max-h-[min(24rem,70vh)] overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xl dark:border-white/10 dark:bg-neutral-900">
          <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-3 dark:border-white/10">
            <span className="text-sm font-semibold">Notifications</span>
            {count > 0 && (
              <button type="button" onClick={markAllRead} className="text-xs text-blue-600 dark:text-blue-400">
                Mark all read
              </button>
            )}
          </div>
          <ul className="max-h-80 overflow-y-auto divide-y divide-neutral-100 dark:divide-white/[0.06]">
            {loading && <li className="px-4 py-6 text-center text-sm text-neutral-400">Loading…</li>}
            {!loading && items.length === 0 && (
              <li className="px-4 py-8 text-center text-sm text-neutral-400">No notifications yet.</li>
            )}
            {items.map((n) => (
              <li key={n._id}>
                <button
                  type="button"
                  onClick={() => markRead(n)}
                  className={`w-full px-4 py-3 text-left hover:bg-neutral-50 dark:hover:bg-white/[0.03] ${
                    n.read ? '' : 'bg-blue-50/50 dark:bg-blue-500/[0.06]'
                  }`}
                >
                  <p className={`text-sm truncate ${n.read ? 'text-neutral-700 dark:text-neutral-300' : 'font-semibold'}`}>
                    {n.title}
                  </p>
                  <p className="mt-0.5 text-xs text-neutral-500 line-clamp-2 whitespace-pre-line">
                    {n.body || n.message}
                  </p>
                  <p className="mt-1 text-[11px] text-neutral-400">{timeAgo(n.createdAt)}</p>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
