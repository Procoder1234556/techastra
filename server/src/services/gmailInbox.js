import nodemailer from 'nodemailer';
import * as gmailAccounts from '../repositories/gmailAccounts.js';

let imapFlowCtor = undefined;

async function getImapFlowCtor() {
  if (imapFlowCtor !== undefined) return imapFlowCtor;
  try {
    const mod = await import('imapflow');
    imapFlowCtor = mod.ImapFlow;
  } catch {
    imapFlowCtor = null;
  }
  return imapFlowCtor;
}

export async function isImapAvailable() {
  return Boolean(await getImapFlowCtor());
}

function supportAccounts(accounts) {
  const support = accounts.filter((a) => a.isActive && a.category === 'support');
  if (support.length) return support;
  return accounts.filter((a) => a.isActive);
}

export async function inboxStatus() {
  const { accounts } = await gmailAccounts.listGmailAccounts();
  const eligible = supportAccounts(accounts);
  const imapOk = await isImapAvailable();
  return {
    imapAvailable: imapOk,
    connected: imapOk && eligible.length > 0,
    provider: imapOk ? 'gmail-imap' : 'local',
    accounts: eligible.map((a) => ({ _id: a._id, email: a.email, category: a.category })),
  };
}

async function withImapClient(accountRow, fn) {
  const ImapFlow = await getImapFlowCtor();
  if (!ImapFlow) throw new Error('imapflow is not installed — run npm install in server/');
  const client = new ImapFlow({
    host: 'imap.gmail.com',
    port: 993,
    secure: true,
    auth: { user: accountRow.email, pass: accountRow.app_password },
    logger: false,
  });
  await client.connect();
  try {
    return await fn(client);
  } finally {
    await client.logout().catch(() => {});
  }
}

function mapEnvelope(uid, env) {
  const from = env.from?.[0];
  return {
    uid,
    subject: env.subject || '(no subject)',
    fromAddress: from?.address || '',
    fromName: from?.name || from?.address || '',
    date: env.date ? new Date(env.date).toISOString() : null,
    seen: Boolean(env.flags?.has?.('\\Seen')),
    messageId: env.messageId || '',
  };
}

export async function listMessages(accountId, limit = 40) {
  const account = await gmailAccounts.findGmailAccount(accountId);
  if (!account || !account.is_active) throw new Error('Gmail account not found');

  return withImapClient(account, async (client) => {
    const lock = await client.getMailboxLock('INBOX');
    try {
      const messages = [];
      const total = client.mailbox?.exists || 0;
      const start = Math.max(1, total - limit + 1);
      if (total === 0) return messages;

      for await (const msg of client.fetch(`${start}:*`, {
        uid: true,
        envelope: true,
        flags: true,
      })) {
        messages.push(mapEnvelope(msg.uid, { ...msg.envelope, flags: msg.flags }));
      }
      return messages.reverse();
    } finally {
      lock.release();
    }
  });
}

export async function getMessage(accountId, uid) {
  const account = await gmailAccounts.findGmailAccount(accountId);
  if (!account || !account.is_active) throw new Error('Gmail account not found');

  return withImapClient(account, async (client) => {
    const lock = await client.getMailboxLock('INBOX');
    try {
      const msg = await client.fetchOne(uid, { uid: true, envelope: true, source: true }, { uid: true });
      if (!msg) return null;

      let body = '';
      if (msg.source) {
        const raw = msg.source.toString();
        const textMatch = raw.match(/Content-Type: text\/plain[\s\S]*?\r?\n\r?\n([\s\S]*?)(?=\r?\n--|\r?\nContent-Type:|$)/i);
        body = textMatch?.[1]?.trim() || raw.slice(0, 4000);
      }

      const from = msg.envelope?.from?.[0];
      return {
        uid: msg.uid,
        subject: msg.envelope?.subject || '(no subject)',
        fromAddress: from?.address || '',
        fromName: from?.name || from?.address || '',
        date: msg.envelope?.date ? new Date(msg.envelope.date).toISOString() : null,
        messageId: msg.envelope?.messageId || '',
        body,
      };
    } finally {
      lock.release();
    }
  });
}