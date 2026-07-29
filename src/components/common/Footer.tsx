import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSettings } from '../../contexts/SettingsContext';
import { FooterAd } from './AdComponents';
import { GraduationCap, Mail, Phone, MapPin, Facebook, Send, Youtube, Twitter } from 'lucide-react';

export const Footer: React.FC = () => {
  const { settings } = useSettings();
  const location = useLocation();

  if (location.pathname.startsWith('/exam/')) {
    return null;
  }

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 transition-colors pt-10 pb-8 mt-16">
      
      {/* Footer Ad Component */}
      <FooterAd />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          
          {/* Brand Col */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow">
                <GraduationCap className="w-6 h-6" />
              </div>
              <span className="text-xl font-black text-white tracking-tight">
                {settings.websiteName || 'Smart Exam Portal'}
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              India's leading practice portal for SSC, Railway, Bank, UPSC, State PCS, and Teaching competitive examinations.
            </p>
            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-2">
              <a href={settings.socialLinks?.telegram || '#'} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-blue-600 flex items-center justify-center text-slate-300 hover:text-white transition-colors">
                <Send className="w-4 h-4" />
              </a>
              <a href={settings.socialLinks?.youtube || '#'} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-rose-600 flex items-center justify-center text-slate-300 hover:text-white transition-colors">
                <Youtube className="w-4 h-4" />
              </a>
              <a href={settings.socialLinks?.facebook || '#'} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-blue-700 flex items-center justify-center text-slate-300 hover:text-white transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href={settings.socialLinks?.twitter || '#'} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-sky-500 flex items-center justify-center text-slate-300 hover:text-white transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold text-base mb-4 tracking-wide uppercase text-xs text-blue-400">Quick Navigation</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/" className="hover:text-blue-400 transition-colors">Home & All Mock Tests</Link></li>
              <li><Link to="/leaderboard" className="hover:text-blue-400 transition-colors">All-India Leaderboard</Link></li>
              <li><Link to="/notice" className="hover:text-blue-400 transition-colors">Official Exam Notices</Link></li>
              <li><Link to="/about" className="hover:text-blue-400 transition-colors">About Portal & Mission</Link></li>
              <li><Link to="/contact" className="hover:text-blue-400 transition-colors">Help & Contact Support</Link></li>
              <li><Link to="/admin" className="hover:text-blue-400 transition-colors">Admin Management Panel</Link></li>
            </ul>
          </div>

          {/* Exam Categories */}
          <div>
            <h4 className="text-white font-bold text-base mb-4 tracking-wide uppercase text-xs text-blue-400">Exam Categories</h4>
            <div className="flex flex-wrap gap-1.5">
              {['SSC CGL', 'RRB NTPC', 'SBI PO', 'UPSC CSAT', 'CTET Paper 1', 'State Police', 'Reasoning', 'Mathematics', 'General Science', 'Computer'].map(cat => (
                <span key={cat} className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md text-xs cursor-pointer transition-colors border border-slate-700/50">
                  {cat}
                </span>
              ))}
            </div>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-white font-bold text-base mb-4 tracking-wide uppercase text-xs text-blue-400">Reach Us</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span>{settings.address || 'EduTech Hub, Knowledge Park III, India'}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-blue-400 shrink-0" />
                <span>{settings.contactEmail || 'support@smartexamportal.com'}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-blue-400 shrink-0" />
                <span>{settings.contactPhone || '+91 98765 43210'}</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>{settings.footerText || '© 2026 Smart Exam Portal. All Rights Reserved.'}</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
            <span>•</span>
            <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
            <span>•</span>
            <span className="hover:text-slate-400 cursor-pointer">Disclaimer</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
