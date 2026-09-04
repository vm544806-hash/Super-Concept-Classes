import React from 'react';
import { FileCheck, BookOpen, AlertCircle, Award } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

export const TermsPage: React.FC = () => {
  const { settings } = useSettings();
  const siteName = settings.websiteName || 'Super Concept Classes Exam Portal';

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 shadow-xl border border-slate-200 dark:border-slate-800 space-y-8">
        
        {/* Header */}
        <div className="border-b border-slate-200 dark:border-slate-800 pb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 text-xs font-bold uppercase tracking-wider mb-3">
            <FileCheck className="w-4 h-4" /> Academic Terms & Usage Agreement
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Terms of Service
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            Welcome to {siteName}. By accessing or using our practice mock test engine, you agree to comply with these terms.
          </p>
        </div>

        {/* 1. Academic Purpose */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" /> 1. Educational & Practice Purpose
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            All test papers, model questions, quiz modules, and solutions hosted on <strong>{siteName}</strong> are designed exclusively for academic preparation, mock exam practice, and self-assessment purposes. 
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            While we strive to ensure that all question banks and answer keys accurately reflect official syllabi (e.g. CBSE, Bihar Board BSEB, UP Board, SSC, Railway, State PCS), this platform is an independent educational tool and not an official examination body.
          </p>
        </section>

        {/* 2. Conduct & Fair Practice */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-indigo-600" /> 2. Fair Practice & Leaderboard Integrity
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Students and test-takers agree to maintain academic honesty while attempting online examinations:
          </p>
          <ul className="list-disc pl-6 space-y-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            <li>Attempt questions genuinely to reflect your real preparation level.</li>
            <li>Do not attempt to deploy automated scripts, web scrapers, or bots to manipulate test scores or corrupt leaderboard rankings.</li>
            <li>We reserve the right to remove non-authentic or spam submissions from the public all-India leaderboard.</li>
          </ul>
        </section>

        {/* 3. Intellectual Property */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            3. Intellectual Property Rights
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Unless otherwise stated, {siteName} and/or its licensors own the intellectual property rights for all material, question categorizations, test interfaces, and compiled mock series. All intellectual property rights are reserved. You may view and attempt test papers for your personal academic use subject to restrictions set in these terms.
          </p>
        </section>

        {/* 4. Limitation of Liability */}
        <section className="bg-amber-50 dark:bg-amber-950/30 p-5 rounded-2xl border border-amber-200 dark:border-amber-800/50 space-y-2">
          <h2 className="text-base font-bold text-amber-900 dark:text-amber-200 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-600" /> 4. Limitation of Liability
          </h2>
          <p className="text-xs sm:text-sm text-amber-800 dark:text-amber-300 leading-relaxed">
            In no event shall {siteName}, its educators, or administrators be liable for any official exam outcome, rank variation, or indirect damages arising out of the use of or inability to use the mock test materials on this website.
          </p>
        </section>

        {/* 5. Revisions */}
        <section className="space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">5. Modifications</h2>
          <p>
            {siteName} may revise these terms of service for its website at any time without prior notice. By using this website you are agreeing to be bound by the then current version of these terms of service.
          </p>
        </section>

      </div>
    </div>
  );
};
