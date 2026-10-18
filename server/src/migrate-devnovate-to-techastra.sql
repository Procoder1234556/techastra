-- One-time rename if you already created devnovate_* tables in Supabase.
-- Run in SQL editor, then use techastra_* in the app. Skip if you use npm run seed on a fresh DB.

ALTER TABLE IF EXISTS devnovate_users RENAME TO techastra_users;
ALTER TABLE IF EXISTS devnovate_events RENAME TO techastra_events;
ALTER TABLE IF EXISTS devnovate_jobs RENAME TO techastra_jobs;
ALTER TABLE IF EXISTS devnovate_communities RENAME TO techastra_communities;
ALTER TABLE IF EXISTS devnovate_registrations RENAME TO techastra_registrations;
ALTER TABLE IF EXISTS devnovate_teams RENAME TO techastra_teams;
ALTER TABLE IF EXISTS devnovate_quests RENAME TO techastra_quests;
ALTER TABLE IF EXISTS devnovate_quest_submissions RENAME TO techastra_quest_submissions;
ALTER TABLE IF EXISTS devnovate_notifications RENAME TO techastra_notifications;
ALTER TABLE IF EXISTS devnovate_certificates RENAME TO techastra_certificates;
ALTER TABLE IF EXISTS devnovate_job_applications RENAME TO techastra_job_applications;
