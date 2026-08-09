import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useSettings } from '../../contexts/SettingsContext';

export const GoogleAdSenseManager: React.FC = () => {
  const { settings } = useSettings();
  const location = useLocation();

  useEffect(() => {
    // AdSense policy: Do not run ads during active test taking
    if (!settings.adsEnabled || !settings.adsenseClientId || location.pathname.startsWith('/exam/')) {
      const existingScript = document.getElementById('google-adsense-script');
      if (existingScript) existingScript.remove();
      return;
    }

    const SCRIPT_ID = 'google-adsense-script';
    let script = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.id = SCRIPT_ID;
      script.async = true;
      script.crossOrigin = 'anonymous';
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${settings.adsenseClientId.trim()}`;
      document.head.appendChild(script);
    }
  }, [settings.adsenseClientId, settings.adsEnabled, location.pathname]);

  return null;
};

export const InPagePushAdManager: React.FC = () => {
  const location = useLocation();
  const { settings } = useSettings();

  useEffect(() => {
    const SCRIPT_ID = 'mrmnd-inpage-push-script';
    const SCRIPT_URL = 'https://ss.mrmnd.com/static/3122bc8f-82a1-44a5-8aa7-ab2fe5d94fa5.js';

    // Show push ads strictly ONLY on the home page ('/') and when adsEnabled is active
    const isHomePage = location.pathname === '/';
    const shouldShowAds = isHomePage && settings.adsEnabled;

    const cleanupPushAds = () => {
      // 1. Remove script tag if dynamically loaded
      const scriptEl = document.getElementById(SCRIPT_ID);
      if (scriptEl) {
        scriptEl.remove();
      }

      // 2. Remove any injected push popups / overlays / iframes created by Mondiad
      const selectors = [
        'script[src*="mrmnd.com/static"]',
        'iframe[src*="mrmnd"]',
        '[id*="mnd"]',
        '[class*="mnd"]'
      ];

      selectors.forEach((selector) => {
        try {
          const elements = document.querySelectorAll(selector);
          elements.forEach((el) => {
            if (el.id !== SCRIPT_ID && el.id !== 'root' && !el.closest('#root')) {
              el.remove();
            }
          });
        } catch (e) {
          // ignore
        }
      });
    };

    if (shouldShowAds) {
      let script = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
      if (!script) {
        script = document.createElement('script');
        script.id = SCRIPT_ID;
        script.async = true;
        script.src = SCRIPT_URL;
        document.head.appendChild(script);
      }
    } else {
      cleanupPushAds();
    }

    return () => {
      if (location.pathname !== '/') {
        cleanupPushAds();
      }
    };
  }, [location.pathname, settings.adsEnabled]);

  return null;
};

export const VideoSliderAdManager: React.FC = () => {
  const { settings } = useSettings();
  const location = useLocation();

  useEffect(() => {
    // Only load Video Slider Ad on Home Page when ads are enabled
    if (!settings.adsEnabled || location.pathname !== '/') return;

    const SCRIPT_ID = 'prizefamily-video-slider-script';
    let script = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;

    if (!script) {
      script = document.createElement('script');
      script.id = SCRIPT_ID;
      script.async = true;
      script.referrerPolicy = 'no-referrer-when-downgrade';
      script.src = 'https://prizefamily.com/bCXJV/snd.GYlZ0AYqWgcx/Ueqmc9/uJZOUwlCk/PJTic-yGNrzxQCzYOAD/kWtINBzjIj3BNuDFMO5YMuwt';
      document.body.appendChild(script);
    }

    return () => {
      if (location.pathname !== '/') {
        const existingScript = document.getElementById(SCRIPT_ID);
        if (existingScript) {
          existingScript.remove();
        }
      }
    };
  }, [location.pathname, settings.adsEnabled]);

  return null;
};

export const HomeBannerAd: React.FC = () => {
  const { settings } = useSettings();
  const location = useLocation();

  useEffect(() => {
    // Only load banner on Home Page when ads are enabled
    if (!settings.adsEnabled || location.pathname !== '/') return;

    // Small delay ensures React has mounted <div id="ad-banner-300x250-container"> in the DOM
    const timer = setTimeout(() => {
      // 1. Load Mondiad Banner script
      const SCRIPT_ID = 'mrmnd-banner-active-script';
      const existingScript = document.getElementById(SCRIPT_ID);
      if (existingScript) {
        existingScript.remove();
      }

      const script = document.createElement('script');
      script.id = SCRIPT_ID;
      script.async = true;
      script.src = `https://ss.mrmnd.com/banner.js?cb=${Date.now()}`;
      document.body.appendChild(script);

      // 2. Load PrizeFamily Ad script inside the 300x250 border box container
      const PF_SCRIPT_ID = 'prizefamily-banner-ad-script';
      const existingPf = document.getElementById(PF_SCRIPT_ID);
      if (existingPf) {
        existingPf.remove();
      }

      const container = document.getElementById('ad-banner-300x250-container');
      if (container) {
        const pfScript = document.createElement('script');
        pfScript.id = PF_SCRIPT_ID;
        pfScript.async = true;
        pfScript.referrerPolicy = 'no-referrer-when-downgrade';
        pfScript.src = '//prizefamily.com/bqX.VbskdqGklO0/YDWwc_/UeNmE9DuGZfUelWktPNTjc/yONTzfEK5jN/jIkutfNlzSI/3TM/TBk/3-M-we';
        container.appendChild(pfScript);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [location.pathname, settings.adsEnabled]);

  if (!settings.adsEnabled || location.pathname !== '/') return null;

  return (
    <div id="home-banner-ad" className="w-full my-8 flex flex-col justify-center items-center px-4">
      {/* 300x250 Banner Ad Container */}
      <div className="flex flex-col items-center justify-center p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md transition-all overflow-hidden max-w-full">
        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold tracking-wider uppercase mb-1.5">
          ADVERTISEMENT (300x250)
        </span>
        <div 
          id="ad-banner-300x250-container"
          className="w-[300px] h-[250px] min-w-[300px] min-h-[250px] max-w-full overflow-hidden flex flex-col justify-center items-center bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-dashed border-slate-200/80 dark:border-slate-800 relative"
        >
          <div data-mndbanid="559027ca-e9af-4d6f-99f9-256d9688d29f"></div>
        </div>
      </div>
    </div>
  );
};

export const HomeInlineAd: React.FC = () => {
  const { settings } = useSettings();
  if (!settings.adsEnabled) return null;

  return (
    <div id="home-inline-ad" className="w-full max-w-7xl mx-auto my-8 px-4">
      <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-100/70 dark:bg-slate-800/50 p-4 text-center">
        <div className="flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1">
          <span className="uppercase font-semibold tracking-wider px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 rounded">Advertisement</span>
          <span>•</span>
          <span>Google AdSense / Monetag Partner Ad</span>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 py-2">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
            🎯 Looking for Official Previous Year Question Papers with Detailed Solutions?
          </p>
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-4 py-2 rounded-lg transition-colors shadow-sm">
            Download PDF Bundles
          </button>
        </div>
      </div>
    </div>
  );
};

export const FooterAd: React.FC = () => {
  const { settings } = useSettings();
  if (!settings.adsEnabled) return null;

  return (
    <div id="footer-ad" className="w-full max-w-7xl mx-auto my-6 px-4">
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs border border-slate-800">
        <div className="flex items-center gap-2">
          <span className="bg-amber-500 text-slate-950 font-extrabold px-2 py-0.5 rounded text-[10px] uppercase">AD</span>
          <span className="text-slate-300">Join 50,000+ Aspirants on the Official Telegram Exam Alerts Channel</span>
        </div>
        <a
          href="https://t.me"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-3 py-1.5 rounded-md transition-colors shrink-0"
        >
          Join Telegram Channel
        </a>
      </div>
    </div>
  );
};
