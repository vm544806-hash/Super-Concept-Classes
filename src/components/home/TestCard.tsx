import React from 'react';
import { Link } from 'react-router-dom';
import { Test } from '../../types';
import { Clock, HelpCircle, Award, Play, Flame, Star, AlertCircle, CheckCircle, Calendar, Eye, Timer } from 'lucide-react';
import { getDifficultyColor } from '../../utils/helpers';
import { computeTestStatus, formatDateTime, getTimeDifferenceText } from '../../utils/testHelpers';

interface TestCardProps {
  test: Test;
}

export const TestCard: React.FC<TestCardProps> = ({ test }) => {
  // Fallback image if IMGBB or custom image fails or is empty
  const fallbackImage = 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=600&q=80';

  const isCompletedLocally = !!localStorage.getItem(`completed_test_${test.id}`);
  const status = computeTestStatus(test);

  return (
    <div className="group bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden hover:-translate-y-1">
      
      {/* Test Banner Image Container */}
      <Link to={`/test/${test.id}`} className="relative h-44 w-full overflow-hidden bg-slate-100 dark:bg-slate-900 block">
        <img
          src={test.imageUrl || fallbackImage}
          alt={test.title}
          loading="lazy"
          decoding="async"
          onError={(e) => {
            (e.target as HTMLImageElement).src = fallbackImage;
          }}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Category Overlay Badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-lg border border-white/20">
          <span>{test.category}</span>
        </div>

        {/* Status / Popular / Featured / Attempted Badges */}
        <div className="absolute top-3 right-3 flex items-center gap-1 flex-wrap justify-end">
          {status === 'upcoming' && (
            <span className="flex items-center gap-1 bg-amber-500 text-slate-950 font-black text-[10px] px-2.5 py-1 rounded-md shadow uppercase tracking-wide">
              <Clock className="w-3 h-3 text-slate-950" /> Live Soon
            </span>
          )}

          {status === 'expired' && (
            <span className="flex items-center gap-1 bg-slate-800/90 text-slate-300 font-extrabold text-[10px] px-2.5 py-1 rounded-md shadow border border-slate-700 uppercase">
              <AlertCircle className="w-3 h-3 text-slate-400" /> Expired
            </span>
          )}

          {status === 'live' && isCompletedLocally && (
            <span className="flex items-center gap-1 bg-emerald-500 text-white font-extrabold text-[10px] px-2 py-0.5 rounded-md shadow uppercase">
              <CheckCircle className="w-3 h-3" /> Attempted
            </span>
          )}

          {status === 'live' && !isCompletedLocally && (
            <>
              {test.isPopular && (
                <span className="flex items-center gap-1 bg-amber-500 text-slate-950 font-extrabold text-[10px] px-2 py-0.5 rounded-md shadow uppercase">
                  <Flame className="w-3 h-3 fill-slate-950" /> Popular
                </span>
              )}
              {test.isFeatured && (
                <span className="flex items-center gap-1 bg-purple-600 text-white font-extrabold text-[10px] px-2 py-0.5 rounded-md shadow uppercase">
                  <Star className="w-3 h-3 fill-white" /> Featured
                </span>
              )}
              <span className="flex items-center gap-1 bg-rose-600 text-white font-extrabold text-[10px] px-2 py-0.5 rounded-md shadow uppercase animate-pulse">
                <span className="w-1.5 h-1.5 bg-white rounded-full" /> Live
              </span>
            </>
          )}
        </div>
      </Link>

      {/* Card Content Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Title */}
          <Link to={`/test/${test.id}`}>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 line-clamp-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors leading-snug mb-2">
              {test.title}
            </h3>
          </Link>

          {/* Description */}
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-3">
            {test.description}
          </p>

          {/* Schedule Banner if Upcoming or Expired */}
          {status === 'upcoming' && test.startTime && (
            <div className="mb-3 px-3 py-2 bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 rounded-xl text-[11px] font-bold flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 shrink-0" /> Live On: {formatDateTime(test.startTime)}
              </span>
              <span className="text-[10px] bg-amber-500/20 px-1.5 py-0.5 rounded">
                in {getTimeDifferenceText(test.startTime)}
              </span>
            </div>
          )}

          {status === 'expired' && test.endTime && (
            <div className="mb-3 px-3 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 rounded-xl text-[11px] font-medium flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>Expired on: {formatDateTime(test.endTime)}</span>
            </div>
          )}

          {/* Key Specs Grid */}
          <div className="grid grid-cols-3 gap-2 py-2.5 px-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-800 text-center mb-4">
            <div>
              <div className="flex items-center justify-center gap-1 text-slate-400 dark:text-slate-500 text-[11px]">
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Questions</span>
              </div>
              <p className="text-xs font-extrabold text-slate-800 dark:text-slate-200 mt-0.5">
                {test.totalQuestions || 10} Qs
              </p>
            </div>

            <div className="border-x border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-center gap-1 text-slate-400 dark:text-slate-500 text-[11px]">
                <Clock className="w-3.5 h-3.5" />
                <span>Time</span>
              </div>
              <p className="text-xs font-extrabold text-slate-800 dark:text-slate-200 mt-0.5">
                {test.durationMins} Mins
              </p>
            </div>

            <div>
              <div className="flex items-center justify-center gap-1 text-slate-400 dark:text-slate-500 text-[11px]">
                <Award className="w-3.5 h-3.5" />
                <span>Marks</span>
              </div>
              <p className="text-xs font-extrabold text-slate-800 dark:text-slate-200 mt-0.5">
                {test.totalMarks} Marks
              </p>
            </div>
          </div>
        </div>

        {/* Footer info & Action Button */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-md border ${getDifficultyColor('Medium')}`}>
              Medium
            </span>
            {test.negativeMarking > 0 && (
              <span className="text-[10px] text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-0.5">
                <AlertCircle className="w-3 h-3" /> -{test.negativeMarking}
              </span>
            )}
          </div>

          <Link
            to={`/test/${test.id}`}
            className={`inline-flex items-center gap-1.5 font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-md shrink-0 hover:scale-105 ${
              status === 'expired'
                ? 'bg-slate-700 hover:bg-slate-800 text-slate-200 shadow-slate-900/20'
                : status === 'upcoming'
                ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-500/20'
                : isCompletedLocally
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'
            }`}
          >
            {status === 'expired' ? (
              <>
                <span>View Solutions</span>
                <Eye className="w-3.5 h-3.5" />
              </>
            ) : status === 'upcoming' ? (
              <>
                <span>Scheduled</span>
                <Clock className="w-3.5 h-3.5" />
              </>
            ) : isCompletedLocally ? (
              <>
                <span>View Result</span>
                <Play className="w-3.5 h-3.5 fill-white" />
              </>
            ) : (
              <>
                <span>Start Test</span>
                <Play className="w-3.5 h-3.5 fill-white" />
              </>
            )}
          </Link>
        </div>

      </div>
    </div>
  );
};
