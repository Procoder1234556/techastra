import { query } from '../db.js';
import { formatJob } from '../util/format.js';

export async function listJobs() {
  const { rows } = await query('SELECT * FROM techastra_jobs ORDER BY featured DESC, created_at DESC');
  return rows.map(formatJob);
}

export async function listFeaturedJobs() {
  const { rows } = await query(
    'SELECT * FROM techastra_jobs WHERE featured = true ORDER BY created_at DESC LIMIT 6',
  );
  return rows.map(formatJob);
}

export async function searchJobs(q) {
  const { rows } = await query(
    `SELECT * FROM techastra_jobs
     WHERE title ILIKE $1 OR company ILIKE $1 OR coalesce(location, '') ILIKE $1
     ORDER BY featured DESC`,
    [`%${q}%`],
  );
  return rows.map(formatJob);
}

export async function findJobById(id) {
  const { rows } = await query('SELECT * FROM techastra_jobs WHERE id = $1', [id]);
  return formatJob(rows[0]);
}

export async function insertJobs(techastra_jobs) {
  for (const job of techastra_jobs) {
    await query(
      `INSERT INTO techastra_jobs (title, company, location, work_mode, type, skills, featured, apply_url)
       VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7, $8)`,
      [
        job.title,
        job.company,
        job.location || null,
        job.workMode || 'remote',
        job.type || 'full-time',
        JSON.stringify(job.skills || []),
        job.featured || false,
        job.applyUrl || null,
      ],
    );
  }
}
