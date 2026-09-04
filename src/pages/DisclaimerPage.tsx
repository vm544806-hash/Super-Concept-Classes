import React from 'react';
import { AlertTriangle, GraduationCap, CheckCircle } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

export const DisclaimerPage: React.FC = () => {
  const { settings } = useSettings();
  const siteName = settings.websiteName || 'Super Concept Classes Exam Portal';

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 shadow-xl border border-slate-200 dark:border-slate-800 space-y-8">
        
        {/* Header */}
        <div className="border-b border-slate-200 dark:border-slate-800 pb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider mb-3">
            <AlertTriangle className="w-4 h-4" /> Educational & Legal Disclaimer
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Disclaimer
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            Important notices regarding government exam affiliations, model question accuracy, and practice test usage.
          </p>
        </div>

        {/* Non-Affiliation Statement */}
        <section className="bg-blue-50 dark:bg-blue-950/40 p-6 rounded-2xl border border-blue-200 dark:border-blue-800/60 space-y-3">
          <h2 className="text-lg font-bold text-blue-950 dark:text-blue-200 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-blue-600" /> Non-Affiliation Declaration
          </h2>
          <p className="text-xs sm:text-sm text-blue-900 dark:text-blue-300 leading-relaxed">
            <strong>{siteName}</strong> is an independent, non-governmental educational practice portal created to assist students with self-assessment through practice tests and previous year model questions.
          </p>
          <p className="text-xs sm:text-sm text-blue-900 dark:text-blue-300 leading-relaxed">
            We are <strong>NOT affiliated, associated, authorized, endorsed by, or in any way officially connected with</strong> any government organization, examination board (such as CBSE, Bihar Board BSEB, UPMSP, MPBSE), or central conducting agency (such as NTA, SSC, UPSC, RRB, IBPS).
          </p>
        </section>

        {/* Content Accuracy */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-600" /> Accuracy of Practice Questions & Solutions
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            All practice questions, explanations, and model answers published on this portal are compiled by qualified subject teachers and sourced from publicly available past papers and standard prescribed NCERT/SCERT text books.
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            While every effort is made to ensure absolute accuracy, errors or typographical misprints may occasionally occur. If you notice any discrepancy in a question or answer key, please report it to our team via our Contact page so it can be verified immediately.
          </p>
        </section>

        {/* External Links Disclaimer */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            External Links Disclaimer
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            {siteName} may contain links to official government websites or notification portals for student reference (such as official board result portals or examination notification PDFs). We do not guarantee, approve, or endorse the information or products available at these external sites.
          </p>
        </section>

      </div>
    </div>
  );
};
