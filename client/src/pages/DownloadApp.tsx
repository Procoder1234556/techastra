import { useState, useEffect } from 'react';
import { Smartphone, Download, Globe, QrCode, CheckCircle2, ShieldCheck, Zap, ArrowRight, Share2, Layers } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function DownloadApp() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallPWA = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      alert('To install Techastra: Tap your browser menu (or Share icon on iOS) and select "Add to Home Screen" or "Install App".');
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.origin + '/download');
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const apkDownloadUrl = 'https://github.com/Procoder1234556/techastra/releases/download/v1.0.0-mobile/techastra-v1.0.0-debug.apk';

  return (
    <div className="min-h-screen bg-white dark:bg-[#0B0F19] text-neutral-900 dark:text-neutral-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Header Hero */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
            <Smartphone className="w-3.5 h-3.5" />
            Universal Mobile Experience
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            Get <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">Techastra</span> Anywhere
          </h1>
          <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
            Access hackathons, live watermarked passes, DevQuests, and offline gate check-ins. Launch directly in your browser or download the native Android app.
          </p>
        </div>

        {/* 2 Main Distribution Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card 1: Web App (PWA) */}
          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 p-8 flex flex-col justify-between hover:border-indigo-500/40 transition-all shadow-sm">
            <div className="space-y-6">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold">
                <Globe className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold">Instant Web App</h3>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                    Zero Install Required
                  </span>
                </div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Runs instantly on any device: iOS Safari, Android Chrome, Windows, Mac, and Linux. Supports offline caching and home screen launcher.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Full offline venue pass support</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Instant updates without app store delays</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Ticking seconds live watermark security</span>
                </div>
              </div>
            </div>

            <div className="pt-8 space-y-3">
              <button
                onClick={handleInstallPWA}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-all shadow-lg shadow-indigo-600/20 cursor-pointer"
              >
                <Layers className="w-5 h-5" />
                {isInstalled ? 'App Installed (Launch Standalone)' : 'Launch & Install Web App'}
              </button>
              <p className="text-xs text-center text-neutral-500">
                PWA Certified · Works in Safari, Chrome, Edge & Firefox
              </p>
            </div>
          </div>

          {/* Card 2: Native Android APK */}
          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 p-8 flex flex-col justify-between hover:border-purple-500/40 transition-all shadow-sm">
            <div className="space-y-6">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center font-bold">
                <Smartphone className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold">Android APK</h3>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 font-medium">
                    v1.0.0 Stable
                  </span>
                </div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Compiled native Android package with hardware-accelerated camera QR scanner, haptic feedback, and local SQLite/IndexedDB pass storage.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-300">
                  <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>Hardware camera barcode/QR gate scanner</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-300">
                  <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>Automated GitHub CI/CD build artifact</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-300">
                  <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>Compatible with Android 8.0 (Oreo) and newer</span>
                </div>
              </div>
            </div>

            <div className="pt-8 space-y-3">
              <a
                href={apkDownloadUrl}
                download="techastra-v1.0.0-debug.apk"
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold transition-all shadow-lg shadow-purple-600/20"
              >
                <Download className="w-5 h-5" />
                Download Android APK (Direct)
              </a>
              <div className="flex items-center justify-between text-xs text-neutral-500 px-1">
                <span>Direct GitHub Asset</span>
                <span>SHA-256 Verified</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scan to Install on Phone Banner */}
        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-gradient-to-r from-neutral-900 to-neutral-950 text-white p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
              <Zap className="w-3.5 h-3.5" />
              Instant Mobile Sync
            </div>
            <h4 className="text-xl font-bold">Scan with your phone to open instantly</h4>
            <p className="text-sm text-neutral-400 max-w-lg">
              Point your phone's camera at the QR code to open the web app or download the APK directly on your mobile device.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="p-3 bg-white rounded-xl shadow-md text-neutral-900 flex items-center justify-center">
              <QrCode className="w-20 h-20" />
            </div>
            <button
              onClick={handleCopyLink}
              className="px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-medium border border-neutral-700 transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              {copiedLink ? 'Link Copied!' : 'Copy Mobile Link'}
            </button>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
          <div className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/40 space-y-2">
            <ShieldCheck className="w-6 h-6 text-indigo-500" />
            <h5 className="font-semibold text-base">Anti-Screenshot Watermarking</h5>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Every ticket pass renders an animated ticking seconds IST watermark preventing fake or screenshotted passes.
            </p>
          </div>
          <div className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/40 space-y-2">
            <Zap className="w-6 h-6 text-amber-500" />
            <h5 className="font-semibold text-base">Atomic Gate Check-in</h5>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Fast batch scanning with instant duplicate detection so attendees are never checked in twice.
            </p>
          </div>
          <div className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/40 space-y-2">
            <ArrowRight className="w-6 h-6 text-pink-500" />
            <h5 className="font-semibold text-base">DevQuests & XP Stream</h5>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Complete bounties, solve challenges, and climb the builder leaderboard directly from your pocket.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}