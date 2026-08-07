import { supabase, isSupabaseConfigured } from './client';
import { Test, Question, Notice, SiteSettings, ExamResult, LeaderboardEntry } from '../types';

export { supabase, isSupabaseConfigured };

// Complete, warning-free SQL setup script for Supabase SQL Editor
export const SUPABASE_SQL_SETUP = `-- =========================================================
-- SMART EXAM PORTAL - COMPLETE SUPABASE DUAL-DB SETUP SCRIPT
-- Paste this entire script into your Supabase SQL Editor
-- Dashboard -> SQL Editor -> New Query -> Run
-- =========================================================

-- 1. Create or Update Tests Table
CREATE TABLE IF NOT EXISTS public.tests (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  category TEXT DEFAULT 'Class 10th',
  "imageUrl" TEXT DEFAULT '',
  "durationMins" INT DEFAULT 30,
  "totalQuestions" INT DEFAULT 0,
  "totalMarks" NUMERIC DEFAULT 100,
  "negativeMarking" NUMERIC DEFAULT 0,
  "passingMarks" NUMERIC DEFAULT 40,
  instructions JSONB DEFAULT '[]'::jsonb,
  "isPublished" BOOLEAN DEFAULT true,
  "isPopular" BOOLEAN DEFAULT false,
  "isFeatured" BOOLEAN DEFAULT false,
  "allowRetake" BOOLEAN DEFAULT true,
  "testVersion" INT DEFAULT 1,
  "attemptsCount" INT DEFAULT 0,
  "createdAt" TEXT,
  "updatedAt" TEXT
);

-- Schema migration columns for tests
ALTER TABLE public.tests ADD COLUMN IF NOT EXISTS description TEXT DEFAULT '';
ALTER TABLE public.tests ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Class 10th';
ALTER TABLE public.tests ADD COLUMN IF NOT EXISTS "imageUrl" TEXT DEFAULT '';
ALTER TABLE public.tests ADD COLUMN IF NOT EXISTS "durationMins" INT DEFAULT 30;
ALTER TABLE public.tests ADD COLUMN IF NOT EXISTS "totalQuestions" INT DEFAULT 0;
ALTER TABLE public.tests ADD COLUMN IF NOT EXISTS "totalMarks" NUMERIC DEFAULT 100;
ALTER TABLE public.tests ADD COLUMN IF NOT EXISTS "negativeMarking" NUMERIC DEFAULT 0;
ALTER TABLE public.tests ADD COLUMN IF NOT EXISTS "passingMarks" NUMERIC DEFAULT 40;
ALTER TABLE public.tests ADD COLUMN IF NOT EXISTS instructions JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.tests ADD COLUMN IF NOT EXISTS "isPublished" BOOLEAN DEFAULT true;
ALTER TABLE public.tests ADD COLUMN IF NOT EXISTS "isPopular" BOOLEAN DEFAULT false;
ALTER TABLE public.tests ADD COLUMN IF NOT EXISTS "isFeatured" BOOLEAN DEFAULT false;
ALTER TABLE public.tests ADD COLUMN IF NOT EXISTS "allowRetake" BOOLEAN DEFAULT true;
ALTER TABLE public.tests ADD COLUMN IF NOT EXISTS "testVersion" INT DEFAULT 1;
ALTER TABLE public.tests ADD COLUMN IF NOT EXISTS "attemptsCount" INT DEFAULT 0;
ALTER TABLE public.tests ADD COLUMN IF NOT EXISTS "createdAt" TEXT;
ALTER TABLE public.tests ADD COLUMN IF NOT EXISTS "updatedAt" TEXT;

-- 2. Create or Update Questions Table (Drop FK constraints to avoid Postgres 23503 errors)
CREATE TABLE IF NOT EXISTS public.questions (
  id TEXT PRIMARY KEY,
  "testId" TEXT,
  question TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '[]'::jsonb,
  "correctAnswer" TEXT NOT NULL DEFAULT 'A',
  explanation TEXT DEFAULT '',
  subject TEXT DEFAULT 'General',
  topic TEXT DEFAULT '',
  difficulty TEXT DEFAULT 'Medium',
  type TEXT DEFAULT 'single',
  marks NUMERIC DEFAULT 2,
  "imageUrl" TEXT DEFAULT '',
  "paragraphText" TEXT DEFAULT '',
  "createdAt" TEXT
);

-- Drop potential strict FK constraints on questions
ALTER TABLE public.questions DROP CONSTRAINT IF EXISTS "questions_testId_fkey";
ALTER TABLE public.questions DROP CONSTRAINT IF EXISTS questions_test_id_fkey;

-- Schema migration columns for questions
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS "testId" TEXT;
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS question TEXT DEFAULT '';
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS "questionText" TEXT DEFAULT '';
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS question_text TEXT DEFAULT '';
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS options JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS "correctAnswer" TEXT DEFAULT 'A';
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS "correctOptionIndex" INT DEFAULT 0;
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS correct_option_index INT DEFAULT 0;
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS explanation TEXT DEFAULT '';
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS subject TEXT DEFAULT 'General';
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS topic TEXT DEFAULT '';
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS difficulty TEXT DEFAULT 'Medium';
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'single';
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS marks NUMERIC DEFAULT 2;
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS "imageUrl" TEXT DEFAULT '';
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS "paragraphText" TEXT DEFAULT '';
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS "createdAt" TEXT;

-- Drop strict NOT NULL constraints on legacy question columns if any exist
ALTER TABLE public.questions ALTER COLUMN question DROP NOT NULL;
ALTER TABLE public.questions ALTER COLUMN "questionText" DROP NOT NULL;
ALTER TABLE public.questions ALTER COLUMN question_text DROP NOT NULL;
ALTER TABLE public.questions ALTER COLUMN "correctOptionIndex" DROP NOT NULL;
ALTER TABLE public.questions ALTER COLUMN correctOptionIndex DROP NOT NULL;
ALTER TABLE public.questions ALTER COLUMN correct_option_index DROP NOT NULL;

-- 3. Notices Table
CREATE TABLE IF NOT EXISTS public.notices (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT DEFAULT 'General',
  date TEXT NOT NULL,
  important BOOLEAN DEFAULT false,
  type TEXT DEFAULT 'announcement',
  "linkUrl" TEXT DEFAULT ''
);

ALTER TABLE public.notices ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'General';
ALTER TABLE public.notices ADD COLUMN IF NOT EXISTS important BOOLEAN DEFAULT false;
ALTER TABLE public.notices ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'announcement';
ALTER TABLE public.notices ADD COLUMN IF NOT EXISTS "linkUrl" TEXT DEFAULT '';

-- 4. Site Settings Table
CREATE TABLE IF NOT EXISTS public.settings (
  id TEXT PRIMARY KEY DEFAULT 'general',
  data JSONB NOT NULL
);

-- 5. Exam Results Table
CREATE TABLE IF NOT EXISTS public.results (
  id TEXT PRIMARY KEY,
  "userId" TEXT,
  "userName" TEXT,
  "userEmail" TEXT,
  "studentName" TEXT,
  "studentEmail" TEXT,
  "studentMobile" TEXT,
  "testId" TEXT,
  "testTitle" TEXT,
  category TEXT DEFAULT 'Class 10th',
  score NUMERIC DEFAULT 0,
  "totalMarks" NUMERIC DEFAULT 100,
  percentage NUMERIC DEFAULT 0,
  passed BOOLEAN DEFAULT true,
  "totalQuestions" INT DEFAULT 0,
  "correctAnswers" INT DEFAULT 0,
  "wrongAnswers" INT DEFAULT 0,
  unanswered INT DEFAULT 0,
  "timeTakenSeconds" INT DEFAULT 0,
  "submittedAt" TEXT,
  "testVersion" INT DEFAULT 1,
  "userAnswers" JSONB DEFAULT '{}'::jsonb
);

ALTER TABLE public.results DROP CONSTRAINT IF EXISTS "results_testId_fkey";
ALTER TABLE public.results DROP CONSTRAINT IF EXISTS results_test_id_fkey;

-- Migration columns for results
ALTER TABLE public.results ADD COLUMN IF NOT EXISTS "userId" TEXT;
ALTER TABLE public.results ADD COLUMN IF NOT EXISTS "userName" TEXT;
ALTER TABLE public.results ADD COLUMN IF NOT EXISTS "userEmail" TEXT;
ALTER TABLE public.results ADD COLUMN IF NOT EXISTS "studentName" TEXT;
ALTER TABLE public.results ADD COLUMN IF NOT EXISTS "studentEmail" TEXT;
ALTER TABLE public.results ADD COLUMN IF NOT EXISTS "studentMobile" TEXT;
ALTER TABLE public.results ADD COLUMN IF NOT EXISTS "testId" TEXT;
ALTER TABLE public.results ADD COLUMN IF NOT EXISTS "testTitle" TEXT;
ALTER TABLE public.results ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Class 10th';
ALTER TABLE public.results ADD COLUMN IF NOT EXISTS score NUMERIC DEFAULT 0;
ALTER TABLE public.results ADD COLUMN IF NOT EXISTS "totalMarks" NUMERIC DEFAULT 100;
ALTER TABLE public.results ADD COLUMN IF NOT EXISTS percentage NUMERIC DEFAULT 0;
ALTER TABLE public.results ADD COLUMN IF NOT EXISTS passed BOOLEAN DEFAULT true;
ALTER TABLE public.results ADD COLUMN IF NOT EXISTS "totalQuestions" INT DEFAULT 0;
ALTER TABLE public.results ADD COLUMN IF NOT EXISTS "correctAnswers" INT DEFAULT 0;
ALTER TABLE public.results ADD COLUMN IF NOT EXISTS "wrongAnswers" INT DEFAULT 0;
ALTER TABLE public.results ADD COLUMN IF NOT EXISTS unanswered INT DEFAULT 0;
ALTER TABLE public.results ADD COLUMN IF NOT EXISTS "timeTakenSeconds" INT DEFAULT 0;
ALTER TABLE public.results ADD COLUMN IF NOT EXISTS "submittedAt" TEXT;
ALTER TABLE public.results ADD COLUMN IF NOT EXISTS "testVersion" INT DEFAULT 1;
ALTER TABLE public.results ADD COLUMN IF NOT EXISTS "userAnswers" JSONB DEFAULT '{}'::jsonb;

-- 6. Leaderboard Table
CREATE TABLE IF NOT EXISTS public.leaderboard (
  id TEXT PRIMARY KEY,
  "userId" TEXT,
  "userName" TEXT,
  "studentName" TEXT,
  "testId" TEXT,
  "testTitle" TEXT,
  score NUMERIC DEFAULT 0,
  "totalMarks" NUMERIC DEFAULT 100,
  percentage NUMERIC DEFAULT 0,
  rank INT DEFAULT 1,
  "timeTakenFormatted" TEXT DEFAULT '',
  "submittedAt" TEXT
);

ALTER TABLE public.leaderboard DROP CONSTRAINT IF EXISTS "leaderboard_testId_fkey";
ALTER TABLE public.leaderboard DROP CONSTRAINT IF EXISTS leaderboard_test_id_fkey;

ALTER TABLE public.leaderboard ADD COLUMN IF NOT EXISTS "userId" TEXT;
ALTER TABLE public.leaderboard ADD COLUMN IF NOT EXISTS "userName" TEXT;
ALTER TABLE public.leaderboard ADD COLUMN IF NOT EXISTS "studentName" TEXT;
ALTER TABLE public.leaderboard ADD COLUMN IF NOT EXISTS "testId" TEXT;
ALTER TABLE public.leaderboard ADD COLUMN IF NOT EXISTS "testTitle" TEXT;
ALTER TABLE public.leaderboard ADD COLUMN IF NOT EXISTS score NUMERIC DEFAULT 0;
ALTER TABLE public.leaderboard ADD COLUMN IF NOT EXISTS "totalMarks" NUMERIC DEFAULT 100;
ALTER TABLE public.leaderboard ADD COLUMN IF NOT EXISTS percentage NUMERIC DEFAULT 0;
ALTER TABLE public.leaderboard ADD COLUMN IF NOT EXISTS rank INT DEFAULT 1;
ALTER TABLE public.leaderboard ADD COLUMN IF NOT EXISTS "timeTakenFormatted" TEXT DEFAULT '';
ALTER TABLE public.leaderboard ADD COLUMN IF NOT EXISTS "submittedAt" TEXT;

-- 7. Appointments & Contacts Table
CREATE TABLE IF NOT EXISTS public.appointments (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  subject TEXT DEFAULT '',
  message TEXT DEFAULT '',
  date TEXT DEFAULT '',
  status TEXT DEFAULT 'pending',
  "createdAt" TEXT
);

-- Grant Schema & Table Access Permissions (Essential for Supabase API access)
GRANT USAGE ON SCHEMA public TO anon, authenticated, postgres, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, postgres, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, postgres, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, postgres, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, postgres, service_role;

-- Enable Row Level Security (RLS) & Define Full Access Policies
ALTER TABLE public.tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public full access to tests" ON public.tests;
DROP POLICY IF EXISTS "Public full access to questions" ON public.questions;
DROP POLICY IF EXISTS "Public full access to notices" ON public.notices;
DROP POLICY IF EXISTS "Public full access to settings" ON public.settings;
DROP POLICY IF EXISTS "Public full access to results" ON public.results;
DROP POLICY IF EXISTS "Public full access to leaderboard" ON public.leaderboard;
DROP POLICY IF EXISTS "Public full access to appointments" ON public.appointments;

CREATE POLICY "Public full access to tests" ON public.tests FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Public full access to questions" ON public.questions FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Public full access to notices" ON public.notices FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Public full access to settings" ON public.settings FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Public full access to results" ON public.results FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Public full access to leaderboard" ON public.leaderboard FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Public full access to appointments" ON public.appointments FOR ALL TO public USING (true) WITH CHECK (true);
`;

