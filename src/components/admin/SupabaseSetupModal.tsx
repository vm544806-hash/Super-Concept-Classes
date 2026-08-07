import React, { useState } from 'react';
import { Database, CheckCircle2, Copy, AlertCircle, RefreshCw, X, ShieldCheck } from 'lucide-react';
import { isSupabaseConfigured, SUPABASE_SQL_SETUP, supabase } from '../../supabase/supabaseServices';

export const SupabaseSetupModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SETUP);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);

    if (!supabase) {
      setTestResult({
        success: false,
        message: 'Supabase keys are missing in environment variables (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY).'
      });
      setTesting(false);
      return;
    }

    try {
      const { data, error } = await supabase.from('tests').select('count', { count: 'exact', head: true });
      if (error) {
        if (error.code === '42P01') {
          setTestResult({
            success: false,
            message: 'Connected to Supabase, but SQL tables are not created yet! Please run the SQL script below in your Supabase SQL Editor.'
          });
        } else {
          setTestResult({
            success: false,
            message: `Supabase Connection Error: ${error.message}`
          });
        }
      } else {
        setTestResult({
          success: true,
          message: 'Successfully connected to Supabase! All tables are active and ready.'
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: `Connection test failed: ${err.message || String(err)}`
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl text-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Supabase Connection & SQL Setup
                {isSupabaseConfigured ? (
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold border border-emerald-500/30">
                    Configured
                  </span>
                ) : (
                  <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full font-bold border border-amber-500/30">
                    Keys Missing
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-400">Database synchronization & table schema</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm text-slate-300">
          
          {/* Status Box */}
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Status Check</span>
              <button
                onClick={handleTestConnection}
                disabled={testing}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
                Test Supabase Connection
              </button>
            </div>

            {testResult && (
              <div className={`p-3 rounded-lg text-xs font-medium flex items-start gap-2.5 border ${
                testResult.success 
                  ? 'bg-emerald-950/50 border-emerald-500/30 text-emerald-300' 
                  : 'bg-rose-950/50 border-rose-500/30 text-rose-300'
              }`}>
                {testResult.success ? (
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                )}
                <span>{testResult.message}</span>
              </div>
            )}
          </div>

          {/* Steps Instructions */}
          <div className="space-y-2">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">Supabase Setup Steps:</h4>
            <ol className="list-decimal list-inside text-xs text-slate-300 space-y-1 bg-slate-800/40 p-3.5 rounded-xl border border-slate-800">
              <li>Open your <strong className="text-emerald-400">Supabase Dashboard</strong>.</li>
              <li>Go to <strong className="text-emerald-400">SQL Editor</strong> on the left sidebar.</li>
              <li>Click <strong className="text-emerald-400">New Query</strong>.</li>
              <li>Paste the SQL script below and click <strong className="text-emerald-400">Run</strong>.</li>
            </ol>
          </div>

          {/* SQL Script Box */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300">Supabase SQL Schema Script:</span>
              <button
                onClick={handleCopySql}
                className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded-lg text-xs font-bold border border-slate-700 transition"
              >
                {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied to Clipboard!' : 'Copy SQL Script'}
              </button>
            </div>
            
            <pre className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-xs text-emerald-300 font-mono overflow-x-auto max-h-56 leading-relaxed">
              {SUPABASE_SQL_SETUP}
            </pre>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 flex justify-end bg-slate-900/50">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
