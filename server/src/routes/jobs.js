import { Router } from 'express';
import { query } from '../db.js';
import * as jobsRepo from '../repositories/jobs.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', async (_req, res) => {
  res.json(await jobsRepo.listJobs());
});

router.get('/featured', async (_req, res) => {
  res.json(await jobsRepo.listFeaturedJobs());
});

router.get('/search', async (req, res) => {
  res.json(await jobsRepo.searchJobs(req.query.q || ''));
});

router.post('/:id/apply', requireAuth, async (req, res) => {
  await query(
    `INSERT INTO techastra_job_applications (job_id, user_id, resume_url)
     VALUES ($1, $2, $3) ON CONFLICT (job_id, user_id) DO NOTHING`,
    [req.params.id, req.session.userId, req.body.resumeUrl || null],
  );
  res.json({ success: true });
});

router.get('/:id/applications', requireAuth, async (req, res) => {
  const { rows } = await query(
    `SELECT a.*, u.name, u.email FROM techastra_job_applications a
     JOIN techastra_users u ON u.id = a.user_id WHERE a.job_id = $1`,
    [req.params.id],
  );
  res.json(rows);
});

router.get('/:id', async (req, res) => {
  const job = await jobsRepo.findJobById(req.params.id);
  if (!job) return res.status(404).json({ message: 'Job not found' });
  res.json(job);
});

export default router;