// Helper: Diagnostic checker for Supabase tables
export async function checkSupabaseHealth(): Promise<{ ok: boolean; message: string; tables: Record<string, boolean> }> {
  if (!supabase) return { ok: false, message: 'Supabase client not initialized or missing credentials', tables: {} };
  
  const tableList = ['tests', 'questions', 'notices', 'settings', 'results', 'leaderboard', 'appointments'];
  const tableStatus: Record<string, boolean> = {};
  let allGood = true;

  for (const table of tableList) {
    try {
      const { error } = await supabase.from(table).select('id').limit(1);
      if (error) {
        tableStatus[table] = false;
        allGood = false;
      } else {
        tableStatus[table] = true;
      }
    } catch (e) {
      tableStatus[table] = false;
      allGood = false;
    }
  }

  return {
    ok: allGood,
    message: allGood ? 'All 7 Supabase tables active & synchronized' : 'Some tables require SQL initialization script',
    tables: tableStatus
  };
}

// ---------------------------------------------------------
// 1. TESTS API (FETCH, SAVE, DELETE)
// ---------------------------------------------------------

export async function fetchSupabaseTests(): Promise<Test[] | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.from('tests').select('*');

  if (error) {
    console.error('Supabase fetch tests error:', error);
    return null;
  }
  return (data || []).map((row: any) => ({
    id: row.id,
    title: row.title || '',
    description: row.description || '',
    category: row.category || row.subject || 'Class 10th',
    imageUrl: row.imageUrl || '',
    durationMins: Number(row.durationMins || row.durationMinutes) || 30,
    totalQuestions: Number(row.totalQuestions) || 0,
    totalMarks: Number(row.totalMarks) || 100,
    negativeMarking: Number(row.negativeMarking) || 0,
    passingMarks: Number(row.passingMarks || row.passingPercentage) || 40,
    instructions: typeof row.instructions === 'string' ? JSON.parse(row.instructions) : (row.instructions || []),
    isPublished: row.isPublished !== undefined ? Boolean(row.isPublished) : true,
    isPopular: Boolean(row.isPopular),
    isFeatured: Boolean(row.isFeatured),
    allowRetake: row.allowRetake !== undefined ? Boolean(row.allowRetake) : true,
    testVersion: Number(row.testVersion) || 1,
    attemptsCount: Number(row.attemptsCount) || 0,
    createdAt: row.createdAt || new Date().toISOString(),
    updatedAt: row.updatedAt || new Date().toISOString()
  })) as Test[];
}

