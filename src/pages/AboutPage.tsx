import React from 'react';
import { GraduationCap, ShieldCheck, Zap, Users, Award, BookOpen, HeartHandshake } from 'lucide-react';
import { HomeInlineAd } from '../components/common/AdComponents';
import { useSettings } from '../contexts/SettingsContext';

export const AboutPage: React.FC = () => {
  const { settings } = useSettings();
  const siteName = settings.websiteName || 'Super Concept Classes Exam Portal';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Banner */}
        <div className="text-center max-w-2xl mx-auto">
          <div className="w-16 h-16 rounded-3xl bg-blue-600 text-white flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/25">
            <GraduationCap className="w-8 h-8" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
            About {siteName}
          </h1>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
            Leading digital educational portal created under the mentorship of Daiyash Sir, dedicated to helping students across Jharkhand and Bihar excel in JAC Board (Class 8th to 12th) and competitive examinations.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-center">
            <Zap className="w-8 h-8 text-amber-500 mx-auto mb-3" />
            <h3 className="font-bold text-base mb-1">Authentic CBT Pattern</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Real online examination interface with countdown timer, chapter-wise MCQs, and question navigation palette.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-center">
            <ShieldCheck className="w-8 h-8 text-emerald-500 mx-auto mb-3" />
            <h3 className="font-bold text-base mb-1">100% Free Practice</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              No hidden fees or compulsory passwords. Students can easily choose their class and attempt mock tests anytime.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-center">
            <Award className="w-8 h-8 text-purple-600 mx-auto mb-3" />
            <h3 className="font-bold text-base mb-1">Instant Performance Analysis</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Instant scorecard with percentage, accuracy rate, detailed answer solutions, and state-level rank leaderboard.
            </p>
          </div>
        </div>

        {/* Ad */}
        <HomeInlineAd />

        {/* Vision & Mission */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div>
            <h2 className="text-xl font-extrabold text-blue-600 dark:text-blue-400 mb-2">Our Educational Mission</h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              <strong>Super Concept Classes</strong> was established by <strong>Daiyash Sir</strong> with the mission of providing top-tier academic coaching and modern CBT mock test series to students. We bridge the gap between textbook concepts and objective exam performance by providing syllabus-aligned practice sets for Class 8, 9, 10, 11, and 12 (Arts, Science & Commerce).
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex gap-3 items-start">
              <BookOpen className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">Syllabus-Aligned Content</h4>
                <p className="text-xs text-slate-500 mt-1">Questions strictly curated based on the latest NCERT and JAC Board syllabus blueprints.</p>
              </div>
            </div>

            <div className="flex gap-3 items-start">
              <HeartHandshake className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">Community Support</h4>
                <p className="text-xs text-slate-500 mt-1">Daily updates, study materials, and direct guidance through YouTube and Telegram channels.</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
