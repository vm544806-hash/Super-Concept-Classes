import React from 'react';
import { Sparkles, ShieldCheck, Zap, Award } from 'lucide-react';

export const HeroBanner: React.FC = () => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-blue-700 via-indigo-700 to-purple-800 text-white rounded-3xl p-6 sm:p-10 my-6 shadow-xl border border-blue-500/20">
      
      {/* Decorative Orbs */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-3xl">
        <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold tracking-wide mb-4 text-blue-100">
          <img 
            src="https://i.ibb.co/LdHZf6m2/logo.jpg" 
            alt="Super Concept Classes Official Exam Portal Logo" 
            width="20" 
            height="20" 
            className="w-5 h-5 rounded-full bg-white object-cover p-0.5" 
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/logo.png';
            }}
          />
          <span>Super Concept Classes • Official CBT Mock Test Portal</span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight mb-4">
          Prepare Smart. <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-300 bg-clip-text text-transparent">
            Crack Every Competitive Exam.
          </span>
        </h1>

        <p className="text-base sm:text-lg text-blue-100 mb-8 leading-relaxed max-w-2xl font-normal">
          Real-time CBT examination environment with live timer, question palette, negative marking, instant score card, and in-depth solution reviews.
        </p>

        {/* Badges Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
          <div className="flex items-center gap-2.5 bg-white/10 backdrop-blur-md px-3.5 py-2.5 rounded-2xl border border-white/10">
            <Zap className="w-5 h-5 text-amber-300 shrink-0" />
            <div>
              <p className="text-xs font-bold">100% Real Pattern</p>
              <p className="text-[11px] text-blue-200">SSC, Bank, Railway, UPSC</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 bg-white/10 backdrop-blur-md px-3.5 py-2.5 rounded-2xl border border-white/10">
            <ShieldCheck className="w-5 h-5 text-emerald-300 shrink-0" />
            <div>
              <p className="text-xs font-bold">No Login Required</p>
              <p className="text-[11px] text-blue-200">Start Test Instantly</p>
            </div>
          </div>

          <div className="col-span-2 sm:col-span-1 flex items-center gap-2.5 bg-white/10 backdrop-blur-md px-3.5 py-2.5 rounded-2xl border border-white/10">
            <Award className="w-5 h-5 text-purple-300 shrink-0" />
            <div>
              <p className="text-xs font-bold">All India Rank</p>
              <p className="text-[11px] text-blue-200">Live Leaderboard</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