export async function saveSupabaseTest(t: Test): Promise<boolean> {
  if (!supabase) return false;

  const payload: any = {
    id: t.id,
    title: t.title || 'Untitled Test',
    description: t.description || '',
    category: t.category || 'Class 10th',
    imageUrl: t.imageUrl || '',
    durationMins: Number(t.durationMins) || 30,
    totalQuestions: Number(t.totalQuestions) || 0,
    totalMarks: Number(t.totalMarks) || 100,
    negativeMarking: Number(t.negativeMarking) || 0,
    passingMarks: Number(t.passingMarks) || 40,
    instructions: t.instructions || [],
    isPublished: t.isPublished !== undefined ? Boolean(t.isPublished) : true,
    isPopular: Boolean(t.isPopular),
    isFeatured: Boolean(t.isFeatured),
    allowRetake: t.allowRetake !== undefined ? Boolean(t.allowRetake) : true,
    testVersion: Number(t.testVersion) || 1,
    attemptsCount: Number(t.attemptsCount) || 0,
    createdAt: t.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const { error } = await supabase.from('tests').upsert(payload);

  if (error) {
    // Retry without optional schema-cache sensitive columns
    const corePayload = {
      id: t.id,
      title: t.title || 'Untitled Test',
      description: t.description || '',
      category: t.category || 'Class 10th'
    };
    const retry = await supabase.from('tests').upsert(corePayload);
    if (retry.error) {
      console.error('Supabase save test error:', retry.error.message);
      return false;
    }
  }
  return true;
}

export async function deleteSupabaseTest(testId: string): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.from('tests').delete().eq('id', testId);
  if (error) {
    console.error('Supabase delete test error:', error);
    return false;
  }
  // Delete associated questions as well
  await supabase.from('questions').delete().eq('testId', testId);
  return true;
}

