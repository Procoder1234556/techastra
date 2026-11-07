import { Router } from 'express';
import { query } from '../db.js';

const router = Router();

const FALLBACK_EVENTS = [
  {
    id: 'e9821a7b-3214-4a21-99cd-bcde12340001',
    slug: 'techastra-national-hack-2026',
    name: 'Techastra National Hackathon 2026',
    category: 'hackathon',
    mode: 'hybrid',
    venue: 'Bangalore Tech Center & Hybrid',
    startDate: '2026-11-20T09:00:00Z',
    endDate: '2026-11-22T18:00:00Z',
    registrationsCount: 480,
    prizePool: '₹2,50,000',
    description: 'National developer challenge across AI, Web3, and Fullstack systems.',
  },
  {
    id: 'e9821a7b-3214-4a21-99cd-bcde12340002',
    slug: 'agentic-ai-builder-summit',
    name: 'Agentic AI & ADK Builder Summit',
    category: 'workshop',
    mode: 'virtual',
    venue: 'Virtual / Techastra Live',
    startDate: '2026-11-28T14:00:00Z',
    endDate: '2026-11-28T18:00:00Z',
    registrationsCount: 310,
    prizePool: 'Swag & Micro-Grants',
    description: 'Hands-on workshop on Agent Development Kit (ADK) and Model Context Protocol.',
  }
];

const FALLBACK_QUESTS = [
  {
    id: 'q-1',
    title: 'Build an MCP Server for Techastra',
    description: 'Connect Techastra hackathon registrations with LLM tools via FastMCP.',
    rewardXp: 100,
    featured: true,
  },
  {
    id: 'q-2',
    title: 'Solve Accessibility & Dark Mode Contrast',
    description: 'Audit WCAG 2.1 AA compliance across mobile pass and event cards.',
    rewardXp: 50,
    featured: false,
  }
];

/**
 * 1. GET /api/v1/public/openapi.json
 * OpenAPI 3.1.0 specification for Techastra Public Developer API
 */
router.get('/openapi.json', (_req, res) => {
  res.json({
    openapi: '3.1.0',
    info: {
      title: 'Techastra Developer & Community Platform API',
      version: '1.0.0',
      description: 'Public API for discovering hackathons, DevQuests, community chapters, and verifying attendee passes.',
      contact: {
        name: 'Techastra Engineering',
        email: 'hello@techastra.local',
        url: 'https://techastra.local'
      }
    },
    paths: {
      '/api/v1/public/events': {
        get: {
          summary: 'Search and list active hackathons and events',
          parameters: [
            { name: 'category', in: 'query', schema: { type: 'string' } },
            { name: 'mode', in: 'query', schema: { type: 'string', enum: ['in-person', 'virtual', 'hybrid'] } },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } }
          ],
          responses: {
            '200': { description: 'Array of structured events' }
          }
        }
      },
      '/api/v1/public/events/{slug}': {
        get: {
          summary: 'Retrieve detailed event agenda, prizes, and rules',
          parameters: [{ name: 'slug', in: 'path', required: true, schema: { type: 'string' } }],
          responses: {
            '200': { description: 'Full event details' },
            '404': { description: 'Event not found' }
          }
        }
      },
      '/api/v1/public/quests': {
        get: {
          summary: 'List active DevQuests and developer bounties',
          responses: {
            '200': { description: 'Array of DevQuests with XP rewards' }
          }
        }
      },
      '/api/v1/public/leaderboard': {
        get: {
          summary: 'Top student builders ranked by XP',
          responses: {
            '200': { description: 'Ranked leaderboard entries' }
          }
        }
      }
    }
  });
});

/**
 * 2. GET /api/v1/public/events
 */
