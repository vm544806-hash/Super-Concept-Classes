import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Test, Question, UserResponse, StudentInfo, ExamResult } from '../types';
import { getTestById, getQuestionsByTestId, submitTestResult } from '../firebase/services';
import { ExamHeader } from '../components/exam/ExamHeader';
import { QuestionPalette } from '../components/exam/QuestionPalette';
import { QuestionCard } from '../components/exam/QuestionCard';
import { SubmitModal } from '../components/exam/SubmitModal';
import { calculateScoreAndStats } from '../utils/helpers';
import { AlertCircle, Loader2 } from 'lucide-react';

export const ExamPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [test, setTest] = useState<Test | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  // Student Info from session
  const [studentInfo, setStudentInfo] = useState<StudentInfo>({
    name: 'Candidate',
    language: 'English',
  });

  // State
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [userResponses, setUserResponses] = useState<Record<string, UserResponse>>({});
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState(900); // 15 mins default
  const [startTime] = useState<number>(Date.now());
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isAutoSubmit, setIsAutoSubmit] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize
  useEffect(() => {
    const initExam = async () => {
      if (!id) return;

      // Read student info from session
      const savedInfoStr = sessionStorage.getItem(`exam_student_${id}`);
      if (savedInfoStr) {
        try {
          setStudentInfo(JSON.parse(savedInfoStr));
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

    const timeTakenSeconds = Math.round((Date.now() - startTime) / 1000);
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

  if (!test || questions.length === 0) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4 text-center">
        <AlertCircle className="w-16 h-16 text-rose-500 mb-4" />
        <h2 className="text-2xl font-bold">No Questions Found</h2>
        <p className="text-sm text-slate-400 mt-2 mb-6">This mock test does not have any active questions linked yet.</p>
        <button
          onClick={() => navigate('/')}
          className="bg-blue-600 px-6 py-2.5 rounded-xl font-bold hover:bg-blue-500"
        >
          Return Home
        </button>
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