// ---------------------------------------------------------
// 2. QUESTIONS API (FETCH, SAVE, DELETE)
// ---------------------------------------------------------

export async function fetchSupabaseQuestions(testId?: string): Promise<Question[] | null> {
  if (!supabase) return null;
  let queryBuilder = supabase.from('questions').select('*');
  if (testId) {
    queryBuilder = queryBuilder.eq('testId', testId);
  }
  const { data, error } = await queryBuilder;

  if (error) {
    console.error('Supabase fetch questions error:', error);
    return null;
  }
  return (data || []).map((row: any) => ({
    id: row.id,
    testId: row.testId,
    question: row.question || row.questionText || row.question_text || '',
    options: typeof row.options === 'string' ? JSON.parse(row.options) : (row.options || []),
    correctAnswer: row.correctAnswer || row.correctOptionIndex || 'A',
    explanation: row.explanation || '',
    subject: row.subject || 'General Knowledge',
    topic: row.topic || '',
    difficulty: row.difficulty || 'Medium',
    type: row.type || 'single',
    marks: row.marks !== undefined ? Number(row.marks) : 2,
    imageUrl: row.imageUrl || '',
    paragraphText: row.paragraphText || ''
  })) as Question[];
}

function parseOptIndex(ca: any): number {
  if (typeof ca === 'number') return ca;
  if (typeof ca === 'string') {
    const s = ca.trim().toUpperCase();
    if (s === 'A' || s === 'OPTION A') return 0;
    if (s === 'B' || s === 'OPTION B') return 1;
    if (s === 'C' || s === 'OPTION C') return 2;
    if (s === 'D' || s === 'OPTION D') return 3;
    const n = parseInt(s, 10);
    if (!isNaN(n)) return n;
  }
  return 0;
}

