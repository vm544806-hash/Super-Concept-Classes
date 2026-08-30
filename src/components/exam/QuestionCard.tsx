import React from 'react';
import { Question, UserResponse } from '../../types';
import { Bookmark, Check, RotateCcw, ChevronLeft, ChevronRight, CheckSquare, Square, CheckCircle, Circle, FileText } from 'lucide-react';
import { getDifficultyColor } from '../../utils/helpers';

interface QuestionCardProps {
  question: Question;
  qIndex: number;
  totalQuestions: number;
  userResponse: UserResponse | undefined;
  onOptionToggle: (optionId: string) => void;
  onClearResponse: () => void;
  onMarkForReview: () => void;
  onNext: () => void;
  onPrev: () => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  qIndex,
  totalQuestions,
  userResponse,
  onOptionToggle,
  onClearResponse,
  onMarkForReview,
  onNext,
  onPrev,
}) => {
  const selectedOptions = userResponse?.selectedOptions || [];
  const isMultiple = question.type === 'multiple';

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-md p-5 sm:p-7 flex flex-col justify-between min-h-[520px] select-none">
      
      <div>
        {/* Question Header & Meta info */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-4 mb-4 border-b border-slate-100 dark:border-slate-700/80">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-blue-600 text-white font-black text-xs rounded-xl shadow-sm">
              Q{qIndex + 1}
            </span>
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
              {question.subject} {question.topic ? `• ${question.topic}` : ''}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${getDifficultyColor(question.difficulty)}`}>
              {question.difficulty}
            </span>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 px-2.5 py-0.5 rounded-lg">
              +{question.marks || 2} Marks
            </span>
          </div>
        </div>

        {/* Paragraph / Comprehension Block if present */}
        {question.paragraphText && (
          <div className="mb-5 p-4 bg-blue-50/70 dark:bg-blue-950/40 rounded-xl border border-blue-200/80 dark:border-blue-800/80 text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
            <div className="flex items-center gap-1.5 font-bold text-blue-700 dark:text-blue-300 mb-1">
              <FileText className="w-4 h-4" />
              <span>Read Passage / Case Study</span>
            </div>
            <p>{question.paragraphText}</p>
          </div>
        )}

        {/* Main Question Text */}
        <div className="mb-5">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 leading-snug">
            {question.question}
          </h3>

          {/* Optional Question Image */}
          {question.imageUrl && (
            <div className="mt-3 max-w-md overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <img
                src={question.imageUrl}
                alt="Question Diagram"
                loading="lazy"
                decoding="async"
                className="w-full h-auto object-contain max-h-60 bg-slate-50 dark:bg-slate-900"
              />
            </div>
          )}

          {isMultiple && (
            <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 mt-2 italic">
              * Multiple Choice Question: Select ALL correct options that apply.
            </p>
          )}
        </div>

        {/* Options List */}
        <div className="space-y-3 my-6">
          {question.options?.map((option) => {
            const isSelected = selectedOptions.includes(option.id);

            return (
              <div
                key={option.id}
                onClick={() => onOptionToggle(option.id)}
                className={`flex items-center gap-3.5 p-3.5 sm:p-4 rounded-xl border-2 transition-all cursor-pointer ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/80 dark:bg-blue-950/50 text-blue-900 dark:text-blue-100 shadow-sm font-semibold'
                    : 'border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                {/* Selection Icon */}
                <div className="shrink-0">
                  {isMultiple ? (
                    isSelected ? (
                      <CheckSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    ) : (
                      <Square className="w-5 h-5 text-slate-400" />
                    )
                  ) : (
                    isSelected ? (
                      <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 fill-blue-100 dark:fill-blue-900" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-400" />
                    )
                  )}
                </div>

                {/* Option Letter Label */}
                <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                  isSelected 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}>
                  {option.id}
                </span>

                {/* Option Text or Image */}
                <div className="flex-1 text-sm sm:text-base font-medium leading-normal">
                  <span>{option.text}</span>
                  {option.imageUrl && (
                    <img
                      src={option.imageUrl}
                      alt={`Option ${option.id}`}
                      loading="lazy"
                      decoding="async"
                      className="mt-2 max-h-28 rounded-lg border border-slate-200 dark:border-slate-700 object-contain"
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Controls Bar */}
      <div className="pt-4 border-t border-slate-200 dark:border-slate-700/80 flex flex-wrap items-center justify-between gap-3">
        
        {/* Left Actions: Mark for Review & Clear Response */}
        <div className="flex items-center gap-2">
          <button
            onClick={onMarkForReview}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900 border border-purple-200 dark:border-purple-800 transition-colors cursor-pointer"
          >
            <Bookmark className="w-4 h-4" />
            <span className="hidden sm:inline">Mark For Review & Next</span>
            <span className="sm:hidden">Review</span>
          </button>

          <button
            onClick={onClearResponse}
            disabled={selectedOptions.length === 0}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear Response</span>
          </button>
        </div>

        {/* Right Actions: Prev & Next */}
        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={onPrev}
            disabled={qIndex === 0}
            className="flex items-center gap-1 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <button
            onClick={onNext}
            className="flex items-center gap-1 px-5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer shadow-sm"
          >
            <span>{qIndex === totalQuestions - 1 ? 'Save & Review' : 'Save & Next'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
