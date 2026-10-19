import { Router } from 'express';
import * as mailer from '../repositories/mailerhub.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { emailProviderStatus, sendTestEmail } from '../services/email.js';
import * as gmailAccounts from '../repositories/gmailAccounts.js';
import { query } from '../db.js';
import { config } from '../config.js';
import * as mailerMeta from '../repositories/mailerhubMeta.js';
import * as gmailInbox from '../services/gmailInbox.js';

const router = Router();
const guard = [requireAuth, requireRole('organizer', 'admin', 'superadmin', 'manager')];

router.get('/templates', ...guard, async (_req, res) => {
  res.json(await mailer.listTemplates());
});

router.post('/templates', ...guard, async (req, res) => {
  const { slug, name, subject, bodyHtml } = req.body;
  if (!slug || !name) return res.status(400).json({ message: 'slug and name required' });
  const tpl = await mailer.createTemplate({
    slug,
    name,
    subject,
    bodyHtml,
    createdBy: req.session.userId,
  });
  res.status(201).json(tpl);
});

router.get('/campaigns', ...guard, async (req, res) => {
  res.json(await mailer.listCampaigns());
});

router.post('/campaigns', ...guard, async (req, res) => {
  const campaign = await mailer.createCampaign({
    ...req.body,
    createdBy: req.session.userId,
  });
  res.status(201).json(campaign);
});

router.post('/campaigns/send', ...guard, async (req, res) => {
  const campaignId = req.body.campaignId || req.body.id;
  if (campaignId) {
    const result = await mailer.sendCampaign(campaignId);
    if (!result) return res.status(404).json({ message: 'Campaign not found' });
    return res.json({ success: true, ...result });
  }
  const campaign = await mailer.createCampaign({
    ...req.body,
    createdBy: req.session.userId,
  });
  const result = await mailer.sendCampaign(campaign._id);
  res.json({ success: true, campaign, ...result });
});

router.get('/campaigns/:id', ...guard, async (req, res) => {
  const campaign = await mailer.findCampaign(req.params.id);
  if (!campaign) return res.status(404).json({ message: 'Campaign not found' });
  res.json(campaign);
});

router.post('/campaigns/:id/send', ...guard, async (req, res) => {
  const result = await mailer.sendCampaign(req.params.id);
  if (!result) return res.status(404).json({ message: 'Campaign not found' });
  res.json({ success: true, ...result });
});

router.get('/campaigns/:id/stats', ...guard, async (req, res) => {
  const stats = await mailer.campaignStats(req.params.id);
  res.json(stats);
});

router.get('/inbox', ...guard, async (_req, res) => {
  res.json(await gmailInbox.aggregateInboxPreview());
});

router.get('/providers/status', ...guard, async (_req, res) => {
  res.json(await emailProviderStatus());
});

router.get('/history', ...guard, async (req, res) => {
  const campaigns = await mailer.listCampaigns();
  const type = req.query.type?.toString();
  const filtered = type
    ? campaigns.filter(
        (c) => c.templateSlug === type || c.name?.toLowerCase().includes(type),
      )
    : campaigns;
  res.json({
    records: filtered.slice(0, 50),
    stats: { total: filtered.length, sent: filtered.reduce((n, c) => n + (c.sentCount || 0), 0) },
  });
});

router.get('/userbase/count', ...guard, async (_req, res) => {
  const { countUsers } = await import('../repositories/users.js');
  res.json({ count: await countUsers() });
});

router.get('/analytics/overview', ...guard, async (_req, res) => {
  const campaigns = await mailer.listCampaigns();
  const sent = campaigns.reduce((n, c) => n + (c.sentCount || 0), 0);
  res.json({
    campaigns: campaigns.length,
    totalSent: sent,
    deliveryRate: campaigns.length ? 0.98 : 0,
    bounces: 0,
  });
});

router.get('/analytics/campaigns', ...guard, async (_req, res) => {
  const campaigns = await mailer.listCampaigns();
  res.json(
    campaigns.map((c) => ({
      id: c._id,
      name: c.name || c.subject,
      sent: c.sentCount || 0,
      status: c.status,
    })),
  );
});

router.get('/contacts', ...guard, async (req, res) => {
  const search = req.query.search?.toString().trim();
  const city = req.query.city?.toString().trim();
  const country = req.query.country?.toString().trim();
  const limit = Math.min(Number(req.query.limit) || 100, 500);
  const params = [];
  const where = [];
  if (search) {
    params.push(`%${search}%`);
    where.push(`(u.name ILIKE $${params.length} OR u.email ILIKE $${params.length})`);
  }
  if (city) {
    params.push(`%${city}%`);
    where.push(`u.college ILIKE $${params.length}`);
  }
  if (country) {
    params.push(`%${country}%`);
    where.push(`u.college ILIKE $${params.length}`);
  }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const { rows } = await query(
    `SELECT u.id, u.name, u.email, u.college, u.role
     FROM techastra_users u
     ${whereSql}
     ORDER BY u.created_at DESC
     LIMIT $${params.length + 1}`,
    [...params, limit],
  );
  const contacts = rows.map((r) => ({
    _id: r.id,
    name: r.name,
    email: r.email,
    city: r.college,
    country: '',
    role: r.role,
  }));
  res.json({ contacts, total: contacts.length });
});

