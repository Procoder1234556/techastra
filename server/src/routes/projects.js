import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import * as teamsRepo from '../repositories/teams.js';
import * as eventsRepo from '../repositories/events.js';

const router = Router();

async function resolveEventId(ref) {
  const event = await eventsRepo.resolveEventRef(ref);
  return event?._id ?? null;
}

router.get('/config/:eventId/manage', requireAuth, async (req, res) => {
  const eventId = await resolveEventId(req.params.eventId);
  if (!eventId) return res.status(404).json({ success: false, message: 'Event not found' });
  const event = await eventsRepo.findEventById(eventId);
  if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
  const cfg = {
    enabled: true,
    publishToDevQuests: false,
    acceptDevQuestsSubmissions: false,
    rounds: [
      {
        _id: 'round-1',
        name: 'Round 1',
        deadline: event.endDate || null,
        fields: ['submissionUrl', 'description'],
      },
    ],
    eventId: event._id,
    teamSize: event.teamSize || '2-4',
    submissionDeadline: event.endDate,
    judgingOpen: true,
  };
  res.json({
    success: true,
    config: cfg,
    ...cfg,
  });
});

router.get('/config/:eventId', requireAuth, async (req, res) => {
  const eventId = await resolveEventId(req.params.eventId);
  if (!eventId) return res.status(404).json({ success: false, message: 'Event not found' });
  const event = await eventsRepo.findEventById(eventId);
  if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
  res.json({
    success: true,
    enabled: true,
    rounds: [
      {
        _id: 'round-1',
        name: 'Round 1',
        deadline: event.endDate || null,
        fields: ['submissionUrl', 'description'],
      },
    ],
    eventId: event._id,
    teamSize: event.teamSize || '2-4',
    submissionDeadline: event.endDate,
    fields: ['submissionUrl', 'description'],
  });
});

router.get('/event/:eventId', requireAuth, async (req, res) => {
  const eventId = await resolveEventId(req.params.eventId);
  if (!eventId) return res.status(404).json({ success: false, message: 'Event not found' });
  const teams = await teamsRepo.listTeamsByEvent(eventId);
  res.json({ success: true, submissions: teams, teams });
});

router.get('/mine/:eventId', requireAuth, async (req, res) => {
  const eventId = await resolveEventId(req.params.eventId);
  if (!eventId) return res.status(404).json({ success: false, message: 'Event not found' });
  const teams = await teamsRepo.listTeamsByEvent(eventId);
  const mine = teams.filter(
    (t) => t.leaderId === req.session.userId || (t.memberIds || []).includes(req.session.userId),
  );
  const myTeam = mine[0] || null;
  res.json({
    success: true,
    submissions: myTeam ? [{ roundId: 'round-1', ...myTeam }] : [],
    team: myTeam,
    isTeamEvent: true,
    ...(myTeam || {}),
  });
});

async function handleSubmit(req, res) {
  const { teamCode, submissionUrl, description } = req.body;
  let code = teamCode;
  if (!code && req.params.teamId) {
    const team = await teamsRepo.findTeamById(req.params.teamId);
    code = team?.teamCode;
  }
  const team = await teamsRepo.submitProject({
    teamCode: code,
    url: submissionUrl || description,
  });
  if (!team) return res.status(400).json({ success: false, message: 'Could not submit project' });
  res.json({ success: true, message: 'Submitted!', submission: team, team });
}

router.post('/submit/:eventId', requireAuth, async (req, res) => {
  const eventId = await resolveEventId(req.params.eventId);
  if (!eventId) return res.status(404).json({ success: false, message: 'Event not found' });
  req.params.eventId = eventId;
  return handleSubmit(req, res);
});
router.post('/submit/:eventId/:teamId', requireAuth, async (req, res) => {
  const eventId = await resolveEventId(req.params.eventId);
  if (!eventId) return res.status(404).json({ success: false, message: 'Event not found' });
  req.params.eventId = eventId;
  return handleSubmit(req, res);
});

router.put('/config/:eventId', requireAuth, async (req, res) => {
  const eventId = await resolveEventId(req.params.eventId);
  if (!eventId) return res.status(404).json({ success: false, message: 'Event not found' });
  const event = await eventsRepo.findEventById(eventId);
  if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
  res.json({
    success: true,
    saved: true,
    message: 'Saved',
    eventId: event._id,
    ...req.body,
  });
});

async function scoreTeam(req, res) {
  const score = Number(req.body.score);
  if (!Number.isFinite(score)) return res.status(400).json({ success: false, message: 'score required' });
  const team = await teamsRepo.setProjectScore(req.params.teamId, score);
  if (!team) return res.status(404).json({ success: false, message: 'Team not found' });
  res.json({ success: true, message: 'Scored', projectScore: team.projectScore, team });
}

router.patch('/score/:teamId', requireAuth, scoreTeam);
router.post('/score/:teamId', requireAuth, scoreTeam);

export default router;
