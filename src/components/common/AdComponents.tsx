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

// ---------------------------------------------------------
// TOP ADS: VIRALNEX AD NETWORK (2 ADS - 300x250)
// ---------------------------------------------------------

export const ViralnexTopAd1: React.FC = () => {
  const { settings } = useSettings();
  const location = useLocation();
  const iframeRef = React.useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!settings.adsEnabled || location.pathname !== '/') return;
    const iframe = iframeRef.current;
    if (!iframe) return;

    try {
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!doc) return;

      doc.open();
      doc.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body {
      width: 300px;
      height: 250px;
      overflow: hidden;
      background: transparent;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  </style>
</head>
<body>
  <script src="https://viralnex.com/serve_ad.php?id=317aed465e492c14"></script>
  <noscript><a href="https://viralnex.com/serve_nojs.php?id=317aed465e492c14" target="_blank" rel="noopener noreferrer"><img src="https://viralnex.com/serve_nojs_img.php?id=317aed465e492c14" alt="ad"/></a></noscript>
</body>
</html>`);
      doc.close();
    } catch (e) {
      console.warn('Viralnex Ad 1 render notice:', e);
    }
  }, [settings.adsEnabled, location.pathname]);

  if (!settings.adsEnabled || location.pathname !== '/') return null;

  return (
    <div className="flex flex-col items-center justify-center p-3 rounded-2xl border-2 border-emerald-500/40 dark:border-emerald-500/30 bg-white dark:bg-slate-900 shadow-lg hover:shadow-xl transition-all overflow-hidden max-w-full">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[10px] text-emerald-950 dark:text-emerald-300 font-black tracking-wider uppercase bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/30">
          FEATURED SPONSOR #1 / विज्ञापन (TOP)
        </span>
        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">(300x250)</span>
      </div>
      <div 
        className="w-[300px] h-[250px] min-w-[300px] min-h-[250px] max-w-full overflow-hidden flex flex-col justify-center items-center bg-slate-50 dark:bg-slate-950/80 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 relative"
      >
        <iframe
          ref={iframeRef}
          title="Viralnex Top Ad 1"
          width="300"
          height="250"
          scrolling="no"
          frameBorder="0"
          className="w-[300px] h-[250px] border-0 overflow-hidden"
          sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation"
        />
      </div>
    </div>
  );
};

export const ViralnexTopAd2: React.FC = () => {
  const { settings } = useSettings();
  const location = useLocation();
  const iframeRef = React.useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!settings.adsEnabled || location.pathname !== '/') return;
    const iframe = iframeRef.current;
    if (!iframe) return;

    try {
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!doc) return;

      doc.open();
      doc.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body {
      width: 300px;
      height: 250px;
      overflow: hidden;
      background: transparent;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  </style>
</head>
<body>
  <script src="https://viralnex.com/serve_ad.php?id=317aed465e492c14"></script>
  <noscript><a href="https://viralnex.com/serve_nojs.php?id=317aed465e492c14" target="_blank" rel="noopener noreferrer"><img src="https://viralnex.com/serve_nojs_img.php?id=317aed465e492c14" alt="ad"/></a></noscript>
</body>
</html>`);
      doc.close();
    } catch (e) {
      console.warn('Viralnex Ad 2 render notice:', e);
    }
  }, [settings.adsEnabled, location.pathname]);

  if (!settings.adsEnabled || location.pathname !== '/') return null;

  return (
    <div className="flex flex-col items-center justify-center p-3 rounded-2xl border-2 border-teal-500/40 dark:border-teal-500/30 bg-white dark:bg-slate-900 shadow-lg hover:shadow-xl transition-all overflow-hidden max-w-full">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[10px] text-teal-950 dark:text-teal-300 font-black tracking-wider uppercase bg-teal-500/20 px-2 py-0.5 rounded border border-teal-500/30">
          FEATURED SPONSOR #2 / विज्ञापन (TOP)
        </span>
        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">(300x250)</span>
      </div>
      <div 
        className="w-[300px] h-[250px] min-w-[300px] min-h-[250px] max-w-full overflow-hidden flex flex-col justify-center items-center bg-slate-50 dark:bg-slate-950/80 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 relative"
      >
        <iframe
          ref={iframeRef}
          title="Viralnex Top Ad 2"
          width="300"
          height="250"
          scrolling="no"
          frameBorder="0"
          className="w-[300px] h-[250px] border-0 overflow-hidden"
          sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation"
        />
      </div>
    </div>
  );
};

// ---------------------------------------------------------
// BOTTOM ADS: HIGH PERFORMANCE FORMAT AD NETWORK (2 ADS - 300x250)
// ---------------------------------------------------------

