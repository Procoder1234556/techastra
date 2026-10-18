import { Router } from 'express';
import { query } from '../db.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import * as mailer from '../repositories/mailerhub.js';

const router = Router();

router.get('/preview', requireAuth, requireRole('organizer', 'admin', 'superadmin'), async (req, res) => {
  const eventId = req.query.eventId;
  const sql = eventId
    ? `SELECT status, COUNT(*)::int AS c FROM techastra_registrations WHERE event_id = $1 GROUP BY status`
    : `SELECT status, COUNT(*)::int AS c FROM techastra_registrations GROUP BY status`;
  const { rows } = await query(sql, eventId ? [eventId] : []);
  const counts = { all: 0, approved: 0, pending: 0, rejected: 0 };
  for (const r of rows) {
    counts[r.status] = r.c;
    counts.all += r.c;
  }
  res.json({ counts });
});

router.post('/send', requireAuth, requireRole('organizer', 'admin', 'superadmin'), async (req, res) => {
  const { subject, body, bodyHtml, eventId, filterStatus, template } = req.body;
  const campaign = await mailer.createCampaign({
    name: subject || 'Bulk send',
    subject: subject || 'TechAstra update',
    bodyHtml: bodyHtml || body || '<p>Hello {{name}},</p>',
    templateSlug: template,
    eventId,
    filterStatus: filterStatus || 'all',
    createdBy: req.session.userId,
  });
  const result = await mailer.sendCampaign(campaign._id);
  res.json({
    success: true,
    sent: result?.sent || 0,
    campaignId: campaign._id,
    message: `Delivered to ${result?.sent || 0} recipients (in-app + delivery log; SMTP optional)`,
    subject,
  });
});

export default router;
