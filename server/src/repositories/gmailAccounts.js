import { query } from '../db.js';

function rowToAccount(r) {
  return {
    _id: r.id,
    id: r.id,
    email: r.email,
    category: r.category,
    dailyLimit: r.daily_limit,
    warmupEnabled: r.warmup_enabled,
    isActive: r.is_active,
    sentToday: r.sent_today,
    createdAt: r.created_at,
  };
}

export async function listGmailAccounts() {
  const { rows } = await query(
    `SELECT id, email, category, daily_limit, warmup_enabled, is_active, sent_today, created_at
     FROM techastra_mailer_gmail_accounts
     ORDER BY created_at DESC`,
  );
  const accounts = rows.map(rowToAccount);
  const dailyLimitTotal = accounts.filter((a) => a.isActive).reduce((n, a) => n + (a.dailyLimit || 0), 0);
  return { accounts, dailyLimitTotal };
}

export async function createGmailAccount({ email, appPassword, category, dailyLimit, warmupEnabled, createdBy }) {
  const { rows } = await query(
    `INSERT INTO techastra_mailer_gmail_accounts
       (email, app_password, category, daily_limit, warmup_enabled, created_by)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, email, category, daily_limit, warmup_enabled, is_active, sent_today, created_at`,
    [
      email,
      appPassword,
      category || 'notifications',
      dailyLimit ?? 430,
      warmupEnabled !== false,
      createdBy,
    ],
  );
  return rowToAccount(rows[0]);
}

export async function findGmailAccount(id) {
  const { rows } = await query(
    `SELECT id, email, app_password, category, daily_limit, warmup_enabled, is_active, sent_today, sent_today_reset
     FROM techastra_mailer_gmail_accounts WHERE id = $1`,
    [id],
  );
  return rows[0] || null;
}

export async function setGmailAccountActive(id, isActive) {
  const { rows } = await query(
    `UPDATE techastra_mailer_gmail_accounts SET is_active = $2 WHERE id = $1
     RETURNING id, email, category, daily_limit, warmup_enabled, is_active, sent_today, created_at`,
    [id, isActive],
  );
  return rows[0] ? rowToAccount(rows[0]) : null;
}

export async function deleteGmailAccount(id) {
  await query('DELETE FROM techastra_mailer_gmail_accounts WHERE id = $1', [id]);
}

/** Pick next active account in category with capacity (round-robin by least sent today). */
export async function pickGmailAccountForSend(category) {
  await query(
    `UPDATE techastra_mailer_gmail_accounts
     SET sent_today = 0, sent_today_reset = CURRENT_DATE
     WHERE sent_today_reset < CURRENT_DATE`,
  );
  const { rows } = await query(
    `SELECT id, email, app_password, category, daily_limit, sent_today
     FROM techastra_mailer_gmail_accounts
     WHERE is_active = true AND category = $1 AND sent_today < daily_limit
     ORDER BY sent_today ASC, created_at ASC
     LIMIT 1`,
    [category || 'notifications'],
  );
  return rows[0] || null;
}

export async function incrementGmailSent(id) {
  await query(
    `UPDATE techastra_mailer_gmail_accounts
     SET sent_today = sent_today + 1, sent_today_reset = CURRENT_DATE
     WHERE id = $1`,
    [id],
  );
}

export async function countActiveGmailAccounts() {
  const { rows } = await query(
    `SELECT COUNT(*)::int AS c FROM techastra_mailer_gmail_accounts WHERE is_active = true`,
  );
  return rows[0]?.c ?? 0;
}
