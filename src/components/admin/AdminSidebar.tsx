import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  LayoutDashboard, 
  FileText, 
  HelpCircle, 
  Award, 
  Bell,
  Settings, 
  LogOut, 
  GraduationCap,
  ExternalLink,
  Database
} from 'lucide-react';
import { SupabaseSetupModal } from './SupabaseSetupModal';

export const AdminSidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/admin');
  };

  const navItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Tests Management', path: '/admin/tests', icon: FileText },
    { label: 'Questions Pool', path: '/admin/questions', icon: HelpCircle },
    { label: 'Student Results', path: '/admin/results', icon: Award },
    { label: 'Notice Board', path: '/admin/notices', icon: Bell },
    { label: 'Portal Settings', path: '/admin/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col justify-between shrink-0 border-r border-slate-800 min-h-screen">
      
      <div>
        {/* Logo Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <Link to="/admin/dashboard" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-600 flex items-center justify-center text-white shadow">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-sm text-white block leading-tight">Admin Portal</span>
              <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider">Management Control</span>
            </div>
          </Link>
        </div>

        {/* Links */}
        <nav className="p-4 space-y-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer controls */}
      <div className="p-4 border-t border-slate-800 space-y-2">
        <button
          onClick={() => setIsSupabaseModalOpen(true)}
          className="w-full flex items-center justify-between px-3.5 py-2 text-xs font-bold bg-slate-800/80 hover:bg-slate-800 text-emerald-400 hover:text-emerald-300 rounded-xl border border-slate-700/60 transition"
        >
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-400" />
            <span>Supabase Database</span>
          </div>
          <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-mono">
            SQL
          </span>
        </button>

        <Link
          to="/"
          target="_blank"
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
        >
          <ExternalLink className="w-4 h-4 text-blue-400" />
          <span>View Live Student Portal</span>
        </Link>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-rose-400 hover:bg-rose-950/50 rounded-xl transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout Admin Session</span>
        </button>
      </div>

      <SupabaseSetupModal 
        isOpen={isSupabaseModalOpen} 
        onClose={() => setIsSupabaseModalOpen(false)} 
      />
    </aside>
  );
};
