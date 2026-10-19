import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import * as eventsRepo from '../repositories/events.js';
import * as registrationsRepo from '../repositories/registrations.js';

const router = Router();

router.use(requireAuth, requireRole('manager', 'admin', 'superadmin'));

router.get('/event', async (req, res) => {
  const eventId = req.query.eventId?.toString();
  const events = await eventsRepo.listEvents({ live: undefined, userId: req.session.userId });
  const selected = eventId ? events.find((e) => e._id === eventId) : events[0];
  const participants = selected
    ? await registrationsRepo.listParticipants(selected._id)
    : [];
  res.json({
    event: selected || null,
    events,
    canPickAny: true,
    participants,
    stats: {
      registrations: participants.length,
      eventsManaged: events.length,
    },
  });
});

router.patch('/event', async (req, res) => {
  const eventName = req.query.eventName?.toString();
  const status = req.query.status?.toString();
  if (!eventName) return res.status(400).json({ message: 'eventName query required' });
  const event = await eventsRepo.findEventBySlug(eventName, req.session.userId);
  if (!event) return res.status(404).json({ message: 'Event not found' });
  const patch = {};
  if (status === 'approved' || status === 'pending') patch.approvalStatus = status;
  if (req.body.live !== undefined) patch.live = req.body.live;
  const result = await eventsRepo.updateEvent(event._id, patch, req.session.userId);
  if (!result) return res.status(404).json({ message: 'Event not found' });
  if (result.forbidden) return res.status(403).json({ message: 'Forbidden' });
  res.json(result);
});

export default router;
