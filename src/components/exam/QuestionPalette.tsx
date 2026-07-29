import React from 'react';
import { UserResponse } from '../../types';
import { Bookmark, Check, HelpCircle } from 'lucide-react';

interface QuestionPaletteProps {
  totalQuestions: number;
  currentQIndex: number;
  userResponses: Record<string, UserResponse>;
  questionIds: string[];
  onSelectQuestion: (index: number) => void;
}

export const QuestionPalette: React.FC<QuestionPaletteProps> = ({
  totalQuestions,
  currentQIndex,
  userResponses,
  questionIds,
  onSelectQuestion,
}) => {
  // Compute counts
  let answeredCount = 0;
  let markedCount = 0;
  let markedAnsweredCount = 0;
  let skippedCount = 0;
  let unvisitedCount = 0;

  questionIds.forEach((id, idx) => {
    const resp = userResponses[id];
    const status = resp?.status || 'unvisited';
    const hasSel = resp?.selectedOptions && resp.selectedOptions.length > 0;

    if (status === 'marked_answered') {
      markedAnsweredCount++;
    } else if (status === 'marked') {
      markedCount++;
    } else if (hasSel || status === 'answered') {
      answeredCount++;
    } else if (status === 'skipped') {
      skippedCount++;
    } else {
      unvisitedCount++;
    }
  });

  const getStatusStyle = (id: string, index: number) => {
    const isCurrent = index === currentQIndex;
    const resp = userResponses[id];
    const status = resp?.status || 'unvisited';
    const hasSel = resp?.selectedOptions && resp.selectedOptions.length > 0;

    let baseClass = 'w-9 h-9 rounded-lg font-bold text-xs flex items-center justify-center transition-all cursor-pointer relative shadow-sm ';

    if (isCurrent) {
      baseClass += 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-slate-900 font-extrabold scale-110 z-10 ';
    }

    if (status === 'marked_answered') {
      return baseClass + 'bg-purple-600 text-white hover:bg-purple-700';
    }
    if (status === 'marked') {
      return baseClass + 'bg-purple-500 text-white hover:bg-purple-600';
    }
    if (hasSel || status === 'answered') {
      return baseClass + 'bg-emerald-600 text-white hover:bg-emerald-700';
    }
    if (status === 'skipped') {
      return baseClass + 'bg-rose-500 text-white hover:bg-rose-600';
    }
    return baseClass + 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300';
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 flex flex-col justify-between h-full select-none shadow-sm">
      
      <div>
        <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100 mb-3 pb-2 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
          <span>Question Palette</span>
          <span className="text-xs font-semibold text-slate-500">{totalQuestions} Total</span>
        </h3>

        {/* Legend */}
        <div className="grid grid-cols-2 gap-2 text-[11px] mb-4 p-2.5 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700/60 font-medium">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded bg-emerald-600 shrink-0" />
            <span className="text-slate-700 dark:text-slate-300">Answered ({answeredCount})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded bg-rose-500 shrink-0" />
            <span className="text-slate-700 dark:text-slate-300">Not Answered ({skippedCount})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded bg-purple-500 shrink-0" />
            <span className="text-slate-700 dark:text-slate-300">Marked ({markedCount})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded bg-slate-200 dark:bg-slate-700 shrink-0" />
            <span className="text-slate-700 dark:text-slate-300">Not Visited ({unvisitedCount})</span>
          </div>
        </div>

        {/* Question Grid */}
        <div className="grid grid-cols-5 gap-2 max-h-[320px] overflow-y-auto p-1 pr-2 no-scrollbar">
          {questionIds.map((id, index) => {
            const resp = userResponses[id];
            const isMarked = resp?.status === 'marked' || resp?.status === 'marked_answered';
            return (
              <button
                key={id}
                onClick={() => onSelectQuestion(index)}
                className={getStatusStyle(id, index)}
              >
                <span>{index + 1}</span>
                {isMarked && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full border border-white" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100 dark:border-slate-700 text-center">
        <p className="text-[11px] text-slate-400">
          Click any number to jump directly to that question.
        </p>
      </div>
    </div>
  );
};