export async function saveSupabaseQuestion(q: Question): Promise<boolean> {
  if (!supabase) return false;

  const testIdVal = q.testId && q.testId.trim() !== '' ? q.testId : null;
  const qText = q.question || '';
  const optIdx = parseOptIndex(q.correctAnswer);

  // 1. First attempt: standard payload
  const payload: any = {
    id: q.id,
    testId: testIdVal,
    question: qText,
    questionText: qText,
    question_text: qText,
    options: q.options || [],
    correctAnswer: Array.isArray(q.correctAnswer) ? JSON.stringify(q.correctAnswer) : String(q.correctAnswer || 'A'),
    correctOptionIndex: optIdx,
    correct_option_index: optIdx,
    explanation: q.explanation || '',
    subject: q.subject || 'General Knowledge',
    topic: q.topic || '',
    difficulty: q.difficulty || 'Medium',
    type: q.type || 'single',
    marks: q.marks !== undefined ? Number(q.marks) : 2,
    imageUrl: q.imageUrl || '',
    paragraphText: q.paragraphText || '',
    createdAt: new Date().toISOString()
  };

  const { error } = await supabase.from('questions').upsert(payload);

  if (!error) return true;

  // 2. Retry payload if column missing or constraint violation occurred
  const corePayload: any = {
    id: q.id,
    testId: testIdVal,
    question: qText,
    questionText: qText,
    question_text: qText,
    options: q.options || [],
    correctAnswer: Array.isArray(q.correctAnswer) ? JSON.stringify(q.correctAnswer) : String(q.correctAnswer || 'A'),
    correctOptionIndex: optIdx,
    correct_option_index: optIdx
  };

  const retry = await supabase.from('questions').upsert(corePayload);
  if (!retry.error) return true;

  // 3. Try with questionText and question_text specifically for legacy schemas with NOT NULL constraints
  const legacyPayload: any = {
    id: q.id,
    questionText: qText,
    question_text: qText,
    question: qText,
    options: q.options || [],
    correctAnswer: Array.isArray(q.correctAnswer) ? JSON.stringify(q.correctAnswer) : String(q.correctAnswer || 'A'),
    correctOptionIndex: optIdx,
    correct_option_index: optIdx
  };
  if (testIdVal !== null) legacyPayload.testId = testIdVal;

  const retryLegacy = await supabase.from('questions').upsert(legacyPayload);
  if (!retryLegacy.error) return true;

  // 4. Try without testId (in case testId foreign key fails)
  if (testIdVal !== null) {
    const noFkPayload = {
      id: q.id,
      questionText: qText,
      question_text: qText,
      question: qText,
      options: q.options || [],
      correctOptionIndex: optIdx,
      correct_option_index: optIdx
    };
    const retryNoFk = await supabase.from('questions').upsert(noFkPayload);
    if (!retryNoFk.error) return true;
  }

  console.error('Supabase save question error:', retry.error.message);
  return false;
}

