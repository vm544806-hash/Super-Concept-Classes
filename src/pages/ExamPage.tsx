import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Test, Question, UserResponse, StudentInfo, ExamResult } from '../types';
import { getTestById, getQuestionsByTestId, submitTestResult, checkExistingAttempt } from '../firebase/services';
import { ExamHeader } from '../components/exam/ExamHeader';
import { QuestionPalette } from '../components/exam/QuestionPalette';
import { QuestionCard } from '../components/exam/QuestionCard';
import { SubmitModal } from '../components/exam/SubmitModal';
import { calculateScoreAndStats } from '../utils/helpers';
import { computeTestStatus, formatDateTime, getTimeDifferenceText } from '../utils/testHelpers';
import { AlertCircle, Loader2, Award, Home, ShieldAlert, BookOpen, Clock, CheckCircle2, ArrowLeft } from 'lucide-react';

export const ExamPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isSolutionModeRequested = searchParams.get('mode') === 'solution';

  const [test, setTest] = useState<Test | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [alreadySubmittedResult, setAlreadySubmittedResult] = useState<ExamResult | null>(null);

  // Student Info from session
  const [studentInfo, setStudentInfo] = useState<StudentInfo>({
    name: localStorage.getItem('lastStudentName') || 'Candidate',
    language: 'English',
  });

  // State
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [userResponses, setUserResponses] = useState<Record<string, UserResponse>>({});
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState(900); // 15 mins default
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isAutoSubmit, setIsAutoSubmit] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize
  useEffect(() => {
    const initExam = async () => {
      if (!id) return;

      let currentInfo = studentInfo;
      // Read student info from session
      const savedInfoStr = sessionStorage.getItem(`exam_student_${id}`);
      if (savedInfoStr) {
        try {
          currentInfo = JSON.parse(savedInfoStr);
          setStudentInfo(currentInfo);
        } catch (e) {}
      }

      try {
        const testData = await getTestById(id);
        if (!testData) {
          setLoading(false);
          return;
        }
        setTest(testData);
        setTimeRemainingSeconds(testData.durationMins * 60);
        setStartTime(Date.now());

        const qList = await getQuestionsByTestId(id);
        setQuestions(qList);

        // Load saved attempt progress from sessionStorage if any
        const savedResp = sessionStorage.getItem(`exam_progress_${id}`);
        if (savedResp) {
          try {
            setUserResponses(JSON.parse(savedResp));
          } catch (e) {}
        }
      } catch (err) {
        console.error('Error loading exam:', err);
      } finally {
        setLoading(false);
      }
    };

    initExam();
  }, [id]);

  // Countdown timer effect
  useEffect(() => {
    if (loading || !test || timeRemainingSeconds <= 0 || isSubmitting) return;

    const timer = setInterval(() => {
      setTimeRemainingSeconds(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsAutoSubmit(true);
          setShowSubmitModal(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loading, test, isSubmitting]);

  // Auto-save responses to sessionStorage
  const saveProgressToSession = (newResponses: Record<string, UserResponse>) => {
    if (id) {
      sessionStorage.setItem(`exam_progress_${id}`, JSON.stringify(newResponses));
    }
  };

  const handleOptionToggle = (optionId: string) => {
    const currentQ = questions[currentQIndex];
    if (!currentQ) return;

    setUserResponses(prev => {
      const existing = prev[currentQ.id]?.selectedOptions || [];
      let updatedSelected: string[] = [];

      if (currentQ.type === 'multiple') {
        if (existing.includes(optionId)) {
          updatedSelected = existing.filter(item => item !== optionId);
        } else {
          updatedSelected = [...existing, optionId];
        }
      } else {
        // Single choice / True-False / Paragraph
        updatedSelected = [optionId];
      }

      const updatedResp: Record<string, UserResponse> = {
        ...prev,
        [currentQ.id]: {
          questionId: currentQ.id,
          selectedOptions: updatedSelected,
          status: updatedSelected.length > 0 ? 'answered' : 'skipped',
        },
      };

      saveProgressToSession(updatedResp);
      return updatedResp;
    });
  };

  const handleClearResponse = () => {
    const currentQ = questions[currentQIndex];
    if (!currentQ) return;

    setUserResponses(prev => {
      const updatedResp: Record<string, UserResponse> = {
        ...prev,
        [currentQ.id]: {
          questionId: currentQ.id,
          selectedOptions: [],
          status: 'skipped',
        },
      };

      saveProgressToSession(updatedResp);
      return updatedResp;
    });
  };

  const handleMarkForReview = () => {
    const currentQ = questions[currentQIndex];
    if (!currentQ) return;

    setUserResponses(prev => {
      const existing = prev[currentQ.id]?.selectedOptions || [];
      const hasSel = existing.length > 0;

      const updatedResp: Record<string, UserResponse> = {
        ...prev,
        [currentQ.id]: {
          questionId: currentQ.id,
          selectedOptions: existing,
          status: hasSel ? 'marked_answered' : 'marked',
        },
      };

      saveProgressToSession(updatedResp);
      return updatedResp;
    });

    if (currentQIndex < questions.length - 1) {
      setCurrentQIndex(currentQIndex + 1);
    }
  };

  const handleNext = () => {
    const currentQ = questions[currentQIndex];
    if (currentQ && !userResponses[currentQ.id]) {
      // Mark as skipped/visited
      setUserResponses(prev => {
        const updated = {
          ...prev,
          [currentQ.id]: {
            questionId: currentQ.id,
            selectedOptions: [],
            status: 'skipped' as const,
          },
        };
        saveProgressToSession(updated);
        return updated;
      });
    }

    if (currentQIndex < questions.length - 1) {
      setCurrentQIndex(currentQIndex + 1);
    } else {
      setShowSubmitModal(true);
    }
  };

  const handlePrev = () => {
    if (currentQIndex > 0) {
      setCurrentQIndex(currentQIndex - 1);
    }
  };

  const handleFinalSubmit = async () => {
    if (!test || isSubmitting) return;
    setIsSubmitting(true);

    const totalDurationSecs = (test.durationMins || 15) * 60;
    const elapsedFromTimer = Math.max(1, totalDurationSecs - timeRemainingSeconds);
    const elapsedFromClock = Math.max(1, Math.round((Date.now() - startTime) / 1000));
    const timeTakenSeconds = elapsedFromTimer > 0 ? elapsedFromTimer : elapsedFromClock;

    const stats = calculateScoreAndStats(test, questions, userResponses);

    const resultObj: ExamResult = {
      id: `result-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      testId: test.id,
      testTitle: test.title,
      category: test.category,
      studentName: studentInfo.name || 'Candidate',
      studentMobile: studentInfo.mobile,
      studentEmail: studentInfo.email,
      score: stats.score,
      totalMarks: stats.totalMarks,
      percentage: stats.percentage,
      correctCount: stats.correctCount,
      wrongCount: stats.wrongCount,
      skippedCount: stats.skippedCount,
      totalQuestions: questions.length,
      timeTakenSeconds,
      totalDurationSeconds: test.durationMins * 60,
      submittedAt: new Date().toISOString(),
      responses: userResponses,
    };

    try {
      await submitTestResult(resultObj);
      sessionStorage.setItem('last_exam_result', JSON.stringify(resultObj));
      sessionStorage.removeItem(`exam_progress_${test.id}`);
      navigate('/result');
    } catch (err) {
      console.error('Error submitting test:', err);
      // Fallback
      sessionStorage.setItem('last_exam_result', JSON.stringify(resultObj));
      navigate('/result');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-3" />
        <p className="text-sm font-semibold">Loading Examination Workspace...</p>
      </div>
    );
  }

  if (alreadySubmittedResult) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4 text-center">
        <div className="max-w-md w-full bg-slate-900 border border-amber-500/30 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          <div className="w-16 h-16 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-amber-500/20">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-white mb-2">Examination Already Attempted</h2>
          <p className="text-xs text-slate-400 mb-6 leading-relaxed">
            Candidate <strong className="text-amber-400">{alreadySubmittedResult.studentName}</strong> has already completed and submitted answers for this test paper on{' '}
            {new Date(alreadySubmittedResult.submittedAt || Date.now()).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}.
            Re-taking tests is strictly disabled to ensure single-attempt exam rules.
          </p>

          <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700 mb-6 text-left space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-300">
              <span>Score Achieved:</span>
              <strong className="text-emerald-400">{alreadySubmittedResult.score} / {alreadySubmittedResult.totalMarks} Marks</strong>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Percentage:</span>
              <strong className="text-blue-400">{alreadySubmittedResult.percentage}%</strong>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => {
                sessionStorage.setItem('last_exam_result', JSON.stringify(alreadySubmittedResult));
                navigate('/result');
              }}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Award className="w-4 h-4" />
              <span>View Your Score Card</span>
            </button>

            <button
              onClick={() => navigate('/')}
              className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer"
            >
              <Home className="w-4 h-4" />
              <span>Return to Homepage</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!test || questions.length === 0) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4 text-center">
        <AlertCircle className="w-16 h-16 text-rose-500 mb-4" />
        <h2 className="text-2xl font-bold">No Questions Available.</h2>
        <p className="text-sm text-slate-400 mt-2 mb-6">No real questions are available for this test in the database.</p>
        <button
          onClick={() => navigate('/')}
          className="bg-blue-600 px-6 py-2.5 rounded-xl font-bold hover:bg-blue-500 cursor-pointer"
        >
          Return Home
        </button>
      </div>
    );
  }

  const testStatus = computeTestStatus(test);

  // 1. Upcoming Scheduled Test Screen
  if (testStatus === 'upcoming' && !isSolutionModeRequested) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4 text-center">
        <div className="max-w-md w-full bg-slate-900 border border-amber-500/40 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          <div className="w-16 h-16 bg-amber-500/10 text-amber-400 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-amber-500/20">
            <Clock className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-white mb-2">Test Scheduled (समय अभी पूरा नहीं हुआ)</h2>
          <p className="text-xs text-slate-300 mb-6 leading-relaxed">
            This test paper is scheduled to automatically go <strong>LIVE</strong> on{' '}
            <span className="text-amber-400 font-bold">{formatDateTime(test.startTime)}</span> (in {getTimeDifferenceText(test.startTime)}). Candidate exam entry will open at that exact time.
          </p>

          <button
            onClick={() => navigate('/')}
            className="w-full py-3.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-extrabold text-sm rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Return to Test Portal</span>
          </button>
        </div>
      </div>
    );
  }

  // 2. Read-Only Solution Mode View for Expired / Solution Requests
  if (isSolutionModeRequested || testStatus === 'expired') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        {/* Solution Header Bar */}
        <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-xl hover:bg-slate-700 cursor-pointer transition-all"
              title="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-amber-400 uppercase tracking-wide bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                  Solution Paper View
                </span>
                {testStatus === 'expired' && (
                  <span className="text-[10px] font-extrabold text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                    Expired Exam
                  </span>
                )}
              </div>
              <h1 className="text-sm sm:text-base font-bold text-white line-clamp-1">{test.title}</h1>
            </div>
          </div>

          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-extrabold rounded-xl flex items-center gap-1.5 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Home</span>
          </button>
        </header>

        {/* Questions & Solutions List */}
        <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 space-y-6 pb-16">
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between text-xs text-slate-400">
            <span>Total Questions: <strong className="text-white">{questions.length}</strong></span>
            <span>Total Marks: <strong className="text-white">{test.totalMarks}</strong></span>
            <span>Negative Mark: <strong className="text-rose-400">-{test.negativeMarking}</strong></span>
          </div>

          {questions.map((q, idx) => (
            <div key={q.id || idx} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
              <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 bg-blue-600/20 text-blue-400 font-extrabold text-xs rounded-lg flex items-center justify-center border border-blue-500/30">
                    Q{idx + 1}
                  </span>
                  <span className="text-xs text-slate-400 uppercase font-semibold">
                    {q.subject || test.category} {q.topic ? `• ${q.topic}` : ''}
                  </span>
                </div>
                <span className="text-[11px] text-emerald-400 font-extrabold bg-emerald-950 border border-emerald-800/80 px-2 py-0.5 rounded">
                  +{q.marks || test.marksPerQuestion || 2} Marks
                </span>
              </div>

              {/* Question Text */}
              <p className="text-sm font-semibold text-slate-100 leading-relaxed whitespace-pre-wrap">
                {q.questionText}
              </p>

              {/* Question Image if any */}
              {q.imageUrl && (
                <img src={q.imageUrl} alt="Question Diagram" className="max-h-60 rounded-xl border border-slate-800 object-contain my-2" />
              )}

              {/* Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                {q.options.map((opt, optIdx) => {
                  const isCorrect = optIdx === q.correctOption;
                  return (
                    <div
                      key={optIdx}
                      className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all ${
                        isCorrect
                          ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200'
                          : 'bg-slate-800/60 border-slate-700/60 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={`w-6 h-6 rounded-lg text-[10px] font-black flex items-center justify-center ${
                          isCorrect ? 'bg-emerald-500 text-slate-950' : 'bg-slate-700 text-slate-300'
                        }`}>
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span>{opt}</span>
                      </div>
                      {isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                    </div>
                  );
                })}
              </div>

              {/* Explanation Box */}
              {q.explanation && (
                <div className="p-3.5 bg-blue-950/30 border border-blue-800/60 rounded-xl text-xs space-y-1">
                  <div className="flex items-center gap-1.5 text-blue-400 font-extrabold uppercase text-[10px]">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Answer Explanation (उत्तर व्याख्या)</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">{q.explanation}</p>
                </div>
              )}
            </div>
          ))}
        </main>
      </div>
    );
  }

  const currentQ = questions[currentQIndex];

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between selection:bg-blue-500 selection:text-white">
      
      {/* Exam Header */}
      <ExamHeader
        testTitle={test.title}
        category={test.category}
        currentQIndex={currentQIndex}
        totalQuestions={questions.length}
        timeRemainingSeconds={timeRemainingSeconds}
        onTimeUp={() => {
          setIsAutoSubmit(true);
          setShowSubmitModal(true);
        }}
        onSubmitClick={() => setShowSubmitModal(true)}
        studentName={studentInfo.name}
      />

      {/* Main Examination Grid */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-4 gap-6 my-2">
        
        {/* Left 3 cols: Active Question Card */}
        <div className="lg:col-span-3">
          <QuestionCard
            question={currentQ}
            qIndex={currentQIndex}
            totalQuestions={questions.length}
            userResponse={userResponses[currentQ.id]}
            onOptionToggle={handleOptionToggle}
            onClearResponse={handleClearResponse}
            onMarkForReview={handleMarkForReview}
            onNext={handleNext}
            onPrev={handlePrev}
          />
        </div>

        {/* Right 1 col: Question Palette */}
        <div className="lg:col-span-1">
          <QuestionPalette
            totalQuestions={questions.length}
            currentQIndex={currentQIndex}
            userResponses={userResponses}
            questionIds={questions.map(q => q.id)}
            onSelectQuestion={(idx) => setCurrentQIndex(idx)}
          />
        </div>

      </main>

      {/* Submit Confirmation Modal */}
      {showSubmitModal && (
        <SubmitModal
          totalQuestions={questions.length}
          userResponses={userResponses}
          questionIds={questions.map(q => q.id)}
          timeRemainingSeconds={timeRemainingSeconds}
          onConfirmSubmit={handleFinalSubmit}
          onClose={() => setShowSubmitModal(false)}
          isAutoSubmit={isAutoSubmit}
        />
      )}

    </div>
  );
};
