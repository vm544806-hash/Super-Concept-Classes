import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSettings } from '../../contexts/SettingsContext';
import { AdminSidebar } from '../../components/admin/AdminSidebar';
import { Settings, Save, CheckCircle2, ShieldCheck, ToggleLeft, ToggleRight, Sparkles } from 'lucide-react';

export const AdminSettingsPage: React.FC = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const { settings, updateSettings } = useSettings();

  const [form, setForm] = useState({ ...settings });
  const [savedSuccess, setSavedSuccess] = useState(false);

  React.useEffect(() => {
    setForm({ ...settings });
  }, [settings]);

  if (!isAdmin) {
    navigate('/admin');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSettings(form);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans">
      <AdminSidebar />

      <div className="flex-1 p-6 sm:p-10 overflow-y-auto">
        
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-800">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              Portal Branding & Monetization Settings
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Configure website name, logo text, contact details, social links, and site-wide ad toggle
            </p>
          </div>
        </div>

        {savedSuccess && (
          <div className="mb-6 p-4 bg-emerald-950/80 border border-emerald-800 text-emerald-300 rounded-2xl text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>Settings updated successfully! Changes applied site-wide.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
          
          {/* Monetization / Ad Toggle Box */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Monetization & Ad Banners Toggle</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Enable or disable sponsor banners, AdSense & Monetag inline ads on homepage and non-exam pages.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setForm({ ...form, adsEnabled: !form.adsEnabled })}
                className={`p-1 rounded-2xl transition-colors cursor-pointer ${
                  form.adsEnabled ? 'text-amber-400' : 'text-slate-600'
                }`}
              >
                {form.adsEnabled ? <ToggleRight className="w-10 h-10" /> : <ToggleLeft className="w-10 h-10" />}
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Google AdSense Publisher ID (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. ca-pub-1234567890123456"
                value={form.adsenseClientId || ''}
                onChange={e => setForm({ ...form, adsenseClientId: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm font-mono text-amber-300 focus:ring-2 focus:ring-amber-500 focus:outline-none placeholder:text-slate-600"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                When specified, Google Auto-Ads script tag will automatically be injected for instant AdSense ad serving on non-exam pages.
              </p>
            </div>
          </div>

          {/* Site Identity */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
            <h3 className="font-extrabold text-base text-white border-b border-slate-800 pb-3">
              Site Identity & Branding
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Website Name</label>
                <input
                  type="text"
                  value={form.websiteName || ''}
                  onChange={e => setForm({ ...form, websiteName: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Logo Badge Text</label>
                <input
                  type="text"
                  value={form.logoText || ''}
                  onChange={e => setForm({ ...form, logoText: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Footer Copyright Text</label>
              <input
                type="text"
                value={form.footerText || ''}
                onChange={e => setForm({ ...form, footerText: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Contact Details */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
            <h3 className="font-extrabold text-base text-white border-b border-slate-800 pb-3">
              Support & Contact Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Contact Email</label>
                <input
                  type="email"
                  value={form.contactEmail || ''}
                  onChange={e => setForm({ ...form, contactEmail: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Contact Phone</label>
                <input
                  type="text"
                  value={form.contactPhone || ''}
                  onChange={e => setForm({ ...form, contactPhone: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Hub Address</label>
              <input
                type="text"
                value={form.address || ''}
                onChange={e => setForm({ ...form, address: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="flex items-center justify-center gap-2 w-full py-3.5 bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-purple-600/25 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Portal Settings</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