export async function deleteSupabaseQuestion(qId: string): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.from('questions').delete().eq('id', qId);
  if (error) {
    console.error('Supabase delete question error:', error);
    return false;
  }
  return true;
}

// ---------------------------------------------------------
// 3. NOTICES API (FETCH, SAVE, DELETE)
// ---------------------------------------------------------

export async function fetchSupabaseNotices(): Promise<Notice[] | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.from('notices').select('*');
  if (error) {
    console.error('Supabase fetch notices error:', error);
    return null;
  }
  return (data || []).map((row: any) => ({
    id: row.id,
    title: row.title || '',
    content: row.content || '',
    category: row.category || 'General',
    date: row.date || new Date().toISOString().split('T')[0],
    isImportant: Boolean(row.important || row.isImportant),
    linkUrl: row.linkUrl || ''
  })) as Notice[];
}

export async function saveSupabaseNotice(n: Notice): Promise<boolean> {
  if (!supabase) return false;
  const payload: any = {
    id: n.id,
    title: n.title,
    content: n.content,
    category: n.category || 'General',
    date: n.date || new Date().toISOString().split('T')[0],
    important: Boolean(n.isImportant),
    linkUrl: n.linkUrl || ''
  };
  const { error } = await supabase.from('notices').upsert(payload);
  if (error) {
    console.warn('Supabase save notice error, trying minimalist payload:', error);
    const corePayload = {
      id: n.id,
      title: n.title,
      content: n.content,
      date: n.date || new Date().toISOString().split('T')[0]
    };
    const retry = await supabase.from('notices').upsert(corePayload);
    if (retry.error) {
      console.error('Supabase save notice error:', retry.error);
      return false;
    }
  }
  return true;
}

