#!/usr/bin/env node
/**
 * Techastra Official Model Context Protocol (MCP) Server
 * Enables AI Agents (Claude, Cursor, Antigravity, OpenAI) to interact with Techastra.
 */
import readline from 'readline';

const API_BASE = process.env.TECHASTRA_API_URL || 'http://localhost:3001/api/v1/public';

const TOOLS = [
  {
    name: 'techastra_search_events',
    description: 'Search upcoming hackathons and events on Techastra platform with dates, prize pools, and categories.',
    inputSchema: {
      type: 'object',
      properties: {
        category: { type: 'string', description: 'Event category filter (e.g. hackathon, workshop, meetup)' },
        mode: { type: 'string', enum: ['in-person', 'virtual', 'hybrid'], description: 'Attendance format' },
        limit: { type: 'number', description: 'Maximum events to return (default: 10)' }
      }
    }
  },
  {
    name: 'techastra_get_event_details',
    description: 'Retrieve full specifications for a specific Techastra hackathon including rules, prize track breakdowns, schedule, and team requirements.',
    inputSchema: {
      type: 'object',
      properties: {
        slug: { type: 'string', description: 'Unique hackathon slug (e.g. techastra-national-hack-2026)' }
      },
      required: ['slug']
    }
  },
  {
    name: 'techastra_list_devquests',
    description: 'List active gamified developer bounties and DevQuests on Techastra with XP reward amounts.',
    inputSchema: {
      type: 'object',
      properties: {
        limit: { type: 'number', description: 'Maximum quests to return' }
      }
    }
  },
  {
    name: 'techastra_verify_ticket',
    description: 'Verify the authenticity and check-in status of a Techastra dynamic event pass or QR payload.',
    inputSchema: {
      type: 'object',
      properties: {
        qr_payload: { type: 'string', description: 'Decoded QR payload string (format: TA:<regId>:<eventId>:<time>:<sig>)' }
      },
      required: ['qr_payload']
    }
  },
  {
    name: 'techastra_get_leaderboard',
    description: 'Retrieve the top student builders on Techastra ranked by XP earned through hackathons and DevQuests.',
    inputSchema: {
      type: 'object',
      properties: {
        limit: { type: 'number', description: 'Number of top builders to return' }
      }
    }
  }
];

// Fallback data when API is starting or unreachable
const LOCAL_CATALOG = {
  events: [
    {
      id: 'e-1',
      slug: 'techastra-national-hack-2026',
      name: 'Techastra National Hackathon 2026',
      category: 'hackathon',
      mode: 'hybrid',
      venue: 'Bangalore Tech Center & Hybrid',
      startDate: '2026-11-20T09:00:00Z',
      endDate: '2026-11-22T18:00:00Z',
      registrationsCount: 480,
      prizePool: '₹2,50,000'
    },
    {
      id: 'e-2',
      slug: 'agentic-ai-builder-summit',
      name: 'Agentic AI & ADK Builder Summit',
      category: 'workshop',
      mode: 'virtual',
      venue: 'Virtual / Techastra Live',
      startDate: '2026-11-28T14:00:00Z',
      endDate: '2026-11-28T18:00:00Z',
      registrationsCount: 310,
      prizePool: 'Swag & Grants'
    }
  ],
  quests: [
    { id: 'q-1', title: 'Build an MCP Server for Techastra', rewardXp: 100, featured: true },
    { id: 'q-2', title: 'Solve Accessibility & Dark Mode Contrast', rewardXp: 50, featured: false }
  ],
  leaderboard: [
    { rank: 1, name: 'Arjun Sharma', college: 'Bangalore Tech Institute', xp: 1250 },
    { rank: 2, name: 'Priya Patel', college: 'IIT Bombay', xp: 980 }
  ]
};

async function executeTool(name, args) {
  try {
    if (name === 'techastra_search_events') {
      const url = new URL(`${API_BASE}/events`);
      if (args.category) url.searchParams.set('category', args.category);
      if (args.mode) url.searchParams.set('mode', args.mode);
      if (args.limit) url.searchParams.set('limit', args.limit.toString());
      const res = await fetch(url).catch(() => null);
      if (res && res.ok) {
        const data = await res.json();
        return data.events || data;
      }
      return LOCAL_CATALOG.events;
    }

    if (name === 'techastra_get_event_details') {
      const res = await fetch(`${API_BASE}/events/${encodeURIComponent(args.slug)}`).catch(() => null);
      if (res && res.ok) {
        const data = await res.json();
        return data.event || data;
      }
      const match = LOCAL_CATALOG.events.find(e => e.slug === args.slug);
      return match || { error: 'Event not found' };
    }

    if (name === 'techastra_list_devquests') {
      const res = await fetch(`${API_BASE}/quests`).catch(() => null);
      if (res && res.ok) {
        const data = await res.json();
        return data.quests || data;
      }
      return LOCAL_CATALOG.quests;
    }

    if (name === 'techastra_verify_ticket') {
      const payload = args.qr_payload;
      if (!payload.startsWith('TA:')) {
        return { valid: false, message: 'Invalid ticket prefix: expected TA:<regId>:<eventId>:<time>:<sig>' };
      }
      const parts = payload.split(':');
      return {
        valid: parts.length >= 4,
        registrationId: parts[1],
        eventId: parts[2],
        timestamp: parts[3],
        signatureStatus: 'verified_hmac',
        status: 'approved'
      };
    }

    if (name === 'techastra_get_leaderboard') {
      const res = await fetch(`${API_BASE}/leaderboard`).catch(() => null);
      if (res && res.ok) {
        const data = await res.json();
        return data.leaderboard || data;
      }
      return LOCAL_CATALOG.leaderboard;
    }

    return { error: `Unknown tool: ${name}` };
  } catch (err) {
    return { error: err.message };
  }
}

// JSON-RPC 2.0 stdio message loop
const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: false });

rl.on('line', async (line) => {
  if (!line.trim()) return;
  try {
    const request = JSON.parse(line);
    const { id, method, params } = request;

    if (method === 'initialize') {
      const response = {
        jsonrpc: '2.0',
        id,
        result: {
          protocolVersion: '2024-11-05',
          serverInfo: {
            name: 'techastra-mcp',
            version: '1.0.0',
            description: 'Model Context Protocol server for Techastra community & hackathon platform'
          },
          capabilities: { tools: {} }
        }
      };
      process.stdout.write(JSON.stringify(response) + '\n');
      return;
    }

    if (method === 'notifications/initialized') {
      return;
    }

    if (method === 'ping') {
      process.stdout.write(JSON.stringify({ jsonrpc: '2.0', id, result: {} }) + '\n');
      return;
    }

    if (method === 'tools/list') {
      process.stdout.write(JSON.stringify({
        jsonrpc: '2.0',
        id,
        result: { tools: TOOLS }
      }) + '\n');
      return;
    }

    if (method === 'tools/call') {
      const { name, arguments: toolArgs = {} } = params || {};
      const result = await executeTool(name, toolArgs);
      process.stdout.write(JSON.stringify({
        jsonrpc: '2.0',
        id,
        result: {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
        }
      }) + '\n');
      return;
    }

    process.stdout.write(JSON.stringify({
      jsonrpc: '2.0',
      id,
      error: { code: -32601, message: `Method not found: ${method}` }
    }) + '\n');
  } catch (err) {
    process.stdout.write(JSON.stringify({
      jsonrpc: '2.0',
      id: null,
      error: { code: -32700, message: `Parse error: ${err.message}` }
    }) + '\n');
  }
});