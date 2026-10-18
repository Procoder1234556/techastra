import { Router } from 'express';
import * as eventsRepo from '../repositories/events.js';
import * as registrationsRepo from '../repositories/registrations.js';
import * as teamsRepo from '../repositories/teams.js';
import { config } from '../config.js';
import { requireRole } from '../middleware/auth.js';

const router = Router();

router.use(requireRole('organizer', 'manager', 'admin', 'superadmin'));

router.get('/dashboard', async (req, res) => {
  const eventsHosted = await eventsRepo.countEventsForOrganizer(req.session.userId);
  const totalRegistrations = await registrationsRepo.countRegistrations();
  res.json({ eventsHosted, totalRegistrations });
});

router.get('/events', async (req, res) => {
  res.json(await eventsRepo.listOrganizerEvents(req.session.userId));
});

router.get('/participants', async (req, res) => {
  const participants = await registrationsRepo.listParticipants(req.query.eventId);
  res.json(participants);
});

router.get('/projects', async (req, res) => {
  res.json(await teamsRepo.listTeamsForOrganizer(req.session.userId));
});

router.patch('/projects/:teamId/score', async (req, res) => {
  const score = Number(req.body.score);
  if (!Number.isFinite(score)) {
    return res.status(400).json({ message: 'score must be a number' });
  }
  const team = await teamsRepo.setProjectScore(req.params.teamId, score);
  if (!team) return res.status(404).json({ message: 'Team not found' });
  res.json(team);
});

router.get('/invite-link', async (req, res) => {
  const email = (req.query.email || 'organizer@techastra.local').toString();
  const params = new URLSearchParams({ email, redirect: `${config.clientUrl}/organizer` });
  if (config.demoAccessCode) params.set('code', config.demoAccessCode);
  res.json({
    url: `http://localhost:${config.port}/auth/google?${params}`,
    note: 'Share with co-organizers; production uses invite tokens + MailerHub.',
  });
});

router.post('/invite', async (req, res) => {
  res.json({
    success: true,
    sent: 0,
    message: 'Invite email stub — use invite link or wire MailerHub in production',
    to: req.body.email,
  });
});

export default router;
