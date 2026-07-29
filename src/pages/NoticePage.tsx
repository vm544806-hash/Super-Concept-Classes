import React, { useEffect, useState } from 'react';
import { Notice } from '../types';
import { subscribeToNotices } from '../firebase/services';
import { Bell, Calendar, ExternalLink } from 'lucide-react';

export const NoticePage: React.FC = () => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeToNotices((data) => {
      setNotices(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100">
              Official Exam Notices & Notifications
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Latest recruitment updates, syllabus changes, and live exam schedule releases.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="py-16 text-center text-slate-400 font-semibold">Loading Exam Notices...</div>
        ) : (
          <div className="space-y-4">
            {notices.map(notice => (
              <div
                key={notice.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-0.5 bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 font-bold text-xs rounded-lg uppercase">
                      {notice.category}
                    </span>
                    {notice.isImportant && (
                      <span className="px-2.5 py-0.5 bg-rose-500 text-white font-extrabold text-[10px] rounded uppercase animate-pulse">
                        Important
                      </span>
                    )}
                  </div>

                  <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> Published: {notice.date}
                  </span>
                </div>

                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
                  {notice.title}
                </h2>

                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                  {notice.content}
                </p>

                {notice.linkUrl && (
                  <a
                    href={notice.linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    <span>Read Official Notification Document</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};
