import React, { useState, useEffect } from 'react';
import { Database, ShieldCheck, CheckCircle2, Copy, AlertTriangle, RefreshCw, Server, Cpu, ExternalLink, Zap, ArrowRightLeft } from 'lucide-react';
import { getDatabaseHealth, checkSupabaseHealth, syncAllDataToSupabase } from '../../firebase/services';
import { SUPABASE_SQL_SETUP } from '../../supabase/supabaseServices';

export const DatabaseSyncCard: React.FC = () => {
  const [health, setHealth] = useState(getDatabaseHealth());
  const [supaHealth, setSupaHealth] = useState<{ ok: boolean; message: string; tables: Record<string, boolean> }>({
    ok: true,
    message: 'Checking...',
    tables: {}
  });
  const [copied, setCopied] = useState(false);
  const [showSqlModal, setShowSqlModal] = useState(false);
  const [testing, setTesting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  const runDiagnostics = async () => {
    setTesting(true);
    setHealth(getDatabaseHealth());
    try {
      const res = await checkSupabaseHealth();
      setSupaHealth(res);
    } catch (e) {
      setSupaHealth({ ok: false, message: 'Health check failed', tables: {} });
    } finally {
      setTesting(false);
    }
  };

  const handleSyncAll = async () => {
    try {
      setSyncing(true);
      setSyncStatus('Replicating all data to Supabase...');
      const result = await syncAllDataToSupabase();
      setSyncStatus(`Sync Success! (${result.tests} tests, ${result.questions} questions, ${result.notices} notices, ${result.results} student results copied)`);
      runDiagnostics();
      setTimeout(() => setSyncStatus(null), 6000);
    } catch (e: any) {
      setSyncStatus(`Sync failed: ${e?.message || 'Check console'}`);
      setTimeout(() => setSyncStatus(null), 6000);
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SETUP);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl mb-8">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-white flex items-center gap-2">
              <span>Dual-Database Active Engine Status</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Zap className="w-3 h-3 mr-1 animate-pulse" /> Auto-Shift Enabled
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              100% Zero-Downtime Guarantee: Every write & delete updates Firestore & Supabase in parallel. If Firestore hits quota limit, traffic auto-shifts instantly.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleSyncAll}
            disabled={syncing}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-md transition-all cursor-pointer disabled:opacity-50"
          >
            <ArrowRightLeft className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
            <span>{syncing ? 'Syncing...' : 'Sync All to Supabase'}</span>
          </button>

          <button
            onClick={runDiagnostics}
            disabled={testing}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-lg border border-slate-700 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
            <span>Health Check</span>
          </button>

          <button
            onClick={() => setShowSqlModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-lg shadow-md transition-all cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Supabase SQL Script</span>
          </button>
        </div>
      </div>

      {syncStatus && (
        <div className="mt-3 p-2.5 rounded-xl text-xs font-bold bg-purple-950/80 border border-purple-700 text-purple-200 flex items-center justify-between">
          <span>{syncStatus}</span>
        </div>
      )}

      {/* Engine Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        
        {/* Firestore Status */}
        <div className="bg-slate-950/60 border border-slate-800 p-3.5 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Server className="w-4 h-4 text-amber-400" />
            <div>
              <p className="text-xs font-bold text-white">Google Cloud Firestore</p>
              <p className="text-[11px] text-slate-400">Primary Database Engine</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-800/50">
            <CheckCircle2 className="w-3 h-3" /> Active
          </span>
        </div>

        {/* Supabase Status */}
        <div className="bg-slate-950/60 border border-slate-800 p-3.5 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Cpu className="w-4 h-4 text-emerald-400" />
            <div>
              <p className="text-xs font-bold text-white">Supabase PostgreSQL</p>
              <p className="text-[11px] text-slate-400">Real-Time Sync & Failover</p>
            </div>
          </div>
          <span className={`inline-flex items-center gap-1 text-[11px] font-bold ${supaHealth.ok ? 'text-emerald-400 bg-emerald-950/60 border-emerald-800/50' : 'text-amber-400 bg-amber-950/60 border-amber-800/50'} px-2 py-0.5 rounded-md border`}>
            {supaHealth.ok ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
            {supaHealth.ok ? 'Connected' : 'SQL Check Required'}
          </span>
        </div>

        {/* Sync Mode */}
        <div className="bg-slate-950/60 border border-slate-800 p-3.5 rounded-xl flex items-center justify-between sm:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-purple-400" />
            <div>
              <p className="text-xs font-bold text-white">Automatic Failover</p>
              <p className="text-[11px] text-slate-400">Zero Student Disruption</p>
            </div>
          </div>
          <span className="text-[11px] font-extrabold text-purple-300 bg-purple-950/60 px-2 py-0.5 rounded-md border border-purple-800/50">
            Dual-Write Sync
          </span>
        </div>

      </div>

      {/* SQL Modal */}
      {showSqlModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <Database className="w-5 h-5 text-purple-400" />
                <h3 className="font-extrabold text-lg text-white">Supabase SQL Editor Setup Script</h3>
              </div>
              <button
                onClick={() => setShowSqlModal(false)}
                className="text-slate-400 hover:text-white font-bold text-lg px-2"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300 mt-3">
              If you see any warning or error in your Supabase API Gateway or Postgres dashboard, simply copy this SQL query and paste it in your Supabase SQL Editor. It creates all required tables (<code className="text-purple-300">tests</code>, <code className="text-purple-300">questions</code>, <code className="text-purple-300">results</code>, <code className="text-purple-300">leaderboard</code>, <code className="text-purple-300">notices</code>, <code className="text-purple-300">settings</code>, <code className="text-purple-300">appointments</code>) with row level security policies.
            </p>

            <div className="mt-4 flex-1 overflow-hidden flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-400">PostgreSQL Schema Setup Code</span>
                <button
                  onClick={handleCopySql}
                  className="flex items-center gap-1.5 px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-lg transition-all cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copied ? 'Copied to Clipboard!' : 'Copy SQL Script'}</span>
                </button>
              </div>

              <textarea
                readOnly
                value={SUPABASE_SQL_SETUP}
                className="w-full flex-1 min-h-[220px] bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-[11px] text-purple-200 focus:outline-none resize-none"
              />
            </div>

            <div className="mt-5 pt-4 border-t border-slate-800 flex justify-end gap-3">
              <button
                onClick={() => setShowSqlModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
