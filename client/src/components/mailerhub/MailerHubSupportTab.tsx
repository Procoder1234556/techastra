import { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, Loader2, Send } from 'lucide-react';
import { api } from '../../lib/api';

type InboxStatus = {
  imapAvailable?: boolean;
  connected?: boolean;
  provider?: string;
  accounts?: { _id: string; email: string; category?: string }[];
};

type InboxMessage = {
  uid: number;
  subject: string;
  fromAddress: string;
  fromName?: string;
  date?: string | null;
  seen?: boolean;
};

type MessageDetail = InboxMessage & {
  body?: string;
  messageId?: string;
};

export function MailerHubSupportTab() {
  const [status, setStatus] = useState<InboxStatus | null>(null);
  const [accountId, setAccountId] = useState('');
  const [messages, setMessages] = useState<InboxMessage[]>([]);
  const [selected, setSelected] = useState<MessageDetail | null>(null);
  const [reply, setReply] = useState('');
  const [loadingList, setLoadingList] = useState(false);
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState<{ ok?: string; err?: string } | null>(null);
  const [pending, setPending] = useState<unknown[]>([]);

  useEffect(() => {
    api.get<InboxStatus>('/api/v1/mailerhub/inbox/status').then((r) => {
      setStatus(r.data);
      const first = r.data.accounts?.[0];
      if (first) setAccountId(first._id);
    });
    api.get('/api/v1/mailerhub/pending').then((r) => setPending(r.data.pending || r.data.records || []));
  }, []);

  const loadMessages = useCallback(() => {
    if (!accountId) return;
    setLoadingList(true);
    setFeedback(null);
    setSelected(null);
    api
      .get<{ messages: InboxMessage[] }>(`/api/v1/mailerhub/inbox/${accountId}/messages`)
      .then((r) => setMessages(r.data.messages || []))
      .catch((err) => {
        const msg = err.response?.data?.message || 'Could not load inbox';
        setFeedback({ err: msg });
      })
      .finally(() => setLoadingList(false));
  }, [accountId]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  const openMessage = (msg: InboxMessage) => {
    setFeedback(null);
    api
      .get<{ message: MessageDetail }>(`/api/v1/mailerhub/inbox/${accountId}/messages/${msg.uid}`)
      .then((r) => {
        setSelected(r.data.message);
        setReply('');
      })
      .catch((err) => {
        setFeedback({ err: err.response?.data?.message || 'Could not open message' });
      });
  };

  const sendReply = async () => {
    if (!selected || !reply.trim()) return;
    setSending(true);
    setFeedback(null);
    try {
      await api.post(`/api/v1/mailerhub/inbox/${accountId}/reply`, {
        to: selected.fromAddress,
        subject: selected.subject,
        body: reply,
        inReplyTo: selected.messageId,
      });
      setFeedback({ ok: 'Reply sent.' });
      setReply('');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setFeedback({ err: e.response?.data?.message || 'Reply failed' });
    } finally {
      setSending(false);
    }
  };

  const accounts = status?.accounts || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Support</h2>
          <p className="mt-1 text-sm text-white/40">
            Messages and replies on Gmail accounts in the Support pool.
          </p>
        </div>
        {accounts.length > 0 && (
          <select
            className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
          >
            {accounts.map((a) => (
              <option key={a._id} value={a._id}>
                {a.email}
              </option>
            ))}
          </select>
        )}
      </div>

      {!status?.imapAvailable && (
        <div className="flex items-start gap-2 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
          <p className="text-xs text-amber-200/90">
            Run <code className="text-amber-100">npm install</code> in <code className="text-amber-100">server/</code>{' '}
            (imapflow) and restart the API to enable live inbox sync.
          </p>
        </div>
      )}

      {accounts.length === 0 && (
        <p className="text-sm text-white/40">
          Add a Gmail account under Gmail pool with category <strong className="text-white/60">support</strong> to use
          the inbox.
        </p>
      )}

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <h3 className="font-medium text-white/80">Pending deliveries</h3>
        <p className="mt-1 text-sm text-white/40">{pending.length} queued items</p>
      </div>

      {feedback?.err && <p className="text-sm text-red-400">{feedback.err}</p>}
      {feedback?.ok && <p className="text-sm text-emerald-400">{feedback.ok}</p>}

      {accountId && (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,340px)_1fr]">
          <div className="max-h-[520px] overflow-y-auto rounded-2xl border border-white/10 bg-white/[0.03] p-2">
            {loadingList ? (
              <div className="flex justify-center py-16">
                <Loader2 className="h-5 w-5 animate-spin text-white/40" />
              </div>
            ) : messages.length === 0 ? (
              <p className="py-16 text-center text-sm text-white/40">No messages.</p>
            ) : (
              <ul className="space-y-1">
                {messages.map((m) => (
                  <li key={m.uid}>
                    <button
                      type="button"
                      onClick={() => openMessage(m)}
                      className={`w-full rounded-lg p-3 text-left transition ${
                        selected?.uid === m.uid ? 'bg-white/10' : 'hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p
                          className={`truncate text-sm ${
                            m.seen ? 'text-white/70' : 'font-semibold text-white'
                          }`}
                        >
                          {m.fromName || m.fromAddress}
                        </p>
                        <span className="shrink-0 text-[10px] text-white/30">
                          {m.date ? new Date(m.date).toLocaleDateString() : ''}
                        </span>
                      </div>
                      <p className="truncate text-xs text-white/40">{m.subject}</p>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="min-h-[520px] rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            {selected ? (
              <div className="space-y-4">
                <div>
                  <p className="text-base font-semibold text-white">{selected.subject}</p>
                  <p className="text-xs text-white/40">
                    {selected.fromName} &lt;{selected.fromAddress}&gt;
                    {selected.date ? ` · ${new Date(selected.date).toLocaleString()}` : ''}
                  </p>
                </div>
                <div className="max-h-[240px] overflow-y-auto border-y border-white/10 py-3 text-sm whitespace-pre-wrap text-white/70">
                  {selected.body || '(no text content)'}
                </div>
                <div>
                  <label className="text-xs text-white/40">Reply to {selected.fromAddress}</label>
                  <textarea
                    className="mt-1 w-full resize-y rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
                    rows={4}
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    placeholder="Type your reply…"
                  />
                </div>
                <button
                  type="button"
                  onClick={sendReply}
                  disabled={sending || !reply.trim()}
                  className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-neutral-900 disabled:opacity-50"
                >
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Send reply
                </button>
              </div>
            ) : (
              <div className="flex h-full min-h-[480px] items-center justify-center">
                <p className="text-sm text-white/40">Select a message to view details and reply.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
