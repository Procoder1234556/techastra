import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { disconnectDb, query } from './db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sqlPath = path.join(__dirname, 'migrate-devnovate-to-techastra.sql');

async function run() {
  const sql = readFileSync(sqlPath, 'utf8');
  const statements = sql
    .split(';')
    .map((s) => s.replace(/--[^\n]*/g, '').trim())
    .filter(Boolean);

  await query('SELECT 1');
  for (const statement of statements) {
    try {
      await query(statement);
      console.log('OK:', statement.split('\n')[0]);
    } catch (err) {
      const msg = err.message || String(err);
      if (
        msg.includes('does not exist') ||
        msg.includes('already exists') ||
        msg.includes('duplicate')
      ) {
        console.log('Skip:', msg.split('\n')[0]);
      } else {
        throw err;
      }
    }
  }
  await disconnectDb();
  console.log('Migration pass complete.');
}

run().catch(async (err) => {
  console.error(err);
  await disconnectDb();
  process.exit(1);
});