router.get('/events', async (req, res) => {
  const { category, mode, limit = 20 } = req.query;
  try {
    const { rows } = await query(
      `SELECT id, hackathon, event_name, doc, number_of_registrations, created_at
       FROM techastra_events
       WHERE approval_status = 'approved' AND live = true
       ORDER BY created_at DESC LIMIT $1`,
      [Math.min(parseInt(limit, 10) || 20, 100)]
    );

    let items = rows.map((r) => {
      const doc = r.doc || {};
      return {
        id: r.id,
        slug: r.hackathon,
        name: r.event_name || doc.name || r.hackathon,
        category: doc.category || 'hackathon',
        mode: doc.mode || 'hybrid',
        venue: doc.venue || doc.location || 'Bangalore / Virtual',
        startDate: doc.startDate || r.created_at,
        endDate: doc.endDate || null,
        registrationsCount: r.number_of_registrations || 0,
        prizePool: doc.prizePool || '₹1,00,000',
        coverUrl: doc.coverImage || doc.banner || FALLBACK_EVENTS[0].coverUrl,
        description: doc.description || doc.about || '',
      };
    });

    if (category) items = items.filter(i => i.category.toLowerCase() === category.toString().toLowerCase());
    if (mode) items = items.filter(i => i.mode.toLowerCase() === mode.toString().toLowerCase());

    res.json({ success: true, count: items.length, events: items });
  } catch (_err) {
    res.json({ success: true, count: FALLBACK_EVENTS.length, events: FALLBACK_EVENTS, offlineFallback: true });
  }
});

/**
 * 3. GET /api/v1/public/events/:slug
 */
router.get('/events/:slug', async (req, res) => {
  const { slug } = req.params;
  try {
    const { rows } = await query(
      `SELECT * FROM techastra_events WHERE hackathon = $1 AND approval_status = 'approved'`,
      [slug]
    );

    if (!rows[0]) {
      const fallback = FALLBACK_EVENTS.find(e => e.slug === slug);
      if (fallback) return res.json({ success: true, event: fallback });
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    const r = rows[0];
    const doc = r.doc || {};
    res.json({
      success: true,
      event: {
        id: r.id,
        slug: r.hackathon,
        name: r.event_name || doc.name,
        category: doc.category || 'hackathon',
        mode: doc.mode || 'hybrid',
        venue: doc.venue || doc.location,
        startDate: doc.startDate || r.created_at,
        endDate: doc.endDate,
        prizePool: doc.prizePool || '₹1,00,000',
        rules: doc.rules || '',
        faq: doc.faq || [],
        registrationsCount: r.number_of_registrations || 0,
      }
    });
  } catch (_err) {
    const fallback = FALLBACK_EVENTS.find(e => e.slug === slug) || FALLBACK_EVENTS[0];
    res.json({ success: true, event: fallback, offlineFallback: true });
  }
});

/**
 * 4. GET /api/v1/public/quests
 */
router.get('/quests', async (_req, res) => {
  try {
    const { rows } = await query(
      'SELECT id, title, description, reward_xp, featured FROM techastra_quests WHERE status = $1 ORDER BY reward_xp DESC',
      ['active']
    );
    res.json({
      success: true,
      count: rows.length,
      quests: rows.map(q => ({
        id: q.id,
        title: q.title,
        description: q.description,
        rewardXp: q.reward_xp,
        featured: q.featured
      }))
    });
  } catch (_err) {
    res.json({ success: true, count: FALLBACK_QUESTS.length, quests: FALLBACK_QUESTS, offlineFallback: true });
  }
});

/**
 * 5. GET /api/v1/public/leaderboard
 */
router.get('/leaderboard', async (_req, res) => {
  try {
    const { rows } = await query(
      'SELECT id, name, college, xp FROM techastra_users ORDER BY xp DESC LIMIT 20'
    );
    res.json({
      success: true,
      leaderboard: rows.map((u, rank) => ({
        rank: rank + 1,
        id: u.id,
        name: u.name,
        college: u.college || 'Techastra Campus',
        xp: u.xp || 0
      }))
    });
  } catch (_err) {
    res.json({
      success: true,
      leaderboard: [
        { rank: 1, name: 'Arjun Sharma', college: 'Bangalore Tech Institute', xp: 1250 },
        { rank: 2, name: 'Priya Patel', college: 'IIT Bombay', xp: 980 },
        { rank: 3, name: 'Rohan Verma', college: 'BITS Pilani', xp: 820 },
      ],
      offlineFallback: true
    });
  }
});

export default router;