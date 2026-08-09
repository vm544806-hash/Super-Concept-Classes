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

export const Viralnex300x250Ad: React.FC = () => {
  const { settings } = useSettings();
  const location = useLocation();

  useEffect(() => {
    if (!settings.adsEnabled || location.pathname !== '/') return;

    const container = document.getElementById('viralnex-300x250-ad-box-1');
    if (!container) return;

    container.innerHTML = '';

    const script = document.createElement('script');
    script.src = 'https://viralnex.com/serve_ad.php?id=23d9640a91284aff';
    script.async = true;

    const noscript = document.createElement('noscript');
    noscript.innerHTML = `<a href="https://viralnex.com/serve_nojs.php?id=23d9640a91284aff" target="_blank" rel="noopener noreferrer"><img src="https://viralnex.com/serve_nojs_img.php?id=23d9640a91284aff" alt="ad"/></a>`;

    container.appendChild(script);
    container.appendChild(noscript);

    return () => {
      if (container) container.innerHTML = '';
    };
  }, [settings.adsEnabled, location.pathname]);

  if (!settings.adsEnabled || location.pathname !== '/') return null;

  return (
    <div className="flex flex-col items-center justify-center p-3 rounded-2xl border-2 border-amber-500/40 dark:border-amber-500/30 bg-white dark:bg-slate-900 shadow-lg hover:shadow-xl transition-all overflow-hidden max-w-full">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[10px] text-slate-900 dark:text-amber-300 font-black tracking-wider uppercase bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30">
          SPONSORED AD #1 / विज्ञापन
        </span>
        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">(300x250)</span>
      </div>
      <div 
        id="viralnex-300x250-ad-box-1"
        className="w-[300px] h-[250px] min-w-[300px] min-h-[250px] max-w-full overflow-hidden flex flex-col justify-center items-center bg-slate-50 dark:bg-slate-950/80 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 relative"
      >
      </div>
    </div>
  );
};

export const Viralnex300x250Ad2: React.FC = () => {
  const { settings } = useSettings();
  const location = useLocation();

  useEffect(() => {
    if (!settings.adsEnabled || location.pathname !== '/') return;

    const container = document.getElementById('viralnex-300x250-ad-box-2');
    if (!container) return;

    container.innerHTML = '';

    const script = document.createElement('script');
    script.src = 'https://viralnex.com/serve_ad.php?id=317aed465e492c14';
    script.async = true;

    const noscript = document.createElement('noscript');
    noscript.innerHTML = `<a href="https://viralnex.com/serve_nojs.php?id=317aed465e492c14" target="_blank" rel="noopener noreferrer"><img src="https://viralnex.com/serve_nojs_img.php?id=317aed465e492c14" alt="ad"/></a>`;

    container.appendChild(script);
    container.appendChild(noscript);

    return () => {
      if (container) container.innerHTML = '';
    };
  }, [settings.adsEnabled, location.pathname]);

  if (!settings.adsEnabled || location.pathname !== '/') return null;

  return (
    <div className="flex flex-col items-center justify-center p-3 rounded-2xl border-2 border-indigo-500/40 dark:border-indigo-500/30 bg-white dark:bg-slate-900 shadow-lg hover:shadow-xl transition-all overflow-hidden max-w-full">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[10px] text-indigo-900 dark:text-indigo-300 font-black tracking-wider uppercase bg-indigo-500/20 px-2 py-0.5 rounded border border-indigo-500/30">
          SPONSORED AD #2 / विज्ञापन
        </span>
        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">(300x250)</span>
      </div>
      <div 
        id="viralnex-300x250-ad-box-2"
        className="w-[300px] h-[250px] min-w-[300px] min-h-[250px] max-w-full overflow-hidden flex flex-col justify-center items-center bg-slate-50 dark:bg-slate-950/80 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 relative"
      >
      </div>
    </div>
  );
};

export const ViralnexPopAdManager: React.FC = () => {
  const { settings } = useSettings();
  const location = useLocation();

  useEffect(() => {
    if (!settings.adsEnabled || location.pathname !== '/') return;

    const SCRIPT_ID = 'viralnex-pop-ad-script';
    let script = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;

    if (!script) {
      script = document.createElement('script');
      script.id = SCRIPT_ID;
      script.src = 'https://viralnex.com/serve_ad.php?id=bdd3f6bf99169b2e';
      script.async = true;
      document.body.appendChild(script);
    }

    return () => {
      if (location.pathname !== '/') {
        const existing = document.getElementById(SCRIPT_ID);
        if (existing) existing.remove();
      }
    };
  }, [settings.adsEnabled, location.pathname]);

  return null;
};

export const HomeBannerAd: React.FC = () => {
  const { settings } = useSettings();
  const location = useLocation();

  if (!settings.adsEnabled || location.pathname !== '/') return null;

  return (
    <div id="home-bottom-advertisements" className="w-full my-8 px-4 flex flex-col items-center">
      <ViralnexPopAdManager />
      <div className="text-center mb-4">
        <span className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1 rounded-full">
          Official Sponsor Advertisements
        </span>
      </div>
      <div className="flex flex-col lg:flex-row items-center justify-center gap-6 w-full max-w-4xl">
        <Viralnex300x250Ad />
        <Viralnex300x250Ad2 />
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
