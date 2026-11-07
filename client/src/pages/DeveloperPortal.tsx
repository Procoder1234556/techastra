import { useState } from 'react';
import { Terminal, Code2, Bot, Copy, Check, Sparkles } from 'lucide-react';

export function DeveloperPortal() {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const mcpConfigSnippet = `{
  "mcpServers": {
    "techastra": {
      "command": "node",
      "args": ["D:/techastra/techastra/mcp/server.js"],
      "env": {
        "TECHASTRA_API_URL": "http://localhost:3001/api/v1/public"
      }
    }
  }
}`;

  const curlExample = `curl -X GET "http://localhost:3001/api/v1/public/events?category=hackathon&limit=5" \\
  -H "Accept: application/json"`;

  return (
    <div className="min-h-screen bg-white dark:bg-[#0B0F19] text-neutral-900 dark:text-neutral-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
            <Sparkles className="w-3.5 h-3.5" /> Open Ecosystem & Agent Protocol
          </div>
          <h1 className="text-4xl sm:text-5xl font-display font-bold tracking-tight text-neutral-900 dark:text-white">
            Techastra for Developers & AI Agents
          </h1>
          <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
            Access Techastra's hackathon discovery, DevQuest bounties, and digital pass verification through our Public REST API and official Model Context Protocol (MCP) server.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <a
              href="/api/v1/public/openapi.json"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-neutral-300 dark:border-white/20 text-xs font-semibold hover:bg-neutral-50 dark:hover:bg-neutral-800"
            >
              <Code2 className="w-4 h-4 text-indigo-500" /> View OpenAPI 3.1 Spec
            </a>
            <a
              href="#mcp-section"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500 shadow-md shadow-indigo-600/30"
            >
              <Bot className="w-4 h-4" /> Connect AI Agents (MCP)
            </a>
          </div>
        </div>

        {/* Section 1: Model Context Protocol (MCP) Server */}
        <div id="mcp-section" className="rounded-3xl bg-neutral-50 dark:bg-[#111827] border border-neutral-200 dark:border-gray-800 p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 dark:border-gray-800 pb-6">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
                  <Bot className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Official Techastra MCP Server</h2>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                Enables Claude Desktop, Cursor, Antigravity, or any MCP client to query hackathons and DevQuests autonomously.
              </p>
            </div>
            <button
              onClick={() => copyToClipboard(mcpConfigSnippet, 'mcp')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-medium self-start sm:self-auto hover:opacity-90"
            >
              {copiedSection === 'mcp' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedSection === 'mcp' ? 'Copied Config' : 'Copy Claude / Cursor Config'}
            </button>
          </div>

          {/* Tools Table */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">Supported MCP Tools</h3>
            <div className="grid sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-white dark:bg-[#161E2E] border border-neutral-200 dark:border-gray-800">
                <span className="font-mono font-semibold text-indigo-500 dark:text-indigo-400">techastra_search_events</span>
                <p className="text-neutral-600 dark:text-neutral-400 mt-1">Search hackathons by category, mode, and date with prize pool filtering.</p>
              </div>
              <div className="p-3 rounded-xl bg-white dark:bg-[#161E2E] border border-neutral-200 dark:border-gray-800">
                <span className="font-mono font-semibold text-indigo-500 dark:text-indigo-400">techastra_get_event_details</span>
                <p className="text-neutral-600 dark:text-neutral-400 mt-1">Retrieve full schedule, rules, prize tracks, and team requirements for an event.</p>
              </div>
              <div className="p-3 rounded-xl bg-white dark:bg-[#161E2E] border border-neutral-200 dark:border-gray-800">
                <span className="font-mono font-semibold text-indigo-500 dark:text-indigo-400">techastra_list_devquests</span>
                <p className="text-neutral-600 dark:text-neutral-400 mt-1">Inspect active bounties, submission criteria, and XP rewards.</p>
              </div>
              <div className="p-3 rounded-xl bg-white dark:bg-[#161E2E] border border-neutral-200 dark:border-gray-800">
                <span className="font-mono font-semibold text-indigo-500 dark:text-indigo-400">techastra_verify_ticket</span>
                <p className="text-neutral-600 dark:text-neutral-400 mt-1">Verify dynamic HMAC-SHA256 digital event pass payloads.</p>
              </div>
            </div>
          </div>

          {/* Code Block */}
          <div className="relative">
            <pre className="p-4 rounded-2xl bg-neutral-900 text-gray-200 text-xs font-mono overflow-x-auto border border-neutral-800">
              <code>{mcpConfigSnippet}</code>
            </pre>
          </div>
        </div>

        {/* Section 2: REST Developer API */}
        <div className="rounded-3xl bg-neutral-50 dark:bg-[#111827] border border-neutral-200 dark:border-gray-800 p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 dark:border-gray-800 pb-6">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-cyan-600 flex items-center justify-center text-white">
                  <Terminal className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Public REST API (v1)</h2>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                Lightweight, CORS-enabled endpoints returning standardized JSON envelopes.
              </p>
            </div>
            <button
              onClick={() => copyToClipboard(curlExample, 'curl')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-gray-700 text-xs font-medium self-start sm:self-auto hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              {copiedSection === 'curl' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedSection === 'curl' ? 'Copied cURL' : 'Copy cURL Example'}
            </button>
          </div>

          {/* Endpoints List */}
          <div className="space-y-2">
            {[
              { method: 'GET', path: '/api/v1/public/events', desc: 'List hackathons with filters (?category=hackathon&mode=hybrid)' },
              { method: 'GET', path: '/api/v1/public/events/:slug', desc: 'Get full hackathon details, schedule, and rules' },
              { method: 'GET', path: '/api/v1/public/quests', desc: 'List active DevQuests and developer XP bounties' },
              { method: 'GET', path: '/api/v1/public/leaderboard', desc: 'Get top student builders ranked by XP' },
              { method: 'GET', path: '/api/v1/public/openapi.json', desc: 'Full OpenAPI 3.1.0 JSON specification' }
            ].map((ep, i) => (
              <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl bg-white dark:bg-[#161E2E] border border-neutral-200 dark:border-gray-800 text-xs gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="px-2 py-0.5 rounded font-mono font-bold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                    {ep.method}
                  </span>
                  <span className="font-mono text-neutral-900 dark:text-neutral-100">{ep.path}</span>
                </div>
                <span className="text-neutral-500 dark:text-neutral-400">{ep.desc}</span>
              </div>
            ))}
          </div>

          <div className="relative">
            <pre className="p-4 rounded-2xl bg-neutral-900 text-gray-200 text-xs font-mono overflow-x-auto border border-neutral-800">
              <code>{curlExample}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