export async function deleteSupabaseNotice(noticeId: string): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.from('notices').delete().eq('id', noticeId);
  if (error) {
    console.error('Supabase delete notice error:', error);
    return false;
  }
  return true;
}

// ---------------------------------------------------------
// 4. SITE SETTINGS API (FETCH, SAVE)
// ---------------------------------------------------------

export async function fetchSupabaseSettings(): Promise<SiteSettings | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.from('settings').select('*').eq('id', 'general').single();
    if (error || !data) return null;
    return data.data as SiteSettings;
  } catch (e) {
    return null;
  }
}

export async function saveSupabaseSettings(settings: SiteSettings): Promise<boolean> {
  if (!supabase) return false;
  const payload = {
    id: 'general',
    data: settings
  };
  const { error } = await supabase.from('settings').upsert(payload);
  if (error) {
    console.error('Supabase save settings error:', error);
    return false;
  }
  return true;
}

// ---------------------------------------------------------
// 5. EXAM RESULTS API (FETCH, SAVE, DELETE)
// ---------------------------------------------------------

export async function fetchSupabaseResults(): Promise<ExamResult[] | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.from('results').select('*');
  if (error) {
    console.error('Supabase fetch results error:', error);
    return null;
  }
  return (data || []).map((row: any) => ({
    id: row.id,
    testId: row.testId || row.test_id || '',
    testTitle: row.testTitle || row.test_title || '',
    category: row.category || 'Class 10th',
    studentName: row.studentName || row.userName || row.user_name || row.userId || 'Student',
    studentEmail: row.studentEmail || row.userEmail || row.user_email || '',
    studentMobile: row.studentMobile || row.userMobile || row.user_mobile || '',
    score: Number(row.score) || 0,
    totalMarks: Number(row.totalMarks || row.total_marks) || 100,
    percentage: Number(row.percentage) || 0,
    correctCount: Number(row.correctAnswers || row.correct_answers || row.correctCount) || 0,
    wrongCount: Number(row.wrongAnswers || row.wrong_answers || row.wrongCount) || 0,
    skippedCount: Number(row.unanswered || row.skippedCount || row.skipped_count) || 0,
    totalQuestions: Number(row.totalQuestions || row.total_questions) || 0,
    timeTakenSeconds: Number(row.timeTakenSeconds || row.time_taken_seconds) || 0,
    submittedAt: row.submittedAt || row.submitted_at || new Date().toISOString(),
    testVersion: Number(row.testVersion || row.test_version) || 1,
    responses: typeof row.userAnswers === 'string' ? JSON.parse(row.userAnswers) : (row.userAnswers || row.responses || {})
  })) as ExamResult[];
}

export async function saveSupabaseResult(r: ExamResult): Promise<boolean> {
  if (!supabase) return false;
  const testIdVal = r.testId && r.testId.trim() !== '' ? r.testId : null;
  const payload: any = {
    id: r.id,
    userId: r.studentName || 'Student',
    userName: r.studentName || 'Student',
    userEmail: r.studentEmail || '',
    studentName: r.studentName || 'Student',
    studentEmail: r.studentEmail || '',
    studentMobile: r.studentMobile || '',
    testId: testIdVal,
    testTitle: r.testTitle || '',
    category: r.category || 'Class 10th',
    score: r.score || 0,
    totalMarks: r.totalMarks || 100,
    percentage: r.percentage || 0,
    passed: (r.percentage || 0) >= 40,
    totalQuestions: r.totalQuestions || 0,
    correctAnswers: r.correctCount || 0,
    wrongAnswers: r.wrongCount || 0,
    unanswered: r.skippedCount || 0,
    timeTakenSeconds: r.timeTakenSeconds || 0,
    submittedAt: r.submittedAt || new Date().toISOString(),
    testVersion: r.testVersion || 1,
    userAnswers: r.responses || {}
  };
  const { error } = await supabase.from('results').upsert(payload);
  if (!error) return true;

  const corePayload: any = {
    id: r.id,
    studentName: r.studentName || 'Student',
    testId: testIdVal,
    score: r.score || 0,
    totalMarks: r.totalMarks || 100,
    percentage: r.percentage || 0
  };
  const retry = await supabase.from('results').upsert(corePayload);
  if (!retry.error) return true;

  if (testIdVal !== null) {
    const noFkPayload = { ...corePayload, testId: null };
    const retryNoFk = await supabase.from('results').upsert(noFkPayload);
    if (!retryNoFk.error) return true;
  }
  return false;
}

