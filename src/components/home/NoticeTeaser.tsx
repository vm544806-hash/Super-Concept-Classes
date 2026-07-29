import React from 'react';
import { Link } from 'react-router-dom';
import { Notice } from '../../types';
import { Bell, ChevronRight, Calendar } from 'lucide-react';

interface NoticeTeaserProps {
  notices: Notice[];
}

export const NoticeTeaser: React.FC<NoticeTeaserProps> = ({ notices }) => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-5 shadow-sm my-8">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Bell className="w-4 h-4" />
          </div>
          <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100">
            Latest Exam Notifications & Alerts
          </h3>
        </div>
        <Link
          to="/notice"
          className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5"
        >
          View All <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {notices.slice(0, 4).map(notice => (
          <Link
            key={notice.id}
            to="/notice"
            className="group p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-600 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 rounded">
                  {notice.category}
                </span>
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> {notice.date}
                </span>
              </div>
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 transition-colors line-clamp-1">
                {notice.title}
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                {notice.content}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
