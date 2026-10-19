import { randomUUID } from 'crypto';

/** In-memory MailerHub aux data (unsubscribes, inbox) for console parity. */

const unsubscribes = [];

export function listUnsubscribes() {
  return [...unsubscribes];
}

export function addUnsubscribe({ email, reason }) {
  if (!email) return null;
  const row = { _id: randomUUID(), email, reason: reason || '', createdAt: new Date().toISOString() };
  unsubscribes.push(row);
  return row;
}

export function removeUnsubscribe(id) {
  const i = unsubscribes.findIndex((u) => u._id === id);
  if (i < 0) return false;
  unsubscribes.splice(i, 1);
  return true;
}