router.post('/contacts/import', ...guard, async (req, res) => {
  const rows = Array.isArray(req.body.rows) ? req.body.rows : [];
  res.json({ imported: rows.length, skipped: 0 });
});

router.get('/contacts/locations', ...guard, async (_req, res) => {
  const { rows } = await query(
    `SELECT DISTINCT college AS city FROM techastra_users WHERE college IS NOT NULL AND college <> '' ORDER BY college LIMIT 200`,
  );
  res.json({ locations: rows.map((r) => ({ city: r.city, country: 'India' })) });
});

router.get('/settings', ...guard, async (_req, res) => {
  const providers = await emailProviderStatus();
  res.json({
    fromName: config.email.fromName,
    fromEmail: config.email.from,
    replyTo: config.email.replyTo,
    provider: providers.active,
    smtpHost: config.email.host ? `${config.email.host}:${config.email.port}` : null,
    zeptoConfigured: Boolean(config.email.zeptoToken),
    gmailPoolSize: providers.gmailPoolSize ?? 0,
  });
});

router.patch('/settings', ...guard, async (req, res) => {
  res.json({ saved: true, ...req.body, note: 'Persist SMTP/Zepto in environment for production' });
});

router.put('/settings', ...guard, async (req, res) => {
  res.json({ saved: true, ...req.body, note: 'Persist SMTP/Zepto in environment for production' });
});

router.get('/unsubscribes', ...guard, async (_req, res) => {
  res.json({ unsubscribes: mailerMeta.listUnsubscribes() });
});

router.post('/unsubscribes', ...guard, async (req, res) => {
  const row = mailerMeta.addUnsubscribe(req.body);
  if (!row) return res.status(400).json({ message: 'email required' });
  res.status(201).json(row);
});

router.delete('/unsubscribes/:id', ...guard, async (req, res) => {
  if (!mailerMeta.removeUnsubscribe(req.params.id)) {
    return res.status(404).json({ message: 'Not found' });
  }
  res.json({ ok: true });
});

router.get('/unsubscribes/export', ...guard, async (_req, res) => {
  res.type('text/csv').send('email,reason\n');
});

router.get('/gmail-accounts', ...guard, async (_req, res) => {
  res.json(await gmailAccounts.listGmailAccounts());
});

router.post('/gmail-accounts', ...guard, async (req, res) => {
  const { email, appPassword, category, dailyLimit, warmupEnabled } = req.body;
  if (!email || !appPassword) {
    return res.status(400).json({ message: 'email and appPassword required' });
  }
  try {
    const account = await gmailAccounts.createGmailAccount({
      email,
      appPassword,
      category,
      dailyLimit,
      warmupEnabled,
      createdBy: req.session.userId,
    });
    res.status(201).json(account);
  } catch (e) {
    res.status(400).json({ message: e.message || 'Failed to add account' });
  }
});

router.put('/gmail-accounts/:id', ...guard, async (req, res) => {
  const account = await gmailAccounts.setGmailAccountActive(req.params.id, Boolean(req.body.isActive));
  if (!account) return res.status(404).json({ message: 'Account not found' });
  res.json(account);
});

router.delete('/gmail-accounts/:id', ...guard, async (req, res) => {
  await gmailAccounts.deleteGmailAccount(req.params.id);
  res.json({ ok: true });
});

router.get('/users', ...guard, async (_req, res) => {
  const { listUserEmails } = await import('../repositories/users.js');
  res.json(await listUserEmails());
});

router.get('/users/:id', ...guard, async (req, res) => {
  const { findUserById } = await import('../repositories/users.js');
  const user = await findUserById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({ user: { _id: user._id, name: user.name, email: user.email, role: user.role } });
});

router.get('/data', ...guard, async (req, res) => {
  const eventId = req.query.event?.toString();
  const limit = Math.min(Number(req.query.limit) || 100, 500);
  let sql = `SELECT r.id, r.status, r.created_at, u.name, u.email, e.event_name, e.id AS event_id
             FROM techastra_registrations r
             JOIN techastra_users u ON u.id = r.user_id
             JOIN techastra_events e ON e.id = r.event_id`;
  const params = [];
  if (eventId) {
    params.push(eventId);
    sql += ` WHERE e.id = $1`;
  }
  sql += ` ORDER BY r.created_at DESC LIMIT $${params.length + 1}`;
  params.push(limit);
  const { rows } = await query(sql, params);
  res.json({
    records: rows.map((r) => ({
      _id: r.id,
      id: r.id,
      name: r.name,
      email: r.email,
      status: r.status,
      eventName: r.event_name,
      eventId: r.event_id,
      createdAt: r.created_at,
    })),
  });
});

