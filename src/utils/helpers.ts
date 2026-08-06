import { ExamResult, UserResponse, Question, Test, DifficultyLevel, QuestionType } from '../types';

export function normalizeQuestionJSON(rawItem: any, targetTestId?: string): Partial<Question> | null {
  if (!rawItem || typeof rawItem !== 'object') return null;

  // 1. Extract Question Statement
  const questionText = 
    rawItem.question ||
    rawItem.questionText ||
    rawItem.question_text ||
    rawItem.q ||
    rawItem.statement ||
    rawItem.title ||
    rawItem.text ||
    '';

  if (!String(questionText).trim()) {
    return null; // Invalid question statement
  }

  // 2. Extract Options
  let parsedOptions: { id: string; text: string }[] = [];

  if (Array.isArray(rawItem.options)) {
    parsedOptions = rawItem.options.map((opt: any, idx: number) => {
      const defaultId = String.fromCharCode(65 + idx); // A, B, C, D...
      if (typeof opt === 'string' || typeof opt === 'number') {
        return { id: defaultId, text: String(opt).trim() };
      } else if (opt && typeof opt === 'object') {
        const optId = String(opt.id || opt.label || opt.key || opt.option || defaultId).toUpperCase().trim();
        const optText = String(opt.text || opt.value || opt.statement || opt.content || opt.title || '').trim();
        return { id: optId, text: optText };
      }
      return { id: defaultId, text: '' };
    });
  } else if (rawItem.options && typeof rawItem.options === 'object') {
    // e.g. { "A": "Patna", "B": "Gaya", "C": "Muzaffarpur", "D": "Bhagalpur" }
    const entries = Object.entries(rawItem.options);
    parsedOptions = entries.map(([key, val], idx) => {
      const optId = key.length === 1 ? key.toUpperCase() : String.fromCharCode(65 + idx);
      return { id: optId, text: String(val).trim() };
    });
  } else {
    // Check for individual option keys: optionA, optionB, optA, optB, a, b, option1, option2...
    const optA = rawItem.optionA ?? rawItem.option_a ?? rawItem.optA ?? rawItem.opt_a ?? rawItem.a ?? rawItem.option1;
    const optB = rawItem.optionB ?? rawItem.option_b ?? rawItem.optB ?? rawItem.opt_b ?? rawItem.b ?? rawItem.option2;
    const optC = rawItem.optionC ?? rawItem.option_c ?? rawItem.optC ?? rawItem.opt_c ?? rawItem.c ?? rawItem.option3;
    const optD = rawItem.optionD ?? rawItem.option_d ?? rawItem.optD ?? rawItem.opt_d ?? rawItem.d ?? rawItem.option4;

    if (optA !== undefined || optB !== undefined || optC !== undefined || optD !== undefined) {
      if (optA !== undefined) parsedOptions.push({ id: 'A', text: String(optA).trim() });
      if (optB !== undefined) parsedOptions.push({ id: 'B', text: String(optB).trim() });
      if (optC !== undefined) parsedOptions.push({ id: 'C', text: String(optC).trim() });
      if (optD !== undefined) parsedOptions.push({ id: 'D', text: String(optD).trim() });
    }
  }

  // Ensure at least 4 options exist if fewer were provided
  if (parsedOptions.length === 0) {
    parsedOptions = [
      { id: 'A', text: '' },
      { id: 'B', text: '' },
      { id: 'C', text: '' },
      { id: 'D', text: '' },
    ];
  }

  // 3. Extract Correct Answer
  const rawAns = rawItem.correctAnswer ??
    rawItem.correct_answer ??
    rawItem.correct ??
    rawItem.answer ??
    rawItem.ans ??
    rawItem.rightAnswer ??
    rawItem.right_answer ??
    '';

  let finalAns = 'A';
  const strAns = String(rawAns).trim();

  if (/^[a-dA-D]$/.test(strAns)) {
    finalAns = strAns.toUpperCase();
  } else if (/^[1-4]$/.test(strAns)) {
    const num = parseInt(strAns, 10);
    finalAns = String.fromCharCode(64 + num); // 1 -> A, 2 -> B...
  } else if (strAns) {
    // Check if the answer string matches option text
    const matchedOpt = parsedOptions.find(o => o.text.toLowerCase() === strAns.toLowerCase());
    if (matchedOpt) {
      finalAns = matchedOpt.id;
    }
  }

  // 4. Extract difficulty
  let difficulty: DifficultyLevel = 'Medium';
  const rawDiff = String(rawItem.difficulty || rawItem.level || '').toLowerCase();
  if (rawDiff.includes('easy') || rawDiff.includes('आसान')) difficulty = 'Easy';
  else if (rawDiff.includes('hard') || rawDiff.includes('difficult') || rawDiff.includes('कठिन')) difficulty = 'Hard';

  return {
    id: rawItem.id || undefined,
    testId: targetTestId || rawItem.testId || '',
    question: String(questionText).trim(),
    imageUrl: String(rawItem.imageUrl || rawItem.image || rawItem.img || '').trim(),
    paragraphText: String(rawItem.paragraphText || rawItem.passage || rawItem.paragraph || rawItem.comprehension || '').trim(),
    type: (rawItem.type === 'multiple' ? 'multiple' : 'single') as QuestionType,
    options: parsedOptions,
    correctAnswer: finalAns,
    explanation: String(rawItem.explanation || rawItem.explanationText || rawItem.exp || rawItem.solution || '').trim(),
    subject: String(rawItem.subject || rawItem.subjectName || rawItem.category || 'General Knowledge').trim(),
    topic: String(rawItem.topic || rawItem.topicName || rawItem.chapter || '').trim(),
    difficulty: difficulty,
    marks: Number(rawItem.marks || rawItem.mark || rawItem.score) || 2,
  };
}

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
