import { Router } from 'express';
import * as mailer from '../repositories/mailerhub.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

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
  res.json({ messages: [], provider: 'local', note: 'Connect Gmail/Zepto for production inbox sync' });
});

export default router;
