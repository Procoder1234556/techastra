import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import * as eventsRepo from '../repositories/events.js';
import * as mailer from '../repositories/mailerhub.js';

const router = Router();
const guard = [requireAuth, requireRole('organizer', 'admin', 'superadmin', 'manager')];

router.get('/events', ...guard, async (req, res) => {
  const role = req.session.role;
  const canPickAny = role === 'admin' || role === 'superadmin' || role === 'manager';
  const events = canPickAny
    ? (await eventsRepo.listEvents({})).map((e) => ({ id: e._id, name: e.name, hackathon: e.hackathon }))
    : (await eventsRepo.listOrganizerEvents(req.session.userId)).map((e) => ({
        id: e._id,
        name: e.name,
        hackathon: e.hackathon,
      }));
  res.json({ events, canPickAny });
});

router.get('/event', ...guard, async (req, res) => {
  const eventId = req.headers['x-event-id']?.toString() || req.query.eventId?.toString();
  if (!eventId) return res.status(400).json({ message: 'x-event-id or eventId required' });
  const event = await eventsRepo.findEventById(eventId);
  if (!event) return res.status(404).json({ message: 'Event not found' });
  res.json({ event, registrantCount: event.numberOfRegistrations || 0 });
});

router.post('/send', ...guard, async (req, res) => {
  const campaign = await mailer.createCampaign({
    ...req.body,
    createdBy: req.session.userId,
  });
  const result = await mailer.sendCampaign(campaign._id);
  res.json({ success: true, campaign, ...result });
});

router.post('/certificates', ...guard, async (req, res) => {
  const campaign = await mailer.createCampaign({
    name: 'Certificate batch',
    subject: req.body.subject || 'Your certificate',
    bodyHtml: req.body.bodyHtml || '<p>Your certificate is attached.</p>',
    template: 'certificate',
    eventId: req.body.eventId,
    filterStatus: 'approved',
    createdBy: req.session.userId,
  });
  const result = await mailer.sendCampaign(campaign._id);
  res.json({ success: true, sent: result?.sent ?? 0 });
});

export default router;
