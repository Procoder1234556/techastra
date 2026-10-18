import { query } from '../db.js';

const DEFAULT_TEMPLATES = [
  {
    slug: 'registration_reminder',
    name: 'Registration reminder',
    subject: 'Reminder: complete your event registration',
    body_html: '<p>Hi {{name}},</p><p>This is a reminder about your upcoming event.</p>',
  },
  {
    slug: 'event_update',
    name: 'Event update',
    subject: 'Important update for your event',
    body_html: '<p>Hi {{name}},</p><p>We have an update about the event schedule.</p>',
  },
  {
    slug: 'certificate_ready',
    name: 'Certificate ready',
    subject: 'Your certificate is ready',
    body_html: '<p>Hi {{name}},</p><p>Your participation certificate is now available.</p>',
  },
];

export async function ensureDefaultTemplates() {
  for (const t of DEFAULT_TEMPLATES) {
    await query(
      `INSERT INTO techastra_mailer_templates (slug, name, subject, body_html)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (slug) DO NOTHING`,
      [t.slug, t.name, t.subject, t.body_html],
    );
  }
}

export async function listTemplates() {
  const { rows } = await query(
    'SELECT id, slug, name, subject, body_html, created_at FROM techastra_mailer_templates ORDER BY name',
  );
  return rows.map((r) => ({
    _id: r.id,
    slug: r.slug,
    name: r.name,
    subject: r.subject,
    bodyHtml: r.body_html,
    createdAt: r.created_at,
  }));
}

export async function createTemplate({ slug, name, subject, bodyHtml, createdBy }) {
  const { rows } = await query(
    `INSERT INTO techastra_mailer_templates (slug, name, subject, body_html, created_by)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [slug, name, subject, bodyHtml, createdBy],
  );
  const r = rows[0];
  return { _id: r.id, slug: r.slug, name: r.name, subject: r.subject, bodyHtml: r.body_html };
}

export async function findTemplateBySlug(slug) {
  const { rows } = await query('SELECT * FROM techastra_mailer_templates WHERE slug = $1', [slug]);
  return rows[0] || null;
}

export async function listCampaigns() {
  const { rows } = await query(
    'SELECT * FROM techastra_mailer_campaigns ORDER BY created_at DESC LIMIT 100',
  );
  return rows.map(formatCampaign);
}

export async function findCampaign(id) {
  const { rows } = await query('SELECT * FROM techastra_mailer_campaigns WHERE id = $1', [id]);
  return rows[0] ? formatCampaign(rows[0]) : null;
}

function formatCampaign(row) {
  return {
    _id: row.id,
    eventId: row.event_id,
    templateSlug: row.template_slug,
    name: row.name,
    subject: row.subject,
    bodyHtml: row.body_html,
    filterStatus: row.filter_status,
    status: row.status,
    sentCount: row.sent_count,
    createdAt: row.created_at,
    sentAt: row.sent_at,
  };
}

export async function createCampaign({
  name,
  subject,
  bodyHtml,
  templateSlug,
  eventId,
  filterStatus,
  createdBy,
}) {
  let subjectFinal = subject;
  let bodyFinal = bodyHtml;
  if (templateSlug && (!subjectFinal || !bodyFinal)) {
    const tpl = await findTemplateBySlug(templateSlug);
    if (tpl) {
      subjectFinal = subjectFinal || tpl.subject;
      bodyFinal = bodyFinal || tpl.body_html;
    }
  }
  const { rows } = await query(
    `INSERT INTO techastra_mailer_campaigns
     (name, subject, body_html, template_slug, event_id, filter_status, created_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [
      name || subjectFinal || 'Campaign',
      subjectFinal || 'TechAstra update',
      bodyFinal || '<p>Hello {{name}},</p>',
      templateSlug || null,
      eventId || null,
      filterStatus || 'all',
      createdBy,
    ],
  );
  return formatCampaign(rows[0]);
}

export async function audienceForCampaign(campaign) {
  const params = [];
  let sql = `
    SELECT DISTINCT u.id, u.email, u.name
    FROM techastra_users u
    JOIN techastra_registrations r ON r.user_id = u.id
  `;
  if (campaign.eventId) {
    params.push(campaign.eventId);
    sql += ` WHERE r.event_id = $${params.length}`;
  } else {
    sql += ' WHERE 1=1';
  }
  if (campaign.filterStatus && campaign.filterStatus !== 'all') {
    params.push(campaign.filterStatus);
    sql += ` AND r.status = $${params.length}`;
  }
  const { rows } = await query(sql, params);
  return rows;
}

export async function sendCampaign(campaignId) {
  const campaign = await findCampaign(campaignId);
  if (!campaign) return null;
  const audience = await audienceForCampaign(campaign);
  let sent = 0;
  for (const user of audience) {
    await query(
      `INSERT INTO techastra_mailer_deliveries (campaign_id, user_id, email, status)
       VALUES ($1, $2, $3, 'sent')`,
      [campaignId, user.id, user.email],
    );
    const body = (campaign.bodyHtml || '').replace(/\{\{name\}\}/g, user.name || 'there');
    await query(
      `INSERT INTO techastra_notifications (user_id, title, body)
       VALUES ($1, $2, $3)`,
      [user.id, campaign.subject, body.replace(/<[^>]+>/g, ' ').slice(0, 500)],
    );
    sent += 1;
  }
  await query(
    `UPDATE techastra_mailer_campaigns
     SET status = 'sent', sent_count = $2, sent_at = now()
     WHERE id = $1`,
    [campaignId, sent],
  );
  return { campaignId, sent, mode: 'in_app_and_log' };
}

export async function campaignStats(campaignId) {
  const { rows } = await query(
    `SELECT status, COUNT(*)::int AS c FROM techastra_mailer_deliveries
     WHERE campaign_id = $1 GROUP BY status`,
    [campaignId],
  );
  const stats = { sent: 0, queued: 0, failed: 0 };
  for (const r of rows) stats[r.status] = r.c;
  return stats;
}
