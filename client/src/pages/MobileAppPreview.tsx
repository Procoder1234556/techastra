import { useState, useEffect } from 'react';
import {
  Compass,
  Ticket,
  ScanLine,
  Trophy,
  Calendar,
  MapPin,
  Users,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Search,
  ShieldCheck,
  Wifi,
  WifiOff
} from 'lucide-react';

interface MobileEvent {
  id: string;
  name: string;
  category: string;
  date: string;
  venue: string;
  prizePool: string;
  attendees: number;
  coverUrl: string;
  isRegistered?: boolean;
}

export function MobileAppPreview() {
  const [activeTab, setActiveTab] = useState<'discover' | 'ticket' | 'scanner' | 'quests'>('discover');
  const [isOffline, setIsOffline] = useState(false);
  const [currentTime, setCurrentTime] = useState('12:00:00 PM');
  const [scannedTickets, setScannedTickets] = useState<Array<{ id: string; name: string; time: string; status: 'approved' | 'duplicate' }>>([
    { id: 'TA-9921', name: 'Arjun Sharma', time: '10:14 AM', status: 'approved' },
    { id: 'TA-9922', name: 'Priya Patel', time: '10:18 AM', status: 'approved' }
  ]);
  const [scanResult, setScanResult] = useState<string | null>(null);

  // Live ticker for screenshot-deterrent watermark
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const sampleEvents: MobileEvent[] = [
    {
      id: 'e-1',
      name: 'Techastra National Hackathon 2026',
      category: 'Hackathon',
      date: 'Nov 20 - 22, 2026',
      venue: 'Bangalore Tech Center & Hybrid',
      prizePool: '₹2,50,000',
      attendees: 480,
      coverUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&auto=format&fit=crop&q=80',
      isRegistered: true,
    },
    {
      id: 'e-2',
      name: 'Agentic AI & ADK Builder Summit',
      category: 'Workshop',
      date: 'Nov 28, 2026',
      venue: 'Virtual / Techastra Live',
      prizePool: 'Swag & Grants',
      attendees: 310,
      coverUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200&auto=format&fit=crop&q=80',
      isRegistered: false,
    },
    {
      id: 'e-3',
      name: 'Web3 & Rust Micro-Hack',
      category: 'Hackathon',
      date: 'Dec 05, 2026',
      venue: 'Hyderabad Campus',
      prizePool: '₹75,000',
      attendees: 195,
      coverUrl: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=1200&auto=format&fit=crop&q=80',
      isRegistered: false,
    }
  ];

  const handleSimulatedScan = () => {
    const isDup = Math.random() > 0.6;
    const newId = `TA-${Math.floor(1000 + Math.random() * 9000)}`;
    const newScan = {
      id: newId,
      name: isDup ? 'Arjun Sharma' : 'Rohan Verma',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: (isDup ? 'duplicate' : 'approved') as 'approved' | 'duplicate'
    };
    setScannedTickets(prev => [newScan, ...prev]);
    setScanResult(isDup ? 'DUPLICATE_SCAN' : 'SUCCESS_CHECKIN');
    setTimeout(() => setScanResult(null), 3000);
  };

  return (
    <div className="min-h-screen bg-[#070A11] text-gray-100 py-8 px-4 flex flex-col items-center">
      {/* Header bar */}
      <div className="max-w-4xl w-full flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Techastra Mobile Experience (Android & iOS)
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Techastra Native Mobile Client</h1>
          <p className="text-sm text-gray-400">
            Luma-inspired discovery, offline-ready dynamic QR pass & organizer rapid scanner.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsOffline(!isOffline)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              isOffline
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
            }`}
          >
            {isOffline ? <WifiOff className="w-4 h-4" /> : <Wifi className="w-4 h-4" />}
            {isOffline ? 'Mode: Offline (Venue Mode)' : 'Mode: Online'}
          </button>
        </div>
      </div>

      {/* Mobile Frame Container */}
      <div className="w-full max-w-[390px] h-[780px] bg-[#0B0F19] rounded-[44px] p-3 shadow-2xl border-4 border-gray-800 flex flex-col relative overflow-hidden ring-1 ring-white/10">
        {/* Dynamic Island / Speaker notch */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-full z-50 flex items-center justify-center">
          <div className="w-2.5 h-2.5 rounded-full bg-gray-900 border border-gray-800 mr-2" />
          <div className="w-2 h-2 rounded-full bg-blue-900/60" />
        </div>

        {/* Screen Status Bar */}
        <div className="pt-2 px-6 pb-2 flex justify-between items-center text-[11px] font-semibold text-gray-400 z-40">
          <span>{currentTime.split(' ')[0]}</span>
          <div className="flex items-center gap-1.5">
            {isOffline ? <WifiOff className="w-3 h-3 text-amber-400" /> : <Wifi className="w-3 h-3 text-white" />}
            <div className="w-4 h-2 border border-gray-400 rounded-sm p-[1px] flex items-center">
              <div className="w-full h-full bg-white rounded-xs" />
            </div>
          </div>
        </div>

        {/* Screen Body */}
        <div className="flex-1 overflow-y-auto px-4 pb-20 pt-2 scrollbar-none">
          {/* TAB 1: DISCOVER FEED */}
          {activeTab === 'discover' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pt-1">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-400">Discover</span>
                  <h2 className="text-xl font-bold text-white">Upcoming Hacks</h2>
                </div>
                <div className="w-8 h-8 rounded-full bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-xs font-bold text-indigo-300">
                  TA
                </div>
              </div>

              {/* Search pill */}
              <div className="relative">
                <Search className="w-4 h-4 text-gray-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search hackathons, workshops..."
                  className="w-full bg-[#161E2E] border border-gray-800 rounded-xl pl-9 pr-3 py-2 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                  readOnly
                />
              </div>

              {/* Category pills */}
              <div className="flex gap-2 overflow-x-auto pb-1 text-xs scrollbar-none">
                <span className="px-3 py-1 rounded-full bg-indigo-600 text-white font-medium shrink-0">All</span>
                <span className="px-3 py-1 rounded-full bg-[#161E2E] text-gray-300 border border-gray-800 shrink-0">Hackathons</span>
                <span className="px-3 py-1 rounded-full bg-[#161E2E] text-gray-300 border border-gray-800 shrink-0">DevQuests</span>
                <span className="px-3 py-1 rounded-full bg-[#161E2E] text-gray-300 border border-gray-800 shrink-0">Workshops</span>
              </div>

              {/* Event Cards */}
              <div className="space-y-3">
                {sampleEvents.map(event => (
                  <div key={event.id} className="bg-[#111827] border border-gray-800/80 rounded-2xl overflow-hidden hover:border-gray-700 transition-all">
                    <div className="h-32 w-full relative">
                      <img src={event.coverUrl} alt={event.name} className="w-full h-full object-cover" />
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[10px] font-bold text-indigo-300 border border-white/10 uppercase">
                        {event.category}
                      </div>
                      <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-indigo-600/90 text-white text-[10px] font-bold">
                        {event.prizePool}
                      </div>
                    </div>
                    <div className="p-3">
                      <h3 className="font-semibold text-sm text-white line-clamp-1">{event.name}</h3>
                      <div className="mt-1 flex items-center gap-2 text-[11px] text-gray-400">
                        <Calendar className="w-3 h-3 text-indigo-400" />
                        <span>{event.date}</span>
                      </div>
                      <div className="mt-1 flex items-center gap-2 text-[11px] text-gray-400">
                        <MapPin className="w-3 h-3 text-cyan-400" />
                        <span className="line-clamp-1">{event.venue}</span>
                      </div>
                      <div className="mt-3 pt-2 border-t border-gray-800/60 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
                          <Users className="w-3 h-3 text-gray-400" />
                          <span>{event.attendees} registered</span>
                        </div>
                        {event.isRegistered ? (
                          <button
                            onClick={() => setActiveTab('ticket')}
                            className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/30 flex items-center gap-1"
                          >
                            <Ticket className="w-3 h-3" /> View Pass
                          </button>
                        ) : (
                          <button
                            onClick={() => setActiveTab('ticket')}
                            className="px-2.5 py-1 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500"
                          >
                            Register
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: DYNAMIC TICKET PASS */}
          {activeTab === 'ticket' && (
            <div className="space-y-4">
              <div className="text-center pt-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400">Digital Event Pass</span>
                <h2 className="text-lg font-bold text-white">Techastra Hack 2026</h2>
              </div>

              {/* Ticket Card with Security Watermark */}
              <div className="bg-gradient-to-b from-[#161E2E] to-[#0F172A] border border-indigo-500/30 rounded-2xl p-4 shadow-xl relative overflow-hidden">
                <div className="absolute -right-8 -top-8 w-28 h-28 bg-indigo-500/10 rounded-full blur-xl pointer-events-none" />
                <div className="flex items-center justify-between pb-3 border-b border-gray-800">
                  <div>
                    <p className="text-[10px] uppercase text-gray-400 font-semibold">Attendee</p>
                    <p className="text-sm font-bold text-white">Arjun Sharma</p>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                      ROLE: HACKER
                    </span>
                    <p className="text-[10px] text-gray-400 mt-0.5">Team: #ALPHA-7</p>
                  </div>
                </div>

                {/* QR Code Presentation */}
                <div className="py-4 flex flex-col items-center justify-center">
                  <div className="w-48 h-48 bg-white p-3 rounded-2xl shadow-inner flex flex-col items-center justify-center relative">
                    <div className="w-full h-full bg-[#0B0F19] rounded-xl flex items-center justify-center border-2 border-indigo-500/20 relative overflow-hidden">
                      <div className="text-center p-2">
                        <ShieldCheck className="w-12 h-12 text-indigo-400 mx-auto mb-1 animate-pulse" />
                        <span className="text-[9px] font-mono text-indigo-200">TA:REG9921:ACTIVE</span>
                        <div className="mt-1 text-[8px] font-mono text-gray-400">HMAC-SHA256 SECURED</div>
                      </div>
                      <div className="absolute inset-x-0 h-1 bg-indigo-500/60 shadow-[0_0_8px_#6366f1] animate-bounce" />
                    </div>
                  </div>

                  {/* Anti-screenshot ticker */}
                  <div className="mt-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/50 border border-white/10 text-[10px] text-gray-300 font-mono">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>Live Verification: {currentTime}</span>
                  </div>
                </div>

                {/* Offline Cache Status */}
                <div className="pt-3 border-t border-gray-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-gray-400 text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Cached in Local Storage</span>
                  </div>
                  <span className="text-[11px] text-indigo-400 font-mono">#TA-8924</span>
                </div>
              </div>

              {/* Wallet Integration Actions */}
              <div className="space-y-2">
                <button className="w-full py-2.5 rounded-xl bg-gray-900 border border-gray-700 text-white text-xs font-semibold flex items-center justify-center gap-2 hover:bg-gray-800">
                  <span className="font-bold">Apple Wallet</span> Add Pass (.pkpass)
                </button>
                <button className="w-full py-2.5 rounded-xl bg-gray-900 border border-gray-700 text-white text-xs font-semibold flex items-center justify-center gap-2 hover:bg-gray-800">
                  <span className="font-bold">Google Wallet</span> Save to Phone
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: HOST LIVE SCANNER */}
          {activeTab === 'scanner' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between pt-1">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-400">Host Terminal</span>
                  <h2 className="text-lg font-bold text-white">QR Gate Check-in</h2>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  GATE 1
                </span>
              </div>

              {/* Simulated Camera Viewfinder */}
              <div className="w-full h-48 bg-black rounded-2xl relative overflow-hidden border border-cyan-500/40 flex flex-col items-center justify-center">
                <div className="w-32 h-32 border-2 border-dashed border-cyan-400/80 rounded-xl relative flex items-center justify-center">
                  <div className="absolute inset-x-0 h-0.5 bg-cyan-400 shadow-[0_0_10px_#06b6d4] animate-pulse" />
                  <ScanLine className="w-8 h-8 text-cyan-400/60" />
                </div>
                <span className="text-[10px] text-gray-400 mt-2 font-mono">Align attendee QR code inside frame</span>

                {/* Scan Result Overlay Banner */}
                {scanResult === 'SUCCESS_CHECKIN' && (
                  <div className="absolute inset-x-0 bottom-0 py-2 bg-emerald-600/90 text-white text-center text-xs font-bold flex items-center justify-center gap-1.5 animate-in slide-in-from-bottom">
                    <CheckCircle2 className="w-4 h-4" /> Check-in Approved (Haptic Confirmed)
                  </div>
                )}
                {scanResult === 'DUPLICATE_SCAN' && (
                  <div className="absolute inset-x-0 bottom-0 py-2 bg-amber-600/90 text-white text-center text-xs font-bold flex items-center justify-center gap-1.5 animate-in slide-in-from-bottom">
                    <AlertTriangle className="w-4 h-4" /> DUPLICATE: Already scanned at 10:14 AM
                  </div>
                )}
              </div>

              {/* Scanner Trigger Simulator */}
              <button
                onClick={handleSimulatedScan}
                className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <ScanLine className="w-4 h-4" /> Trigger Simulated Camera Scan
              </button>

              {/* Roster & Stats */}
              <div className="pt-2">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-gray-400 font-semibold">Live Check-in Roster</span>
                  <span className="text-cyan-400 font-bold">{scannedTickets.filter(s => s.status === 'approved').length + 140} / 300</span>
                </div>
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {scannedTickets.map((scan, idx) => (
                    <div
                      key={idx}
                      className="px-3 py-2 rounded-xl bg-[#111827] border border-gray-800 flex items-center justify-between text-xs"
                    >
                      <div>
                        <p className="font-semibold text-white">{scan.name}</p>
                        <p className="text-[10px] text-gray-400 font-mono">{scan.id} &bull; {scan.time}</p>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          scan.status === 'approved'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {scan.status === 'approved' ? 'APPROVED' : 'DUPLICATE'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: DEVQUESTS & XP */}
          {activeTab === 'quests' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between pt-1">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400">Gamified Bounties</span>
                  <h2 className="text-lg font-bold text-white">DevQuests & XP</h2>
                </div>
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold">
                  <Trophy className="w-3.5 h-3.5" /> 350 XP
                </div>
              </div>

              <div className="space-y-2.5">
                <div className="p-3 rounded-2xl bg-[#161E2E] border border-amber-500/30">
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-sm text-white">Build an MCP Server for Techastra</h3>
                    <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                      +100 XP
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Connect Techastra hackathon registrations with LLM tools via FastMCP.</p>
                  <div className="mt-3 flex justify-between items-center text-xs">
                    <span className="text-[10px] text-gray-500">Ends in 3 days</span>
                    <button className="px-3 py-1 rounded-lg bg-amber-500 text-black font-semibold text-xs hover:bg-amber-400">
                      Submit PR
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-[#161E2E] border border-gray-800">
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-sm text-white">Solve Accessibility & Dark Mode Contrast</h3>
                    <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                      +50 XP
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Audit WCAG 2.1 AA compliance across mobile pass and event cards.</p>
                  <div className="mt-3 flex justify-between items-center text-xs">
                    <span className="text-[10px] text-gray-500">Ends in 5 days</span>
                    <button className="px-3 py-1 rounded-lg bg-gray-800 text-gray-200 font-semibold text-xs hover:bg-gray-700">
                      View Task
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Navigation Tabs */}
        <div className="absolute bottom-3 inset-x-3 h-16 bg-[#111827]/95 backdrop-blur-xl border border-gray-800/80 rounded-3xl px-4 flex items-center justify-around z-50 shadow-2xl">
          <button
            onClick={() => setActiveTab('discover')}
            className={`flex flex-col items-center gap-1 ${activeTab === 'discover' ? 'text-indigo-400 font-semibold' : 'text-gray-500'}`}
          >
            <Compass className="w-5 h-5" />
            <span className="text-[10px]">Discover</span>
          </button>

          <button
            onClick={() => setActiveTab('ticket')}
            className={`flex flex-col items-center gap-1 ${activeTab === 'ticket' ? 'text-indigo-400 font-semibold' : 'text-gray-500'}`}
          >
            <Ticket className="w-5 h-5" />
            <span className="text-[10px]">My Pass</span>
          </button>

          <button
            onClick={() => setActiveTab('scanner')}
            className={`flex flex-col items-center gap-1 ${activeTab === 'scanner' ? 'text-cyan-400 font-semibold' : 'text-gray-500'}`}
          >
            <ScanLine className="w-5 h-5" />
            <span className="text-[10px]">Scanner</span>
          </button>

          <button
            onClick={() => setActiveTab('quests')}
            className={`flex flex-col items-center gap-1 ${activeTab === 'quests' ? 'text-amber-400 font-semibold' : 'text-gray-500'}`}
          >
            <Trophy className="w-5 h-5" />
            <span className="text-[10px]">Quests</span>
          </button>
        </div>
      </div>
    </div>
  );
}
