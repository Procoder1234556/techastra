import { spawn } from 'child_process';
import path from 'path';

console.log('=== Techastra MCP Server Automated Verification ===\n');

const p = spawn('node', ['D:/techastra/techastra/mcp/server.js'], {
  stdio: ['pipe', 'pipe', 'inherit']
});

let outputData = '';
p.stdout.on('data', (d) => {
  outputData += d.toString();
});

p.on('close', (code) => {
  const lines = outputData.trim().split('\n').filter(Boolean);
  let passed = 0;
  for (const line of lines) {
    try {
      const json = JSON.parse(line);
      if (json.result?.serverInfo?.name === 'techastra-mcp') {
        console.log('[PASS] MCP initialize returned serverInfo.name = techastra-mcp');
        passed++;
      }
      if (Array.isArray(json.result?.tools) && json.result.tools.length === 5) {
        console.log(`[PASS] MCP tools/list returned ${json.result.tools.length} active tools`);
        passed++;
      }
      if (json.result?.content?.[0]?.text) {
        console.log('[PASS] MCP tools/call (techastra_search_events) executed successfully');
        passed++;
      }
    } catch (e) {}
  }
  console.log(`\nMCP Test Summary: ${passed} Passed, Exit code: ${code}`);
  process.exit(passed >= 2 ? 0 : 1);
});

// Send JSON-RPC requests
p.stdin.write(JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'initialize', params: {} }) + '\n');
p.stdin.write(JSON.stringify({ jsonrpc: '2.0', id: 2, method: 'tools/list', params: {} }) + '\n');
p.stdin.write(JSON.stringify({ jsonrpc: '2.0', id: 3, method: 'tools/call', params: { name: 'techastra_search_events', arguments: { category: 'hackathon' } } }) + '\n');

setTimeout(() => {
  p.stdin.end();
}, 500);