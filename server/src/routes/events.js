import { Router } from 'express';
import * as eventsRepo from '../repositories/events.js';
import * as registrationsRepo from '../repositories/registrations.js';
import { requireAuth, requireRole, attachUser } from '../middleware/auth.js';

const router = Router();

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

router.get('/', attachUser, async (req, res) => {
  const events = await eventsRepo.listEvents({
    search: req.query.search,
    live: req.query.live === 'true' ? true : undefined,
    userId: req.user?._id,
  });
  res.json(events);
});

router.get('/search', async (req, res) => {
  const events = await eventsRepo.searchEvents(req.query.q || '');
  res.json(events);
});

router.get('/name/:slug', attachUser, async (req, res) => {
  const event = await eventsRepo.findEventBySlug(req.params.slug, req.user?._id);
  if (!event) return res.status(404).json({ message: 'Event not found' });
  res.json(event);
});

router.post('/register', requireAuth, async (req, res) => {
  const { eventId, answers } = req.body;
  const event = await eventsRepo.findEventById(eventId);
  if (!event) return res.status(404).json({ message: 'Event not found' });
  if (await registrationsRepo.registrationExists(req.session.userId, eventId)) {
    return res.status(400).json({ message: 'Already registered' });
  }
  await registrationsRepo.createRegistration({
    userId: req.session.userId,
    eventId,
    answers,
  });
  await eventsRepo.incrementRegistrations(eventId);
  res.json({ success: true, message: 'Registered successfully' });
});

router.get('/getapplied', requireAuth, async (req, res) => {
  const events = await registrationsRepo.listAppliedEvents(req.session.userId);
  res.json(events);
});

router.post('/appointOrganizer', requireAuth, requireRole('admin', 'superadmin'), async (req, res) => {
  const { eventId, userId } = req.body;
  if (!eventId || !userId) return res.status(400).json({ message: 'eventId and userId required' });
  const event = await eventsRepo.appointOrganizer(eventId, userId);
  if (!event) return res.status(404).json({ message: 'Event not found' });
  res.json({ success: true, event });
});

router.post('/create', requireAuth, requireRole('organizer', 'admin', 'superadmin'), async (req, res) => {
  const body = { ...req.body };
  if (!body.hackathon && body.name) {
    body.hackathon = slugify(body.name);
    body.eventName = body.hackathon;
  }
  const event = await eventsRepo.createEvent(body, req.session.userId);
  res.status(201).json(event);
});

router.patch('/verify/:slug', requireAuth, requireRole('admin', 'superadmin'), async (req, res) => {
  const event = await eventsRepo.setEventVerified(req.params.slug, req.body.verified);
  if (!event) return res.status(404).json({ message: 'Event not found' });
  res.json(event);
});

router.put('/update/:slug', requireAuth, requireRole('organizer', 'admin', 'superadmin'), async (req, res) => {
  const event = await eventsRepo.resolveEventRef(req.params.slug);
  if (!event) return res.status(404).json({ message: 'Event not found' });
  const result = await eventsRepo.updateEvent(event._id, req.body, req.session.userId);
  if (!result) return res.status(404).json({ message: 'Event not found' });
  if (result.forbidden) return res.status(403).json({ message: 'Not an organizer for this event' });
  res.json(result);
});

router.delete('/delete/:slug', requireAuth, requireRole('organizer', 'admin', 'superadmin'), async (req, res) => {
  const event = await eventsRepo.resolveEventRef(req.params.slug);
  if (!event) return res.status(404).json({ message: 'Event not found' });
  const result = await eventsRepo.deleteEvent(event._id, req.session.userId);
  if (!result) return res.status(404).json({ message: 'Event not found' });
  if (result.forbidden) return res.status(403).json({ message: 'Not an organizer for this event' });
  res.json({ success: true });
});

router.post('/duplicate', requireAuth, requireRole('organizer', 'admin', 'superadmin'), async (req, res) => {
  const eventRef = req.body.eventId || req.body.hackathon;
  if (!eventRef) return res.status(400).json({ message: 'eventId required' });
  const result = await eventsRepo.duplicateEvent(eventRef, req.session.userId, req.body.name);
  if (!result) return res.status(404).json({ message: 'Event not found' });
  if (result.forbidden) return res.status(403).json({ message: 'Not an organizer for this event' });
  res.status(201).json(result);
});

router.patch('/:id', requireAuth, requireRole('organizer', 'admin', 'superadmin'), async (req, res) => {
  const result = await eventsRepo.updateEvent(req.params.id, req.body, req.session.userId);
  if (!result) return res.status(404).json({ message: 'Event not found' });
  if (result.forbidden) return res.status(403).json({ message: 'Not an organizer for this event' });
  res.json(result);
});

router.delete('/:id', requireAuth, requireRole('organizer', 'admin', 'superadmin'), async (req, res) => {
  const result = await eventsRepo.deleteEvent(req.params.id, req.session.userId);
  if (!result) return res.status(404).json({ message: 'Event not found' });
  if (result.forbidden) return res.status(403).json({ message: 'Not an organizer for this event' });
  res.json({ success: true });
});

router.post('/:id/duplicate', requireAuth, requireRole('organizer', 'admin', 'superadmin'), async (req, res) => {
  const result = await eventsRepo.duplicateEvent(req.params.id, req.session.userId);
  if (!result) return res.status(404).json({ message: 'Event not found' });
  if (result.forbidden) return res.status(403).json({ message: 'Not an organizer for this event' });
  res.status(201).json(result);
});

export default router;