export const HighPerfBottomAd1: React.FC = () => {
  const { settings } = useSettings();
  const location = useLocation();
  const iframeRef = React.useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!settings.adsEnabled || location.pathname !== '/') return;
    const iframe = iframeRef.current;
    if (!iframe) return;

    try {
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!doc) return;

      doc.open();
      doc.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body {
      width: 300px;
      height: 250px;
      overflow: hidden;
      background: transparent;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  </style>
</head>
<body>
  <script type="text/javascript">
    atOptions = {
      'key' : '1d9e58131cab71fb1fb3ffa53eec18e2',
      'format' : 'iframe',
      'height' : 250,
      'width' : 300,
      'params' : {}
    };
  </script>
  <script type="text/javascript" src="https://www.highperformanceformat.com/1d9e58131cab71fb1fb3ffa53eec18e2/invoke.js"></script>
</body>
</html>`);
      doc.close();
    } catch (e) {
      console.warn('HighPerf Ad 1 render note:', e);
    }
  }, [settings.adsEnabled, location.pathname]);

  if (!settings.adsEnabled || location.pathname !== '/') return null;

  return (
    <div className="flex flex-col items-center justify-center p-3 rounded-2xl border-2 border-amber-500/40 dark:border-amber-500/30 bg-white dark:bg-slate-900 shadow-lg hover:shadow-xl transition-all overflow-hidden max-w-full">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[10px] text-amber-950 dark:text-amber-300 font-black tracking-wider uppercase bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30">
          PREMIUM SPONSOR #1 / विज्ञापन (BOTTOM)
        </span>
        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">(300x250)</span>
      </div>
      <div 
        className="w-[300px] h-[250px] min-w-[300px] min-h-[250px] max-w-full overflow-hidden flex flex-col justify-center items-center bg-slate-50 dark:bg-slate-950/80 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 relative"
      >
        <iframe
          ref={iframeRef}
          title="HighPerf Bottom Ad 1"
          width="300"
          height="250"
          scrolling="no"
          frameBorder="0"
          className="w-[300px] h-[250px] border-0 overflow-hidden"
          sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation"
        />
      </div>
    </div>
  );
};

export const HighPerfBottomAd2: React.FC = () => {
  const { settings } = useSettings();
  const location = useLocation();
  const iframeRef = React.useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!settings.adsEnabled || location.pathname !== '/') return;
    const iframe = iframeRef.current;
    if (!iframe) return;

    try {
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!doc) return;

      doc.open();
      doc.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body {
      width: 300px;
      height: 250px;
      overflow: hidden;
      background: transparent;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  </style>
</head>
<body>
  <script type="text/javascript">
    atOptions = {
      'key' : '1d9e58131cab71fb1fb3ffa53eec18e2',
      'format' : 'iframe',
      'height' : 250,
      'width' : 300,
      'params' : {}
    };
  </script>
  <script type="text/javascript" src="https://www.highperformanceformat.com/1d9e58131cab71fb1fb3ffa53eec18e2/invoke.js"></script>
</body>
</html>`);
      doc.close();
    } catch (e) {
      console.warn('HighPerf Ad 2 render note:', e);
    }
  }, [settings.adsEnabled, location.pathname]);

  if (!settings.adsEnabled || location.pathname !== '/') return null;

  return (
    <div className="flex flex-col items-center justify-center p-3 rounded-2xl border-2 border-indigo-500/40 dark:border-indigo-500/30 bg-white dark:bg-slate-900 shadow-lg hover:shadow-xl transition-all overflow-hidden max-w-full">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[10px] text-indigo-900 dark:text-indigo-300 font-black tracking-wider uppercase bg-indigo-500/20 px-2 py-0.5 rounded border border-indigo-500/30">
          PREMIUM SPONSOR #2 / विज्ञापन (BOTTOM)
        </span>
        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">(300x250)</span>
      </div>
      <div 
        className="w-[300px] h-[250px] min-w-[300px] min-h-[250px] max-w-full overflow-hidden flex flex-col justify-center items-center bg-slate-50 dark:bg-slate-950/80 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 relative"
      >
        <iframe
          ref={iframeRef}
          title="HighPerf Bottom Ad 2"
          width="300"
          height="250"
          scrolling="no"
          frameBorder="0"
          className="w-[300px] h-[250px] border-0 overflow-hidden"
          sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation"
        />
      </div>
    </div>
  );
};

// Aliases for backward compatibility
export const Banner300x250Ad1 = HighPerfBottomAd1;
export const Banner300x250Ad2 = HighPerfBottomAd2;
export const Viralnex300x250Ad = ViralnexTopAd1;
export const Viralnex300x250Ad2 = ViralnexTopAd2;

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

// TOP ADS CONTAINER (2 ADS - Viralnex Network)
export const TopHomeBannerAds: React.FC = () => {
  const { settings } = useSettings();
  const location = useLocation();

  if (!settings.adsEnabled || location.pathname !== '/') return null;

  return (
    <div id="home-top-advertisements" className="w-full my-6 px-4 flex flex-col items-center">
      <div className="text-center mb-3">
        <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-200/80 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 px-3.5 py-1 rounded-full">
          Featured Sponsor Advertisements (Top)
        </span>
      </div>
      <div className="flex flex-col lg:flex-row items-center justify-center gap-6 w-full max-w-4xl">
        <ViralnexTopAd1 />
        <ViralnexTopAd2 />
      </div>
    </div>
  );
};

// BOTTOM ADS CONTAINER (2 ADS - HighPerformanceFormat Network)
export const BottomHomeBannerAds: React.FC = () => {
  const { settings } = useSettings();
  const location = useLocation();

  if (!settings.adsEnabled || location.pathname !== '/') return null;

  return (
    <div id="home-bottom-advertisements" className="w-full my-8 px-4 flex flex-col items-center">
      <ViralnexPopAdManager />
      <div className="text-center mb-4">
        <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-200/80 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 px-3.5 py-1 rounded-full">
          Official Sponsor Advertisements (Bottom)
        </span>
      </div>
      <div className="flex flex-col lg:flex-row items-center justify-center gap-6 w-full max-w-4xl">
        <HighPerfBottomAd1 />
        <HighPerfBottomAd2 />
      </div>
    </div>
  );
};

// Default HomeBannerAd renders bottom ads
export const HomeBannerAd: React.FC = () => {
  return <BottomHomeBannerAds />;
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
