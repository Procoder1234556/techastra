import { useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';
import { api } from '../../lib/api';

export function OrganizerCheckIn() {
  const [stats, setStats] = useState<{ total: number } | null>(null);
  const [eventSlug, setEventSlug] = useState('');
  const [scanMsg, setScanMsg] = useState('');
  const [checkedList, setCheckedList] = useState<string[]>([]);
  const [scanning, setScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<number | null>(null);

  const refreshStats = () => {
    api.get('/api/v1/checkin/stats').then((res) => setStats(res.data));
    api.get<{ checkedIn: string[] }>('/api/v1/checkin/all').then((res) => setCheckedList(res.data.checkedIn || []));
  };

  useEffect(() => {
    refreshStats();
    return () => stopCamera();
  }, []);

  const stopCamera = () => {
    if (intervalRef.current) window.clearInterval(intervalRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setScanning(false);
  };

  const startCamera = async () => {
    if (!eventSlug.trim()) {
      setScanMsg('Enter event slug (hackathon URL name) first.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setScanning(true);
      intervalRef.current = window.setInterval(() => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) return;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(image.data, image.width, image.height);
        if (code?.data) handlePayload(code.data);
      }, 300);
    } catch {
      setScanMsg('Camera access denied or unavailable.');
    }
  };

  const handlePayload = async (raw: string) => {
    let userId = raw;
    try {
      const parsed = JSON.parse(raw);
      userId = parsed.userId || parsed.id || raw;
    } catch {
      /* plain user id */
    }
    try {
      await api.post(`/api/v1/checkin/scan/${encodeURIComponent(eventSlug)}`, { userId });
      setScanMsg(`Checked in: ${userId}`);
      refreshStats();
      stopCamera();
    } catch {
      setScanMsg('Check-in failed.');
    }
  };

  const manualCheckIn = async () => {
    const userId = window.prompt('Participant user ID');
    if (!userId || !eventSlug.trim()) return;
    await api.patch(`/api/v1/checkin/${encodeURIComponent(eventSlug)}/manual`, { userId, checkedIn: true });
    setScanMsg(`Checked in: ${userId}`);
    refreshStats();
  };

  return (
    <div className="max-w-lg space-y-4">
      <h2 className="text-lg font-semibold">QR check-in</h2>
      <p className="text-sm text-neutral-500">
        Checked in (session): <strong>{stats?.total ?? 0}</strong>
      </p>
      <input
        className="w-full rounded-lg border px-3 py-2 text-sm dark:border-white/20"
        placeholder="Event slug (e.g. demo-hackathon-2025)"
        value={eventSlug}
        onChange={(e) => setEventSlug(e.target.value)}
      />
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={scanning ? stopCamera : startCamera}
          className="rounded-full bg-gray-900 px-4 py-2 text-sm text-white dark:bg-white dark:text-gray-900"
        >
          {scanning ? 'Stop camera' : 'Scan QR'}
        </button>
        <button type="button" onClick={manualCheckIn} className="rounded-full border px-4 py-2 text-sm dark:border-white/20">
          Manual ID
        </button>
      </div>
      {scanning && (
        <div className="overflow-hidden rounded-xl border dark:border-white/10">
          <video ref={videoRef} className="w-full" muted playsInline />
          <canvas ref={canvasRef} className="hidden" />
        </div>
      )}
      {scanMsg && <p className="text-sm text-neutral-600 dark:text-neutral-400">{scanMsg}</p>}
      {checkedList.length > 0 && (
        <div className="text-xs text-neutral-500">
          <p className="font-medium text-neutral-700 dark:text-neutral-300">Recent check-ins</p>
          <ul className="mt-1 max-h-32 overflow-y-auto space-y-0.5">
            {checkedList.slice(-12).map((k) => (
              <li key={k}>{k}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
