import React, { useEffect, useState } from 'react';
import { Clock, Maximize2, Minimize2, CheckCircle2, ShieldAlert } from 'lucide-react';
import { formatTime } from '../../utils/helpers';

interface ExamHeaderProps {
  testTitle: string;
  category: string;
  currentQIndex: number;
  totalQuestions: number;
  timeRemainingSeconds: number;
  onTimeUp: () => void;
  onSubmitClick: () => void;
  studentName: string;
}

export const ExamHeader: React.FC<ExamHeaderProps> = ({
  testTitle,
  category,
  currentQIndex,
  totalQuestions,
  timeRemainingSeconds,
  onTimeUp,
  onSubmitClick,
  studentName,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (timeRemainingSeconds <= 0) {
      onTimeUp();
    }
  }, [timeRemainingSeconds, onTimeUp]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  const isLowTime = timeRemainingSeconds < 180; // Warning under 3 mins

  return (
    <header className="sticky top-0 z-50 bg-slate-900 text-white shadow-lg border-b border-slate-800 px-4 py-3 select-none">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        
        {/* Test Info */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex w-10 h-10 rounded-xl bg-blue-600 font-extrabold text-white items-center justify-center text-sm shadow">
            CBT
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-blue-900 text-blue-200 rounded border border-blue-700">
                {category}
              </span>
              <span className="text-xs text-slate-400 font-medium truncate max-w-[150px] sm:max-w-none">
                Candidate: <strong className="text-white">{studentName}</strong>
              </span>
            </div>
            <h2 className="text-sm sm:text-base font-extrabold text-white line-clamp-1">
              {testTitle}
            </h2>
          </div>
        </div>

        {/* Center / Right Exam Controls */}
        <div className="flex items-center gap-2 sm:gap-4 ml-auto">
          
          {/* Question Index Indicator */}
          <div className="hidden md:block text-xs text-slate-300 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700 font-bold">
            Question {currentQIndex + 1} of {totalQuestions}
          </div>

          {/* Timer Display */}
          <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border font-mono font-bold text-sm sm:text-base transition-colors ${
            isLowTime 
              ? 'bg-rose-950/80 text-rose-300 border-rose-600 animate-pulse' 
              : 'bg-slate-800 text-amber-300 border-slate-700'
          }`}>
            <Clock className={`w-4 h-4 ${isLowTime ? 'text-rose-400' : 'text-amber-400'}`} />
            <span>{formatTime(timeRemainingSeconds)}</span>
          </div>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-2 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-colors"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Submit Test Button */}
          <button
            onClick={onSubmitClick}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs sm:text-sm px-4 py-2 rounded-xl transition-all shadow-md shadow-emerald-600/30 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Submit Test</span>
          </button>

        </div>
      </div>
    </header>
  );
};
