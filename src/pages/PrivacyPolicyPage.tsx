import React from 'react';
import { ShieldCheck, Lock, Eye, FileText, CheckCircle2 } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

export const PrivacyPolicyPage: React.FC = () => {
  const { settings } = useSettings();
  const siteName = settings.websiteName || 'Super Concept Classes Exam Portal';
  const email = settings.contactEmail || 'superconceptclasses@gmail.com';

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 shadow-xl border border-slate-200 dark:border-slate-800 space-y-8">
        
        {/* Header */}
        <div className="border-b border-slate-200 dark:border-slate-800 pb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider mb-3">
            <ShieldCheck className="w-4 h-4" /> Legal Policy & Privacy Statement
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            Last Updated: August 2026 | Effective for all students and users of {siteName}
          </p>
        </div>

        {/* Overview */}
        <section className="space-y-4 text-slate-700 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
          <p>
            At <strong>{siteName}</strong> (accessible from our educational test portal), one of our main priorities is the privacy of our students and visitors. This Privacy Policy document contains types of information that is collected and recorded by {siteName} and how we use it.
          </p>
          <p>
            If you have additional questions or require more information about our Privacy Policy, do not hesitate to contact us at <a href={`mailto:${email}`} className="text-blue-600 dark:text-blue-400 underline font-semibold">{email}</a>.
          </p>
        </section>

        {/* Information We Collect */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" /> 1. Information We Collect
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            We collect information purely to provide a seamless practice examination experience for students:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-sm text-slate-600 dark:text-slate-400">
            <li><strong>Student Identity Information:</strong> Name, optional email address, and optional mobile number submitted prior to attempting a mock test to generate custom scorecard reports.</li>
            <li><strong>Test Performance Data:</strong> Answers selected, score obtained, time spent per question, rank on leaderboard, and date of attempt.</li>
            <li><strong>Log Files & Technical Data:</strong> Standard log files including internet protocol (IP) addresses, browser type, Internet Service Provider (ISP), date/time stamp, referring/exit pages, and number of clicks. These are not linked to any information that is personally identifiable.</li>
          </ul>
        </section>

        {/* Cookies & Google AdSense Policy */}
        <section className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-700/60 space-y-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Eye className="w-5 h-5 text-indigo-600" /> 2. Cookies, DoubleClick DART & Google AdSense
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Like any other website, {siteName} uses 'cookies'. These cookies are used to store information including visitors' preferences, test progression state, and the pages on the website that the visitor accessed or visited.
          </p>
          
          <div className="space-y-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
            <h3 className="font-bold text-slate-900 dark:text-white">Google DoubleClick DART Cookie</h3>
            <p>
              Google is one of a third-party vendor on our site. It also uses cookies, known as DART cookies, to serve ads to our site visitors based upon their visit to our site and other sites on the internet.
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-400">
              <li>Third-party vendors, including Google, use cookies to serve ads based on a user's prior visits to your website or other websites.</li>
              <li>Google's use of advertising cookies enables it and its partners to serve ads to your users based on their visit to your sites and/or other sites on the Internet.</li>
              <li>Users may opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline font-medium">Google Ads Settings</a> or by opting out of a third-party vendor's use of cookies for personalized advertising by visiting <a href="https://www.aboutads.info" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline font-medium">aboutads.info</a>.</li>
            </ul>
          </div>
        </section>

        {/* How We Use Information */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" /> 3. How We Use Your Information
          </h2>
          <div className="grid sm:grid-cols-2 gap-3 text-xs sm:text-sm">
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="font-bold text-slate-900 dark:text-white">Score & Performance Analysis:</span> To calculate marks, percentages, accuracy, and detailed question-by-question solutions.
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="font-bold text-slate-900 dark:text-white">Leaderboard Rankings:</span> To allow students to gauge their national/state rank among fellow test takers.
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="font-bold text-slate-900 dark:text-white">Portal Quality Maintenance:</span> To analyze site traffic, prevent fraudulent automated submissions, and improve portal loading speeds.
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="font-bold text-slate-900 dark:text-white">Important Updates:</span> To notify students about new official examination alerts and syllabus updates.
            </div>
          </div>
        </section>

        {/* GDPR & CCPA Data Rights */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Lock className="w-5 h-5 text-amber-600" /> 4. GDPR & CCPA Privacy Rights
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            We want to ensure you are fully aware of all of your data protection rights. Every user is entitled to the following:
          </p>
          <ul className="list-disc pl-6 space-y-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            <li><strong>The right to access:</strong> You have the right to request copies of your personal test result records.</li>
            <li><strong>The right to rectification:</strong> You have the right to request that we correct any information you believe is inaccurate.</li>
            <li><strong>The right to erasure:</strong> You have the right to request that we erase your test result or leaderboard submission under certain conditions.</li>
          </ul>
        </section>

        {/* Educational Integrity & Children's Privacy */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            5. Children's Educational Privacy (COPPA Compliance)
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Another part of our priority is adding protection for children while using the internet. {siteName} does not knowingly collect any Personal Identifiable Information from children under the age of 13 without parental/guardian consent. All practice test features are strictly academic and educational.
          </p>
        </section>

        {/* Contact */}
        <div className="pt-6 border-t border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          For any privacy policy queries, email our Data Protection Officer at: <strong className="text-slate-800 dark:text-slate-200">{email}</strong>
        </div>

      </div>
    </div>
  );
};