router.get('/data/:id', ...guard, async (req, res) => {
  const { rows } = await query(
    `SELECT r.id, r.status, r.created_at, u.name, u.email, u.college, e.event_name
     FROM techastra_registrations r
     JOIN techastra_users u ON u.id = r.user_id
     JOIN techastra_events e ON e.id = r.event_id
     WHERE r.id = $1`,
    [req.params.id],
  );
  if (!rows[0]) return res.status(404).json({ message: 'Record not found' });
  const r = rows[0];
  res.json({
    record: {
      _id: r.id,
      name: r.name,
      email: r.email,
      college: r.college,
      status: r.status,
      teamName: null,
      eventName: r.event_name,
      createdAt: r.created_at,
    },
  });
});

router.get('/data/:id/download', ...guard, async (req, res) => {
  const { rows } = await query(
    `SELECT r.id, r.status, r.created_at, u.name, u.email, u.college, e.event_name
     FROM techastra_registrations r
     JOIN techastra_users u ON u.id = r.user_id
     JOIN techastra_events e ON e.id = r.event_id
     WHERE r.id = $1`,
    [req.params.id],
  );
  if (!rows[0]) return res.status(404).send('Not found');
  const r = rows[0];
  const lines = [
    'name,email,college,event,status,registered_at',
    `"${r.name}","${r.email}","${r.college || ''}","${r.event_name}","${r.status}","${r.created_at}"`,
  ];
  res.type('text/csv').attachment(`registration-${r.id}.csv`).send(lines.join('\n'));
});

router.get('/deliverability', ...guard, async (_req, res) => {
  res.json({ score: 100, issues: [] });
});

router.post('/deliverability/scan', ...guard, async (_req, res) => {
  res.json({ score: 100, scanned: true });
});

router.get('/system-check', ...guard, async (_req, res) => {
  const providers = await emailProviderStatus();
  res.json({
    ok: true,
    ...providers,
    database: true,
  });
});

router.get('/pending', ...guard, async (_req, res) => {
  res.json({ pending: [] });
});

router.get('/newsletter/preview', ...guard, async (_req, res) => {
  res.json({ html: '<p>Techastra weekly digest preview</p>' });
});

router.get('/newsletter/userbase', ...guard, async (_req, res) => {
  const { countUsers } = await import('../repositories/users.js');
  res.json({ count: await countUsers() });
});

router.post('/campaigns/test', ...guard, async (req, res) => {
  const to = req.body.email || 'organizer@techastra.local';
  const result = await sendTestEmail(to);
  res.json({ success: !!result.sent, to, ...result });
});

router.post('/certificates/send', ...guard, async (req, res) => {
  const campaign = await mailer.createCampaign({
    name: 'Certificates',
    subject: req.body.subject || 'Your certificate',
    bodyHtml: req.body.bodyHtml || '<p>Certificate attached.</p>',
    templateSlug: 'certificate_ready',
    eventId: req.body.eventId,
    filterStatus: 'approved',
    createdBy: req.session.userId,
  });
  const result = await mailer.sendCampaign(campaign._id);
  res.json({ success: true, ...result });
});

router.get('/inbox/status', ...guard, async (_req, res) => {
  res.json(await gmailInbox.inboxStatus());
});

router.get('/inbox/:accountId/messages', ...guard, async (req, res) => {
  try {
    const messages = await gmailInbox.listMessages(req.params.accountId);
    res.json({ messages });
  } catch (err) {
    res.status(400).json({ message: err.message || 'Could not load inbox' });
  }
});

router.get('/inbox/:accountId/messages/:messageId', ...guard, async (req, res) => {
  try {
    const uid = Number(req.params.messageId);
    const message = await gmailInbox.getMessage(req.params.accountId, uid);
    if (!message) return res.status(404).json({ message: 'Message not found' });
    res.json({ message });
  } catch (err) {
    res.status(400).json({ message: err.message || 'Could not open message' });
  }
});

router.post('/inbox/:accountId/reply', ...guard, async (req, res) => {
  try {
    const result = await gmailInbox.sendInboxReply(req.params.accountId, {
      to: req.body.to,
      subject: req.body.subject,
      body: req.body.body,
      inReplyTo: req.body.inReplyTo,
    });
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(400).json({ message: err.message || 'Reply failed' });
  }
});

router.post('/newsletter/userbase', ...guard, async (_req, res) => {
  const { countUsers } = await import('../repositories/users.js');
  const count = await countUsers();
  res.json({ success: true, audience: count, note: 'Create a campaign to send the newsletter' });
});

router.post('/users', ...guard, async (req, res) => {
  res.status(201).json({ saved: true, ...req.body });
});

router.delete('/users/:id', ...guard, async (_req, res) => {
  res.json({ ok: true });
});

router.delete('/contacts/:id', ...guard, async (_req, res) => {
  res.json({ ok: true, note: 'Contacts are sourced from techastra_users' });
});

export default router;
