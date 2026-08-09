import React, { useState, useEffect } from 'react';
import { Cookie, Shield, Check, X } from 'lucide-react';
import { Link } from 'react-router-dom';

export const CookieConsentBanner: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent_status');
    if (!consent) {
      // Delay display slightly so it doesn't jump instantly on page load
      const timer = setTimeout(() => setVisible(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie_consent_status', 'accepted');
    setVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('cookie_consent_status', 'declined');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="bg-slate-900/95 text-slate-100 backdrop-blur-md p-5 rounded-2xl border border-slate-800 shadow-2xl space-y-3">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-600/20 text-blue-400 rounded-xl shrink-0 mt-0.5">
            <Cookie className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>Cookie & Ad Preference Notice</span>
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              We use cookies to analyze portal traffic, store mock test progress, and display relevant educational ads via Google AdSense. Learn more in our{' '}
              <Link to="/privacy-policy" className="text-blue-400 underline font-semibold hover:text-blue-300">
                Privacy Policy
              </Link>.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={handleAccept}
            className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-2 px-3 rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-sm"
          >
            <Check className="w-3.5 h-3.5" /> Accept All
          </button>
          <button
            onClick={handleDecline}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs py-2 px-3 rounded-xl transition-colors flex items-center justify-center gap-1 border border-slate-700"
          >
            <X className="w-3.5 h-3.5" /> Necessary Only
          </button>
        </div>
      </div>
    </div>
  );
};
