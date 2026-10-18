import { query } from './db.js';
import { countUsers, createUser, findUserByEmail } from './repositories/users.js';
import { createEvent } from './repositories/events.js';
import { insertJobs } from './repositories/jobs.js';
import { insertCommunities } from './repositories/communities.js';
import { insertQuests } from './repositories/quests.js';
import { createNotification } from './repositories/notificationsDb.js';

async function ensureQuestsAndNotifications() {
  const { rows } = await query('SELECT COUNT(*)::int AS c FROM techastra_quests');
  if (rows[0].c === 0) {
    await insertQuests([
      {
        title: 'Ship a landing page',
        description: 'Rebuild the hero section with React + Tailwind.',
        rewardXp: 100,
        featured: true,
      },
      {
        title: 'API explorer',
        description: 'Document three /api/v1 endpoints.',
        rewardXp: 75,
      },
    ]);
  }
  const student = await findUserByEmail('student@techastra.local');
  if (student) {
    const { rows: n } = await query(
      'SELECT COUNT(*)::int AS c FROM techastra_notifications WHERE user_id = $1',
      [student._id],
    );
    if (n[0].c === 0) {
      await createNotification({
        userId: student._id,
        title: 'Welcome to TechAstra',
        body: 'Browse events, join teams, and complete DevQuests to earn XP.',
      });
    }
  }
}

export async function ensureSeedData() {
  await ensureQuestsAndNotifications();
  const users = await countUsers();
  if (users > 0) return;

  console.log('Empty database — seeding demo data…');

  const organizer = await createUser({
    name: 'TechAstra Organizer',
    email: 'organizer@techastra.local',
    role: 'organizer',
    college: 'IIT Bombay',
    skills: ['React', 'Node.js'],
    xp: 1200,
  });

  await createUser({
    name: 'Platform Admin',
    email: 'admin@techastra.local',
    role: 'superadmin',
  });

  await createUser({
    name: 'Ananya Sharma',
    email: 'student@techastra.local',
    role: 'student',
    college: 'IIT Bombay',
    skills: ['Full-Stack', 'AI'],
    xp: 450,
  });

  await createEvent(
    {
      name: 'Learn How Real-World Applications Are Built & Managed',
      hackathon: 'learn-how-real-world-applications-are-built-and-managed',
      eventName: 'learn-how-real-world-applications-are-built-and-managed',
      subtitle: 'Cloud, networking, and enterprise IT workshop for students.',
      theme: ['Cloud Computing', 'DevOps'],
      status: 'OFFLINE',
      live: true,
      isFeatured: true,
      startDate: '2026-10-28',
      endDate: '2026-10-28',
      location: 'Sai University, Chennai',
      teamSize: 'Individual',
      organizationName: 'HackwithIndia x SAI University Chapter',
      eventType: 'workshop',
    },
    organizer._id,
  );

  await createEvent(
    {
      name: 'GenAI Challenge',
      hackathon: 'genai-challenge-2026',
      eventName: 'genai-challenge-2026',
      subtitle: 'Build with LLMs — ₹5L prize pool',
      theme: ['AI', 'GenAI'],
      live: true,
      isFeatured: true,
      startDate: '2026-11-01',
      endDate: '2026-11-03',
      location: 'Online',
      prizePool: '₹5L',
      teamSize: '2-4',
      organizationName: 'TechAstra',
      eventType: 'hackathon',
    },
    organizer._id,
  );

  await insertJobs([
    {
      title: 'Agent / MCP Developers, Frontend & Backend',
      company: 'Stealth',
      location: 'Bangalore',
      workMode: 'hybrid',
      featured: true,
    },
    {
      title: 'The Viral Creators',
      company: 'TechAstra',
      workMode: 'remote',
      featured: true,
    },
  ]);

  await insertCommunities([
    { name: 'HackwithIndia', description: 'National hackathon network.', memberCount: 12000 },
    { name: 'TechAstra Builders', description: 'Ship and collaborate.', memberCount: 3400 },
  ]);

  await ensureQuestsAndNotifications();
}
