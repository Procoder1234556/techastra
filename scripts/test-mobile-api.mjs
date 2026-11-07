import { createApp } from '../server/src/app.js';
import http from 'http';

console.log('=== Techastra Full Mobile & Platform Test Suite ===\n');

const app = createApp();
const server = http.createServer(app);

server.listen(0, async () => {
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;
  let passed = 0;
  let failed = 0;

  async function assertTest(name, fn) {
    try {
      await fn();
      console.log(`  [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`  [FAIL] ${name}:`, err.message);
      failed++;
    }
  }

  console.log('1. Health & Server Bootstrap');
  await assertTest('GET /health returns status ok with Supabase database', async () => {
    const res = await fetch(`${baseUrl}/health`);
    const data = await res.json();
    if (!data.ok || data.database !== 'supabase') throw new Error(`Unexpected health payload: ${JSON.stringify(data)}`);
  });

  await assertTest('POST /api/v1/mobile/bootstrap delivers client config and version flags', async () => {
    const res = await fetch(`${baseUrl}/api/v1/mobile/bootstrap`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ platform: 'ios', appVersion: '1.2.0', buildNumber: 42 })
    });
    const data = await res.json();
    if (!data.success) throw new Error('Bootstrap success was false');
    if (data.platform !== 'ios') throw new Error('Platform not reflected');
    if (data.maintenanceMode !== false) throw new Error('Maintenance mode should be false');
  });

  console.log('\n2. Mobile Feed & DevQuests Engine');
  await assertTest('GET /api/v1/mobile/feed returns array of structured event objects', async () => {
    const res = await fetch(`${baseUrl}/api/v1/mobile/feed?limit=5`);
    const data = await res.json();
    if (!data.success) throw new Error('Feed success was false');
    if (!Array.isArray(data.items)) throw new Error('Items is not an array');
    if (!Array.isArray(data.featured)) throw new Error('Featured is not an array');
  });

  await assertTest('GET /api/v1/mobile/quests returns active bounties and XP', async () => {
    const res = await fetch(`${baseUrl}/api/v1/mobile/quests`);
    const data = await res.json();
    if (!data.success) throw new Error('Quests success was false');
    if (!Array.isArray(data.quests)) throw new Error('Quests is not an array');
  });

  console.log('\n3. Dynamic Ticket Pass & Security');
  await assertTest('GET /api/v1/mobile/tickets/non-existent returns 404 gracefully', async () => {
    const res = await fetch(`${baseUrl}/api/v1/mobile/tickets/c0000000-0000-0000-0000-000000000000`);
    if (res.status !== 404) throw new Error(`Expected 404 status but received ${res.status}`);
    const data = await res.json();
    if (data.success !== false) throw new Error('Expected success: false on missing ticket');
  });

  console.log('\n4. Organizer Gate QR Scanner & Atomic Check-in');
  await assertTest('POST /api/v1/mobile/organizer/checkin validates empty scans array', async () => {
    const res = await fetch(`${baseUrl}/api/v1/mobile/organizer/checkin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scans: [] })
    });
    if (res.status !== 400) throw new Error(`Expected 400 on empty scans, got ${res.status}`);
  });

  await assertTest('POST /api/v1/mobile/organizer/checkin handles single and batch scans with duplicate detection', async () => {
    const testReg1 = `REG-TEST-${Date.now()}-A`;
    const testReg2 = `REG-TEST-${Date.now()}-B`;

    // 1st Scan of Reg1 -> Approved
    const res1 = await fetch(`${baseUrl}/api/v1/mobile/organizer/checkin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scans: [{ qrPayload: `TA:${testReg1}:EVENT1:1700000000:SIGA` }] })
    });
    const d1 = await res1.json();
    if (!d1.success || d1.results[0]?.status !== 'approved') {
      throw new Error(`Reg1 first scan expected approved, got ${JSON.stringify(d1)}`);
    }

    // Batch scan with duplicate Reg1 and fresh Reg2
    const res2 = await fetch(`${baseUrl}/api/v1/mobile/organizer/checkin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        scans: [
          { qrPayload: `TA:${testReg1}:EVENT1:1700000000:SIGA` },
          { qrPayload: `TA:${testReg2}:EVENT1:1700000000:SIGB` }
        ]
      })
    });
    const d2 = await res2.json();
    if (!d2.success || d2.processedCount !== 2) throw new Error('Expected 2 processed results');
    if (d2.results[0]?.status !== 'duplicate') throw new Error('Reg1 should be flagged as duplicate');
    if (d2.results[1]?.status !== 'approved') throw new Error('Reg2 should be approved');
  });

  server.close(() => {
    console.log(`\n=================================================`);
    console.log(`Total: ${passed + failed} | Passed: ${passed} | Failed: ${failed}`);
    console.log(`Status: ${failed === 0 ? 'ALL TESTS PASSED' : 'TESTS FAILED'}`);
    console.log(`=================================================`);
    process.exit(failed > 0 ? 1 : 0);
  });
});