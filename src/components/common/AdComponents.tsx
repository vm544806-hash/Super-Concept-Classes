import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useSettings } from '../../contexts/SettingsContext';
import { ExternalLink, Sparkles } from 'lucide-react';

export const InPagePushAdManager: React.FC = () => {
  const location = useLocation();
  const { settings } = useSettings();

  useEffect(() => {
    const SCRIPT_ID = 'mrmnd-inpage-push-script';
    const SCRIPT_URL = 'https://ss.mrmnd.com/static/3122bc8f-82a1-44a5-8aa7-ab2fe5d94fa5.js';

    // Enable ad strictly on the home page ('/') and when adsEnabled is active
    const isHomePage = location.pathname === '/';
    const shouldShowAds = isHomePage && settings.adsEnabled;

    const cleanupAds = () => {
      // 1. Remove script tag
      const scriptEl = document.getElementById(SCRIPT_ID);
      if (scriptEl) {
        scriptEl.remove();
      }

      // 2. Remove any injected popups/widgets/iframes from MrMnd or in-page push scripts
      const selectors = [
        'script[src*="mrmnd.com"]',
        'iframe[src*="mrmnd.com"]',
        '[id*="mrmnd"]',
        '[class*="mrmnd"]',
        '[id*="mnd-"]',
        '[class*="mnd-"]'
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
          // Ignore invalid selector errors
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
      cleanupAds();
    }

    return () => {
      if (location.pathname !== '/') {
        cleanupAds();
      }
    };
  }, [location.pathname, settings.adsEnabled]);

  return null;
};

export const HomeBannerAd: React.FC = () => {
  const { settings } = useSettings();
  const bannerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!settings.adsEnabled || !bannerRef.current) return;

    const SCRIPT_ID = 'mrmnd-banner-dynamic-script';
    const oldScript = document.getElementById(SCRIPT_ID);
    if (oldScript) {
      oldScript.remove();
    }

    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.async = true;
    script.src = 'https://ss.mrmnd.com/banner.js';
    bannerRef.current.appendChild(script);

    return () => {
      const s = document.getElementById(SCRIPT_ID);
      if (s) s.remove();
    };
  }, [settings.adsEnabled]);

  if (!settings.adsEnabled) return null;

  return (
    <div id="home-banner-ad" className="w-full my-3 flex justify-center">
      <div ref={bannerRef} className="inline-block max-w-full text-center">
        <div data-mndbanid="559027ca-e9af-4d6f-99f9-256d9688d29f"></div>
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
