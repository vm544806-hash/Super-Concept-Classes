import React from 'react';
import { GraduationCap, ShieldCheck, Zap, Users, Award, BookOpen } from 'lucide-react';
import { HomeInlineAd } from '../components/common/AdComponents';

export const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Banner */}
        <div className="text-center max-w-2xl mx-auto">
          <div className="w-16 h-16 rounded-3xl bg-blue-600 text-white flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/25">
            <GraduationCap className="w-8 h-8" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
            About Smart Exam Portal
          </h1>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
            Empowering millions of competitive exam aspirants across India with free, authentic, time-bound Computer Based Test (CBT) mock practice papers.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-center">
            <Zap className="w-8 h-8 text-amber-500 mx-auto mb-3" />
            <h3 className="font-bold text-base mb-1">Authentic TCS Pattern</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Real examination interface with countdown timer, negative marking, and TCS question palette.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-center">
            <ShieldCheck className="w-8 h-8 text-emerald-500 mx-auto mb-3" />
            <h3 className="font-bold text-base mb-1">Zero Friction</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              No registration or password required for students. Jump straight into practice.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-center">
            <Award className="w-8 h-8 text-purple-600 mx-auto mb-3" />
            <h3 className="font-bold text-base mb-1">Detailed Analytics</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Instant scorecard with percentage, correct/wrong counts, and step-by-step solution keys.
            </p>
          </div>
        </div>

        {/* Ad */}
        <HomeInlineAd />

        {/* Vision & Mission */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h2 className="text-xl font-extrabold text-blue-600 dark:text-blue-400">Our Core Mission</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Smart Exam Portal was built with a single objective: to democratize quality test preparation for examinations such as SSC CGL, Railway RRB NTPC, Banking (SBI/IBPS PO), UPSC CSAT, State Police exams, and Teaching TETs. Every student, regardless of background or financial means, deserves access to top-tier CBT exam practice.
          </p>
        </div>

      </div>
    </div>
  );
};
