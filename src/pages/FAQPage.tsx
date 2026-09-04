import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, GraduationCap, CheckCircle2, ShieldAlert } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

export const FAQPage: React.FC = () => {
  const { settings } = useSettings();
  const siteName = settings.websiteName || 'Super Concept Classes Exam Portal';
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs: FAQItem[] = [
    {
      category: 'Mock Tests & Exam Engine',
      question: `Are all mock tests on ${siteName} free for students?`,
      answer: `Yes! All online practice tests, model question papers, subject quizzes, and instant scorecard reports on ${siteName} are 100% free for all students.`
    },
    {
      category: 'Mock Tests & Exam Engine',
      question: 'How does the negative marking calculation work?',
      answer: 'Each exam is configured with its official marking scheme (e.g., +2 for correct answer, -0.25 or -0.5 for incorrect answer, 0 for unattempted questions). The final score and percentage are calculated automatically upon test submission.'
    },
    {
      category: 'Mock Tests & Exam Engine',
      question: 'Can I retake a test to improve my score and rank?',
      answer: 'Yes, if the administrator has enabled "Allow Retake" for that test, you can attempt the exam multiple times. Your updated scorecard and time taken will reflect on your personal performance summary.'
    },
    {
      category: 'Leaderboard & Results',
      question: 'How is the All-India Leaderboard rank calculated?',
      answer: 'Ranks are ordered strictly by Highest Total Score first. In case of a score tie, the student who completed the exam in less time is awarded the higher rank position.'
    },
    {
      category: 'Account & Security',
      question: 'Is student personal data safe on this platform?',
      answer: 'Absolutely. We do not sell or share student contact details. Name and optional email/mobile entries are exclusively used to display your personalized exam scorecard and verify leaderboard submissions.'
    },
    {
      category: 'Technical & Browser',
      question: 'What happens if my phone reloads or internet drops during an active test?',
      answer: 'Our exam engine automatically caches your selected responses locally in real-time. If your browser reloads, your timer and answered options remain saved so you do not lose your progress.'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 shadow-xl border border-slate-200 dark:border-slate-800 space-y-8">
        
        {/* Header */}
        <div className="border-b border-slate-200 dark:border-slate-800 pb-6 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-3">
            <HelpCircle className="w-4 h-4" /> Student Support & Help Center
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Frequently Asked Questions (FAQ)
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            Find answers to common questions about mock test attempts, leaderboard rankings, and test engine rules.
          </p>
        </div>

        {/* Accordion FAQ list */}
        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div 
                key={idx}
                className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden transition-all bg-slate-50/50 dark:bg-slate-800/30"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full text-left p-5 flex items-center justify-between gap-4 font-bold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  <span className="text-base sm:text-lg">{faq.question}</span>
                  <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 shrink-0">
                    {isOpen ? <ChevronUp className="w-5 h-5 text-blue-600" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-200/60 dark:border-slate-700/60 bg-white dark:bg-slate-900/60">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer Support Banner */}
        <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-lg">Have more questions or need help?</h3>
            <p className="text-xs sm:text-sm text-blue-100 mt-1">Our support team and educators are available to assist you.</p>
          </div>
          <a
            href="/contact"
            className="bg-white text-blue-600 hover:bg-blue-50 font-bold px-5 py-2.5 rounded-xl text-sm transition-colors shadow-md shrink-0"
          >
            Contact Support
          </a>
        </div>

      </div>
    </div>
  );
};