export async function deleteSupabaseResult(resId: string): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('results').delete().eq('id', resId);
    if (error) {
      console.error('Supabase delete result error:', error);
    }
    // Delete matching leaderboard entry
    await supabase.from('leaderboard').delete().eq('id', resId);
    await supabase.from('leaderboard').delete().eq('id', `lb-${resId}`);
    return !error;
  } catch (e) {
    console.error('Supabase delete result exception:', e);
    return false;
  }
}

// ---------------------------------------------------------
// 6. LEADERBOARD API (FETCH, SAVE, DELETE)
// ---------------------------------------------------------

export async function fetchSupabaseLeaderboard(): Promise<LeaderboardEntry[] | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.from('leaderboard').select('*');
  if (error) {
    console.error('Supabase fetch leaderboard error:', error);
    return null;
  }
  return (data || []).map((row: any) => ({
    id: row.id,
    studentName: row.userName || row.studentName || row.userId || 'Student',
    testTitle: row.testTitle || row.test_title || 'Exam',
    score: Number(row.score) || 0,
    totalMarks: Number(row.totalMarks || row.total_marks) || 100,
    percentage: Number(row.percentage) || 0,
    rank: Number(row.rank) || 1,
    timeTakenFormatted: row.timeTakenFormatted || '',
    date: row.submittedAt || row.date || new Date().toISOString().split('T')[0]
  })) as LeaderboardEntry[];
}

export async function saveSupabaseLeaderboard(lb: LeaderboardEntry): Promise<boolean> {
  if (!supabase) return false;
  const testIdVal = lb.id && lb.id.trim() !== '' ? lb.id : null;
  const payload: any = {
    id: lb.id,
    userId: lb.studentName || 'Student',
    userName: lb.studentName || 'Student',
    studentName: lb.studentName || 'Student',
    testId: testIdVal,
    testTitle: lb.testTitle || 'Exam',
    score: lb.score || 0,
    totalMarks: lb.totalMarks || 100,
    percentage: lb.percentage || 0,
    rank: lb.rank || 1,
    timeTakenFormatted: lb.timeTakenFormatted || '',
    submittedAt: lb.date || new Date().toISOString()
  };
  const { error } = await supabase.from('leaderboard').upsert(payload);
  if (!error) return true;

  const corePayload: any = {
    id: lb.id,
    userName: lb.studentName || 'Student',
    testTitle: lb.testTitle || 'Exam',
    score: lb.score || 0,
    totalMarks: lb.totalMarks || 100
  };
  const retry = await supabase.from('leaderboard').upsert(corePayload);
  return !retry.error;
}

export async function deleteSupabaseLeaderboard(id: string): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.from('leaderboard').delete().eq('id', id);
  return !error;
}

// ---------------------------------------------------------
// 7. APPOINTMENTS & CONTACT FORM API (FETCH, SAVE, DELETE)
// ---------------------------------------------------------

export async function fetchSupabaseAppointments(): Promise<any[] | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.from('appointments').select('*');
  if (error) return null;
  return data;
}

export async function saveSupabaseAppointment(appointment: {
  id?: string;
  name: string;
  email?: string;
  phone?: string;
  subject?: string;
  message?: string;
  date?: string;
}): Promise<boolean> {
  if (!supabase) return false;

  const payload = {
    id: appointment.id || `apt-${Date.now()}`,
    name: appointment.name,
    email: appointment.email || '',
    phone: appointment.phone || '',
    subject: appointment.subject || 'Appointment / Inquiry',
    message: appointment.message || '',
    date: appointment.date || new Date().toISOString().split('T')[0],
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  const { error } = await supabase.from('appointments').upsert(payload);
  if (error) {
    console.error('Supabase save appointment error:', error);
    return false;
  }
  return true;
}

export async function deleteSupabaseAppointment(id: string): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.from('appointments').delete().eq('id', id);
  return !error;
}
