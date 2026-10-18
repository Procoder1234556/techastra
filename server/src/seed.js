import { connectDb, disconnectDb, query } from './db.js';
import { ensureSeedData } from './bootstrap.js';
import { findUserByEmail } from './repositories/users.js';

async function seed() {
  await connectDb();
  await query(
    `TRUNCATE techastra_mailer_deliveries, techastra_mailer_campaigns, techastra_mailer_templates,
     techastra_payments, techastra_uploads, techastra_job_applications, techastra_certificates,
     techastra_notifications, techastra_quest_submissions, techastra_quests, techastra_teams,
     techastra_registrations, techastra_events, techastra_jobs, techastra_communities, techastra_users CASCADE`,
  );
  await ensureSeedData();

  const student = await findUserByEmail('student@techastra.local');
  const organizer = await findUserByEmail('organizer@techastra.local');
  const admin = await findUserByEmail('admin@techastra.local');

  console.log('Seed complete (Supabase).');
  console.log('Demo accounts: student@ / organizer@ / admin@techastra.local');
  console.log('User ids:', { student: student?._id, organizer: organizer?._id, admin: admin?._id });
  await disconnectDb();
  process.exit(0);
}

seed().catch(async (err) => {
  console.error(err);
  await disconnectDb();
  process.exit(1);
});
