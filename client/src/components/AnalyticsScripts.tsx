import { useEffect } from 'react';

const gaId = import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined;
const adsClient = import.meta.env.VITE_ADSENSE_CLIENT as string | undefined;

export function AnalyticsScripts() {
  useEffect(() => {
    if (gaId) {
      const gtagScript = document.createElement('script');
      gtagScript.async = true;
      gtagScript.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
      document.head.appendChild(gtagScript);
      window.dataLayer = window.dataLayer || [];
      function gtag(...args: unknown[]) {
        window.dataLayer!.push(args);
      }
      gtag('js', new Date());
      gtag('config', gaId);
    }
    if (adsClient) {
      const ad = document.createElement('script');
      ad.async = true;
      ad.crossOrigin = 'anonymous';
      ad.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsClient}`;
      document.head.appendChild(ad);
    }
  }, []);

  return null;
}

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}
