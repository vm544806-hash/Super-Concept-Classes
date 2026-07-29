import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ExamResult, Question } from '../types';
import { getQuestionsByTestId } from '../firebase/services';
import { generateResultPDF } from '../utils/pdfGenerator';
import confetti from 'canvas-confetti';
import { 
  Trophy, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Clock, 
  Award, 
  Printer, 
  Download, 
  Share2, 
  RotateCcw, 
  Home, 
  ChevronDown, 
  ChevronUp, 
  Check, 
  X,
  Sparkles,
  FileText
} from 'lucide-react';

export const ResultPage: React.FC = () => {
  const navigate = useNavigate();
  const [result, setResult] = useState<ExamResult | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [copiedShare, setCopiedShare] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'correct' | 'wrong' | 'skipped'>('all');
  const [expandedQId, setExpandedQId] = useState<string | null>(null);

  useEffect(() => {
    // Read last result from sessionStorage
    const saved = sessionStorage.getItem('last_exam_result');
    if (!saved) {
      navigate('/');
      return;
    }

    try {
      const parsed: ExamResult = JSON.parse(saved);
      setResult(parsed);

      // Trigger celebratory confetti if passed
      if (parsed.percentage >= 50) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      }

      // Fetch questions for detailed review
      getQuestionsByTestId(parsed.testId).then(qs => {
        setQuestions(qs);
        setLoadingQuestions(false);
      });
    } catch (e) {
      navigate('/');
    }
  }, [navigate]);

  if (!result) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    generateResultPDF(result);
  };

  const handleShare = () => {
    const text = `🎯 I scored ${result.score}/${result.totalMarks} (${result.percentage}%) on "${result.testTitle}" at Smart Exam Portal! Try it now!`;
    if (navigator.share) {
      navigator.share({ title: 'My Exam Result', text, url: window.location.href }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 3000);
    }
  };

  // Filtered questions for review
  const filteredQuestions = questions.filter(q => {
    const resp = result.responses[q.id];
    const sel = resp?.selectedOptions || [];
    const isSkipped = sel.length === 0;

    let isCorrect = false;
    if (q.type === 'multiple') {
      const corrArr = Array.isArray(q.correctAnswer) ? q.correctAnswer : [q.correctAnswer];
      isCorrect = [...sel].sort().join(',') === [...corrArr].sort().join(',');
    } else {
      const corrStr = Array.isArray(q.correctAnswer) ? q.correctAnswer[0] : q.correctAnswer;
      isCorrect = sel[0] === corrStr;
    }

    if (filterType === 'correct') return !isSkipped && isCorrect;
    if (filterType === 'wrong') return !isSkipped && !isCorrect;
    if (filterType === 'skipped') return isSkipped;
    return true;
  });

  const isPassed = result.percentage >= 40;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors py-8 px-4 sm:px-6 lg:px-8 print:bg-white print:text-black">
      <div className="max-w-4xl mx-auto">
        
        {/* Scorecard Hero Banner */}
        <div className={`rounded-3xl p-6 sm:p-10 shadow-xl border text-white mb-8 relative overflow-hidden print:border-black ${
          isPassed 
            ? 'bg-gradient-to-br from-emerald-600 via-teal-600 to-indigo-700 border-emerald-500/30' 
            : 'bg-gradient-to-br from-slate-800 via-indigo-900 to-slate-900 border-slate-700'
        }`}>
          <div className="relative z-10">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-white">
                <Trophy className="w-4 h-4 text-amber-300" />
                <span>Official Scorecard</span>
              </div>

              <div className="flex items-center gap-2 print:hidden">
                <button
                  onClick={handleDownloadPDF}
                  className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white font-bold text-xs px-3.5 py-2 rounded-xl backdrop-blur-md transition-all cursor-pointer"
                  title="Download PDF"
                >
                  <Download className="w-4 h-4" />
                  <span>Download PDF</span>
                </button>

                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white font-bold text-xs px-3.5 py-2 rounded-xl backdrop-blur-md transition-all cursor-pointer"
                  title="Print Result"
                >
                  <Printer className="w-4 h-4" />
                  <span className="hidden sm:inline">Print</span>
                </button>

                <button
                  onClick={handleShare}
                  className="flex items-center gap-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs px-3.5 py-2 rounded-xl transition-all cursor-pointer shadow"
                >
                  <Share2 className="w-4 h-4" />
                  <span>{copiedShare ? 'Copied Link!' : 'Share Result'}</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div>
                <p className="text-xs uppercase tracking-wider font-bold text-white/80">Candidate Name</p>
                <h1 className="text-2xl sm:text-3xl font-black text-white">{result.studentName}</h1>
                <p className="text-sm text-white/90 mt-1">{result.testTitle} ({result.category})</p>
                
                <div className="mt-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-xl bg-white/20 backdrop-blur-md text-xs font-bold text-white border border-white/20">
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Result Status: {isPassed ? 'QUALIFIED / PASSED' : 'NEEDS IMPROVEMENT'}</span>
                </div>
              </div>

              {/* Score Display Ring */}
              <div className="flex flex-col items-center justify-center p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 text-center">
                <span className="text-xs uppercase font-bold text-white/80 tracking-widest">Final Score</span>
                <div className="text-4xl sm:text-5xl font-black text-amber-300 my-1">
                  {result.score} <span className="text-2xl font-normal text-white/80">/ {result.totalMarks}</span>
                </div>
                <span className="text-lg font-bold text-white">{result.percentage}% Accuracy</span>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Metrics Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-center">
            <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1" />
            <span className="text-[11px] font-bold text-slate-400 uppercase">Correct</span>
            <p className="text-xl font-black text-emerald-600 dark:text-emerald-400">{result.correctCount}</p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-center">
            <XCircle className="w-6 h-6 text-rose-500 mx-auto mb-1" />
            <span className="text-[11px] font-bold text-slate-400 uppercase">Wrong</span>
            <p className="text-xl font-black text-rose-600 dark:text-rose-400">{result.wrongCount}</p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-center">
            <HelpCircle className="w-6 h-6 text-slate-400 mx-auto mb-1" />
            <span className="text-[11px] font-bold text-slate-400 uppercase">Skipped</span>
            <p className="text-xl font-black text-slate-600 dark:text-slate-300">{result.skippedCount}</p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-center">
            <Clock className="w-6 h-6 text-amber-500 mx-auto mb-1" />
            <span className="text-[11px] font-bold text-slate-400 uppercase">Time Spent</span>
            <p className="text-xl font-black text-slate-800 dark:text-slate-200">
              {Math.floor(result.timeTakenSeconds / 60)}m {result.timeTakenSeconds % 60}s
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-10 print:hidden">
          <button
            onClick={() => navigate(`/test/${result.testId}`)}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-sm rounded-xl transition-all cursor-pointer shadow"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Re-attempt Test</span>
          </button>

          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition-all cursor-pointer shadow-md shadow-blue-500/20"
          >
            <Home className="w-4 h-4" />
            <span>Back to Home</span>
          </button>
        </div>

        {/* Detailed Solutions & Answer Review Section */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-md">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                Detailed Solutions & Answer Key Review
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Review your response against correct answers and step-by-step explanations.
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold print:hidden">
              <button
                onClick={() => setFilterType('all')}
                className={`px-3 py-1.5 rounded-lg transition-all ${filterType === 'all' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-600 dark:text-slate-400'}`}
              >
                All ({questions.length})
              </button>
              <button
                onClick={() => setFilterType('correct')}
                className={`px-3 py-1.5 rounded-lg transition-all ${filterType === 'correct' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400'}`}
              >
                Correct ({result.correctCount})
              </button>
              <button
                onClick={() => setFilterType('wrong')}
                className={`px-3 py-1.5 rounded-lg transition-all ${filterType === 'wrong' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400'}`}
              >
                Wrong ({result.wrongCount})
              </button>
              <button
                onClick={() => setFilterType('skipped')}
                className={`px-3 py-1.5 rounded-lg transition-all ${filterType === 'skipped' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400'}`}
              >
                Skipped ({result.skippedCount})
              </button>
            </div>
          </div>

          {loadingQuestions ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              Loading detailed answer explanations...
            </div>
          ) : (
            <div className="space-y-4">
              {filteredQuestions.map((q, idx) => {
                const resp = result.responses[q.id];
                const selected = resp?.selectedOptions || [];
                const isSkipped = selected.length === 0;

                let isCorrect = false;
                if (q.type === 'multiple') {
                  const corrArr = Array.isArray(q.correctAnswer) ? q.correctAnswer : [q.correctAnswer];
                  isCorrect = [...selected].sort().join(',') === [...corrArr].sort().join(',');
                } else {
                  const corrStr = Array.isArray(q.correctAnswer) ? q.correctAnswer[0] : q.correctAnswer;
                  isCorrect = selected[0] === corrStr;
                }

                const isExpanded = expandedQId === q.id || filterType !== 'all';

                return (
                  <div
                    key={q.id}
                    className={`rounded-2xl border p-4 sm:p-5 transition-all ${
                      isSkipped
                        ? 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30'
                        : isCorrect
                        ? 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/30 dark:bg-emerald-950/20'
                        : 'border-rose-200 dark:border-rose-900/60 bg-rose-50/30 dark:bg-rose-950/20'
                    }`}
                  >
                    <div
                      onClick={() => setExpandedQId(isExpanded ? null : q.id)}
                      className="flex items-start justify-between gap-3 cursor-pointer select-none"
                    >
                      <div className="flex items-start gap-3">
                        <span className={`w-7 h-7 rounded-lg font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 ${
                          isSkipped
                            ? 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                            : isCorrect
                            ? 'bg-emerald-600 text-white'
                            : 'bg-rose-600 text-white'
                        }`}>
                          {idx + 1}
                        </span>

                        <div>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug">
                            {q.question}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[11px] font-semibold text-slate-500">
                              {q.subject}
                            </span>
                            <span className="text-[11px] font-bold">
                              {isSkipped ? (
                                <span className="text-slate-500">Skipped (0 Marks)</span>
                              ) : isCorrect ? (
                                <span className="text-emerald-600 dark:text-emerald-400">+{q.marks || 2} Marks (Correct)</span>
                              ) : (
                                <span className="text-rose-600 dark:text-rose-400">Incorrect</span>
                              )}
                            </span>
                          </div>
                        </div>
                      </div>

                      <button className="text-slate-400 p-1">
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </button>
                    </div>

                    {/* Detailed Answer Breakdown */}
                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-slate-200/80 dark:border-slate-800 space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          {q.options?.map(opt => {
                            const isUserChosen = selected.includes(opt.id);
                            const corrArray = Array.isArray(q.correctAnswer) ? q.correctAnswer : [q.correctAnswer];
                            const isRightOpt = corrArray.includes(opt.id);

                            let optStyle = 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200';
                            if (isRightOpt) {
                              optStyle = 'border-emerald-500 bg-emerald-100/80 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-200 font-bold';
                            } else if (isUserChosen && !isRightOpt) {
                              optStyle = 'border-rose-500 bg-rose-100/80 dark:bg-rose-950/80 text-rose-900 dark:text-rose-200 font-bold';
                            }

                            return (
                              <div
                                key={opt.id}
                                className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 ${optStyle}`}
                              >
                                <div className="flex items-center gap-2">
                                  <span className="font-extrabold uppercase">{opt.id}.</span>
                                  <span>{opt.text}</span>
                                </div>
                                <div>
                                  {isRightOpt && <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
                                  {isUserChosen && !isRightOpt && <X className="w-4 h-4 text-rose-600 dark:text-rose-400" />}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Explanation Box */}
                        {q.explanation && (
                          <div className="p-3.5 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-900/60 text-xs text-slate-800 dark:text-slate-200 leading-relaxed">
                            <span className="font-extrabold text-blue-700 dark:text-blue-300 block mb-1">
                              💡 Step-by-Step Explanation:
                            </span>
                            <p>{q.explanation}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
