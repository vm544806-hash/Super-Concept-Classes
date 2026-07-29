import React from 'react';
import { UserResponse } from '../../types';
import { AlertTriangle, CheckCircle2, X } from 'lucide-react';
import { formatTime } from '../../utils/helpers';

interface SubmitModalProps {
  totalQuestions: number;
  userResponses: Record<string, UserResponse>;
  questionIds: string[];
  timeRemainingSeconds: number;
  onConfirmSubmit: () => void;
  onClose: () => void;
  isAutoSubmit?: boolean;
}

export const SubmitModal: React.FC<SubmitModalProps> = ({
  totalQuestions,
  userResponses,
  questionIds,
  timeRemainingSeconds,
  onConfirmSubmit,
  onClose,
  isAutoSubmit = false,
}) => {
  let answered = 0;
  let marked = 0;
  let unattempted = 0;

  questionIds.forEach(id => {
    const resp = userResponses[id];
    const hasSel = resp?.selectedOptions && resp.selectedOptions.length > 0;
    if (resp?.status === 'marked' || resp?.status === 'marked_answered') {
      marked++;
    }
    if (hasSel) {
      answered++;
    } else {
      unattempted++;
    }
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full p-6 sm:p-8 relative">
        
        {!isAutoSubmit && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-black text-slate-900 dark:text-slate-100">
            {isAutoSubmit ? 'Time Up! Auto Submitting Exam' : 'Confirm Exam Submission'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Review your final attempt summary before submitting your response sheet.
          </p>
        </div>

        {/* Stats Summary Grid */}
        <div className="grid grid-cols-3 gap-2.5 bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-700/80 mb-6 text-center">
          <div>
            <span className="block text-2xl font-black text-emerald-600 dark:text-emerald-400">{answered}</span>
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">Answered</span>
          </div>

          <div className="border-x border-slate-200 dark:border-slate-700">
            <span className="block text-2xl font-black text-purple-600 dark:text-purple-400">{marked}</span>
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">Marked</span>
          </div>

          <div>
            <span className="block text-2xl font-black text-rose-500">{unattempted}</span>
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">Skipped</span>
          </div>
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400 mb-6 bg-amber-50 dark:bg-amber-950/50 p-3 rounded-xl border border-amber-200 dark:border-amber-900/60 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <span>
            Once submitted, you cannot change your responses. Your scorecard and solutions review will be generated immediately.
          </span>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-3">
          {!isAutoSubmit && (
            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              Resume Test
            </button>
          )}

          <button
            onClick={onConfirmSubmit}
            className="flex-1 py-3 px-4 rounded-xl font-extrabold text-xs sm:text-sm bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/25 transition-all"
          >
            Submit Exam Now
          </button>
        </div>

      </div>
    </div>
  );
};
