import React from 'react';
import { Link } from 'react-router-dom';
import { Test } from '../../types';
import { Clock, HelpCircle, Award, Play, Flame, Star, AlertCircle } from 'lucide-react';
import { getDifficultyColor } from '../../utils/helpers';

interface TestCardProps {
  test: Test;
}

export const TestCard: React.FC<TestCardProps> = ({ test }) => {
  // Fallback image if IMGBB or custom image fails or is empty
  const fallbackImage = 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=600&q=80';

  return (
    <div className="group bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden hover:-translate-y-1">
      
      {/* Test Banner Image Container */}
      <Link to={`/test/${test.id}`} className="relative h-44 w-full overflow-hidden bg-slate-100 dark:bg-slate-900 block">
        <img
          src={test.imageUrl || fallbackImage}
          alt={test.title}
          onError={(e) => {
            (e.target as HTMLImageElement).src = fallbackImage;
          }}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Category Overlay Badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-lg border border-white/20">
          <span>{test.category}</span>
        </div>

        {/* Popular / Featured Badges */}
        <div className="absolute top-3 right-3 flex items-center gap-1">
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
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-4">
            {test.description}
          </p>

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

        {/* Footer info & Start Button */}
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
            className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-md shadow-blue-500/20 hover:scale-105 shrink-0"
          >
            <span>Start Test</span>
            <Play className="w-3.5 h-3.5 fill-white" />
          </Link>
        </div>

      </div>
    </div>
  );
};
