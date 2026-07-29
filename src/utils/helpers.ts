import { ExamResult, UserResponse, Question, Test } from '../types';

export function calculateScoreAndStats(
  test: Test,
  questions: Question[],
  userResponses: Record<string, UserResponse>
) {
  let score = 0;
  let correctCount = 0;
  let wrongCount = 0;
  let skippedCount = 0;

  questions.forEach(q => {
    const resp = userResponses[q.id];
    const selected = resp?.selectedOptions || [];

    if (!selected || selected.length === 0) {
      skippedCount++;
      return;
    }

    let isCorrect = false;
    if (q.type === 'multiple') {
      const correctArr = Array.isArray(q.correctAnswer) ? q.correctAnswer : [q.correctAnswer];
      const sortedSel = [...selected].sort();
      const sortedCorr = [...correctArr].sort();
      isCorrect = sortedSel.length === sortedCorr.length && sortedSel.every((val, index) => val === sortedCorr[index]);
    } else {
      const corrStr = Array.isArray(q.correctAnswer) ? q.correctAnswer[0] : q.correctAnswer;
      isCorrect = selected[0] === corrStr;
    }

    const marks = q.marks || (test.totalMarks / (test.totalQuestions || 1));

    if (isCorrect) {
      correctCount++;
      score += marks;
    } else {
      wrongCount++;
      score -= test.negativeMarking || 0;
    }
  });

  // Ensure minimum score is 0 or actual negative if allowed
  const finalScore = Math.max(0, parseFloat(score.toFixed(2)));
  const totalMarks = test.totalMarks || (questions.length * 2);
  const percentage = parseFloat(((finalScore / totalMarks) * 100).toFixed(2));

  return {
    score: finalScore,
    totalMarks,
    percentage,
    correctCount,
    wrongCount,
    skippedCount,
    totalQuestions: questions.length,
  };
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export function getDifficultyColor(difficulty: string): string {
  switch (difficulty?.toLowerCase()) {
    case 'easy':
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
    case 'hard':
      return 'bg-rose-100 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300 border-rose-200 dark:border-rose-800';
    case 'medium':
    default:
      return 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 dark:border-amber-800';
  }
}
