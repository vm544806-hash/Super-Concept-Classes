import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  deleteDoc, 
  query, 
  where, 
  onSnapshot
} from 'firebase/firestore';
import { db, auth } from './config';
import { Test, Question, Notice, SiteSettings, ExamResult, LeaderboardEntry } from '../types';
import { INITIAL_SETTINGS } from './seedData';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const isOfflineOrUnavailable = 
    errorMessage.includes('unavailable') ||
    errorMessage.includes('offline') ||
    errorMessage.includes('Could not reach Cloud Firestore backend');

  const errInfo: FirestoreErrorInfo = {
    error: errorMessage,
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
    },
    operationType,
    path
  };

  if (isOfflineOrUnavailable) {
    console.warn(`Firestore is operating in offline mode or reconnecting (${operationType} on ${path}):`, errorMessage);
    return;
  }

  console.error('Firestore Error Details: ', JSON.stringify(errInfo));
  if (errorMessage.includes('permission-denied') || errorMessage.includes('Missing or insufficient permissions')) {
    throw new Error(JSON.stringify(errInfo));
  }
}

// Memory state cache initialized empty (populated exclusively via Firestore snapshots)
let memorySettings: SiteSettings = { ...INITIAL_SETTINGS };
let memoryTests: Test[] = [];
let memoryQuestions: Question[] = [];
let memoryNotices: Notice[] = [];
let memoryResults: ExamResult[] = [];
let memoryLeaderboard: LeaderboardEntry[] = [];

// Active subscriber callbacks
type Callback<T> = (data: T) => void;
const testsSubscribers = new Set<Callback<Test[]>>();
const noticesSubscribers = new Set<Callback<Notice[]>>();
const settingsSubscribers = new Set<Callback<SiteSettings>>();
const leaderboardSubscribers = new Set<Callback<LeaderboardEntry[]>>();
const questionsSubscribers = new Map<string, Set<Callback<Question[]>>>();

function notifyTests() {
  testsSubscribers.forEach(cb => cb([...memoryTests]));
}
function notifyNotices() {
  noticesSubscribers.forEach(cb => cb([...memoryNotices]));
}
function notifySettings() {
  settingsSubscribers.forEach(cb => cb({ ...memorySettings }));
}
function notifyLeaderboard() {
  leaderboardSubscribers.forEach(cb => cb([...memoryLeaderboard]));
}
function notifyQuestions(testId: string) {
  const subs = questionsSubscribers.get(testId);
  if (subs) {
    const qList = memoryQuestions.filter(q => q.testId === testId);
    subs.forEach(cb => cb([...qList]));
  }
}

// --- REAL-TIME SUBSCRIBERS ---

// 1. Subscribe to Tests
export function subscribeToTests(callback: Callback<Test[]>, onlyPublished = false): () => void {
  const filteredCallback = (data: Test[]) => {
    callback(onlyPublished ? data.filter(t => t.isPublished) : data);
  };
  testsSubscribers.add(filteredCallback);
  filteredCallback(memoryTests);

  const unsub = onSnapshot(collection(db, 'tests'), (snapshot) => {
    const tests: Test[] = [];
    snapshot.forEach(docSnap => {
      tests.push({ id: docSnap.id, ...docSnap.data() } as Test);
    });
    memoryTests = tests;
    notifyTests();
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, 'tests');
  });

  return () => {
    testsSubscribers.delete(filteredCallback);
    unsub();
  };
}

// 2. Subscribe to Notices
export function subscribeToNotices(callback: Callback<Notice[]>): () => void {
  noticesSubscribers.add(callback);
  callback([...memoryNotices]);

  const unsub = onSnapshot(collection(db, 'notices'), (snapshot) => {
    const notices: Notice[] = [];
    snapshot.forEach(docSnap => {
      notices.push({ id: docSnap.id, ...docSnap.data() } as Notice);
    });
    memoryNotices = notices;
    notifyNotices();
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, 'notices');
  });

  return () => {
    noticesSubscribers.delete(callback);
    unsub();
  };
}

// 3. Subscribe to Settings
export function subscribeToSettings(callback: Callback<SiteSettings>): () => void {
  settingsSubscribers.add(callback);
  callback({ ...memorySettings });

  const unsub = onSnapshot(doc(db, 'settings', 'general'), (docSnap) => {
    if (docSnap.exists()) {
      memorySettings = docSnap.data() as SiteSettings;
      notifySettings();
    }
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, 'settings/general');
  });

  return () => {
    settingsSubscribers.delete(callback);
    unsub();
  };
}

// 4. Subscribe to Leaderboard
export function subscribeToLeaderboard(callback: Callback<LeaderboardEntry[]>): () => void {
  leaderboardSubscribers.add(callback);
  callback([...memoryLeaderboard]);

  const unsub = onSnapshot(collection(db, 'leaderboard'), (snapshot) => {
    const entries: LeaderboardEntry[] = [];
    snapshot.forEach(docSnap => {
      entries.push({ id: docSnap.id, ...docSnap.data() } as LeaderboardEntry);
    });
    entries.sort((a, b) => b.percentage - a.percentage);
    entries.forEach((e, i) => { e.rank = i + 1; });
    memoryLeaderboard = entries;
    notifyLeaderboard();
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, 'leaderboard');
  });

  return () => {
    leaderboardSubscribers.delete(callback);
    unsub();
  };
}

// 5. Subscribe to Questions for a Test
export function subscribeToQuestionsByTestId(testId: string, callback: Callback<Question[]>): () => void {
  if (!questionsSubscribers.has(testId)) {
    questionsSubscribers.set(testId, new Set());
  }
  const subs = questionsSubscribers.get(testId)!;
  subs.add(callback);
  callback(memoryQuestions.filter(q => q.testId === testId));

  const qRef = collection(db, 'questions');
  const qQuery = query(qRef, where('testId', '==', testId));

  const unsub = onSnapshot(qQuery, (snapshot) => {
    const fetched: Question[] = [];
    snapshot.forEach(docSnap => {
      fetched.push({ id: docSnap.id, ...docSnap.data() } as Question);
    });

    // Update memory cache for this specific test
    memoryQuestions = memoryQuestions.filter(q => q.testId !== testId).concat(fetched);
    notifyQuestions(testId);
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, `questions?testId=${testId}`);
  });

  return () => {
    subs.delete(callback);
    unsub();
  };
}

// --- GETTERS & WRITERS ---

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const docSnap = await getDoc(doc(db, 'settings', 'general'));
    if (docSnap.exists()) {
      memorySettings = docSnap.data() as SiteSettings;
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, 'settings/general');
  }
  return memorySettings;
}

export async function updateSiteSettings(settings: SiteSettings): Promise<void> {
  memorySettings = { ...settings };
  notifySettings();
  try {
    await setDoc(doc(db, 'settings', 'general'), settings, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'settings/general');
  }
}

export async function getTests(onlyPublished: boolean = false): Promise<Test[]> {
  try {
    const snapshot = await getDocs(collection(db, 'tests'));
    const list: Test[] = [];
    snapshot.forEach(docSnap => {
      list.push({ id: docSnap.id, ...docSnap.data() } as Test);
    });
    memoryTests = list;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, 'tests');
  }
  return onlyPublished ? memoryTests.filter(t => t.isPublished) : memoryTests;
}

export async function getTestById(id: string): Promise<Test | null> {
  try {
    const docSnap = await getDoc(doc(db, 'tests', id));
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Test;
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, `tests/${id}`);
  }
  return memoryTests.find(t => t.id === id) || null;
}

/**
 * Save or update a Test document in Firestore.
 * Prevents creation of duplicate documents by checking existing document IDs and titles.
 */
export async function saveTest(testData: Partial<Test> & { id?: string }, isNew: boolean = false): Promise<string> {
  const testId = testData.id || `test-${Date.now()}`;

  let existingTest: Test | null = memoryTests.find(t => t.id === testId) || null;
  if (!existingTest && testData.id) {
    try {
      const snap = await getDoc(doc(db, 'tests', testId));
      if (snap.exists()) {
        existingTest = { id: snap.id, ...snap.data() } as Test;
      }
    } catch (e) {
      // Ignore lookup failure
    }
  }

  // Duplicate check when creating a new test
  if (isNew && !existingTest) {
    const existingDoc = await getDoc(doc(db, 'tests', testId));
    if (existingDoc.exists()) {
      throw new Error(`A test with ID "${testId}" already exists. Cannot create duplicate.`);
    }
    // Check title duplicates in memory
    if (testData.title) {
      const titleDuplicate = memoryTests.find(t => t.title.trim().toLowerCase() === testData.title?.trim().toLowerCase() && t.id !== testId);
      if (titleDuplicate) {
        throw new Error(`A test with title "${testData.title}" already exists. Duplicate creation prevented.`);
      }
    }
  }

  const updatePayload: Record<string, any> = {};

  if (isNew && !existingTest) {
    updatePayload.id = testId;
    updatePayload.title = testData.title || 'Untitled Test';
    updatePayload.description = testData.description || '';
    updatePayload.category = testData.category || 'Class 10th';
    updatePayload.imageUrl = testData.imageUrl || 'https://i.ibb.co/L5Q31mR/ssc-mock-banner.jpg';
    updatePayload.durationMins = testData.durationMins !== undefined ? Number(testData.durationMins) : 15;
    updatePayload.totalQuestions = testData.totalQuestions !== undefined ? Number(testData.totalQuestions) : 0;
    updatePayload.totalMarks = testData.totalMarks !== undefined ? Number(testData.totalMarks) : 20;
    updatePayload.negativeMarking = testData.negativeMarking !== undefined ? Number(testData.negativeMarking) : 0;
    updatePayload.passingMarks = testData.passingMarks !== undefined ? Number(testData.passingMarks) : 8;
    updatePayload.instructions = testData.instructions || ['Read questions carefully before answering.'];
    updatePayload.isPublished = testData.isPublished ?? true;
    updatePayload.isPopular = testData.isPopular ?? false;
    updatePayload.isFeatured = testData.isFeatured ?? false;
    updatePayload.createdAt = testData.createdAt || new Date().toISOString();
    updatePayload.attemptsCount = testData.attemptsCount !== undefined ? Number(testData.attemptsCount) : 0;
  } else {
    updatePayload.id = testId;
    if (testData.title !== undefined) updatePayload.title = testData.title;
    if (testData.description !== undefined) updatePayload.description = testData.description;
    if (testData.category !== undefined) updatePayload.category = testData.category;
    if (testData.imageUrl !== undefined) updatePayload.imageUrl = testData.imageUrl;
    if (testData.durationMins !== undefined) updatePayload.durationMins = Number(testData.durationMins);
    if (testData.totalQuestions !== undefined) updatePayload.totalQuestions = Number(testData.totalQuestions);
    if (testData.totalMarks !== undefined) updatePayload.totalMarks = Number(testData.totalMarks);
    if (testData.negativeMarking !== undefined) updatePayload.negativeMarking = Number(testData.negativeMarking);
    if (testData.passingMarks !== undefined) updatePayload.passingMarks = Number(testData.passingMarks);
    if (testData.instructions !== undefined) updatePayload.instructions = testData.instructions;
    if (testData.isPublished !== undefined) updatePayload.isPublished = testData.isPublished;
    if (testData.isPopular !== undefined) updatePayload.isPopular = testData.isPopular;
    if (testData.isFeatured !== undefined) updatePayload.isFeatured = testData.isFeatured;
    if (testData.createdAt !== undefined) updatePayload.createdAt = testData.createdAt;
    if (testData.attemptsCount !== undefined) updatePayload.attemptsCount = Number(testData.attemptsCount);
  }

  try {
    await setDoc(doc(db, 'tests', testId), updatePayload, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `tests/${testId}`);
    throw err;
  }

  return testId;
}

/**
 * Permanently delete a Test and all associated questions from Firestore by document ID.
 */
export async function deleteTest(testId: string): Promise<void> {
  try {
    // Delete Test Document
    await deleteDoc(doc(db, 'tests', testId));

    // Delete associated questions from Firestore
    const qRef = collection(db, 'questions');
    const qQuery = query(qRef, where('testId', '==', testId));
    const snapshot = await getDocs(qQuery);

    const deletePromises = snapshot.docs.map(qDoc => deleteDoc(doc(db, 'questions', qDoc.id)));
    await Promise.all(deletePromises);

    console.log(`Test ${testId} and associated questions deleted successfully from Firestore.`);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `tests/${testId}`);
    throw err;
  }
}

// --- QUESTIONS ---

export async function getQuestionsByTestId(testId: string): Promise<Question[]> {
  try {
    const qRef = collection(db, 'questions');
    const qQuery = query(qRef, where('testId', '==', testId));
    const snapshot = await getDocs(qQuery);
    const fetched: Question[] = [];
    snapshot.forEach(docSnap => {
      fetched.push({ id: docSnap.id, ...docSnap.data() } as Question);
    });
    memoryQuestions = memoryQuestions.filter(q => q.testId !== testId).concat(fetched);
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, `questions?testId=${testId}`);
  }
  return memoryQuestions.filter(q => q.testId === testId);
}

export async function getAllQuestions(): Promise<Question[]> {
  try {
    const snapshot = await getDocs(collection(db, 'questions'));
    const list: Question[] = [];
    snapshot.forEach(docSnap => {
      list.push({ id: docSnap.id, ...docSnap.data() } as Question);
    });
    memoryQuestions = list;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, 'questions');
  }
  return memoryQuestions;
}

/**
 * Save or update a Question document in Firestore.
 * Prevents creation of duplicate questions by checking existing document IDs.
 */
export async function saveQuestion(
  questionData: Partial<Question> & { testId: string },
  isNew: boolean = false,
  skipTestTotalUpdate: boolean = false
): Promise<string> {
  const qId = questionData.id || `q-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

  let existingQ: Question | null = memoryQuestions.find(q => q.id === qId) || null;

  if (isNew && !existingQ) {
    const existingDoc = await getDoc(doc(db, 'questions', qId));
    if (existingDoc.exists()) {
      throw new Error(`A question with ID "${qId}" already exists. Duplicate creation prevented.`);
    }
  }

  const updatePayload: Record<string, any> = {};

  if (isNew && !existingQ) {
    updatePayload.id = qId;
    updatePayload.testId = questionData.testId;
    updatePayload.question = questionData.question || '';
    updatePayload.imageUrl = questionData.imageUrl || '';
    updatePayload.paragraphText = questionData.paragraphText || '';
    updatePayload.type = questionData.type || 'single';
    updatePayload.options = questionData.options || [
      { id: 'A', text: '' },
      { id: 'B', text: '' },
      { id: 'C', text: '' },
      { id: 'D', text: '' }
    ];
    updatePayload.correctAnswer = questionData.correctAnswer || 'A';
    updatePayload.explanation = questionData.explanation || '';
    updatePayload.subject = questionData.subject || 'General Knowledge';
    updatePayload.topic = questionData.topic || '';
    updatePayload.difficulty = questionData.difficulty || 'Medium';
    updatePayload.marks = questionData.marks !== undefined ? Number(questionData.marks) : 2;
  } else {
    updatePayload.id = qId;
    updatePayload.testId = questionData.testId;
    if (questionData.question !== undefined) updatePayload.question = questionData.question;
    if (questionData.imageUrl !== undefined) updatePayload.imageUrl = questionData.imageUrl;
    if (questionData.paragraphText !== undefined) updatePayload.paragraphText = questionData.paragraphText;
    if (questionData.type !== undefined) updatePayload.type = questionData.type;
    if (questionData.options !== undefined) updatePayload.options = questionData.options;
    if (questionData.correctAnswer !== undefined) updatePayload.correctAnswer = questionData.correctAnswer;
    if (questionData.explanation !== undefined) updatePayload.explanation = questionData.explanation;
    if (questionData.subject !== undefined) updatePayload.subject = questionData.subject;
    if (questionData.topic !== undefined) updatePayload.topic = questionData.topic;
    if (questionData.difficulty !== undefined) updatePayload.difficulty = questionData.difficulty;
    if (questionData.marks !== undefined) updatePayload.marks = Number(questionData.marks);
  }

  try {
    await setDoc(doc(db, 'questions', qId), updatePayload, { merge: true });

    if (!skipTestTotalUpdate) {
      // Update totalQuestions count on test document in Firestore
      const qRef = collection(db, 'questions');
      const qQuery = query(qRef, where('testId', '==', questionData.testId));
      const snapshot = await getDocs(qQuery);
      await saveTest({ id: questionData.testId, totalQuestions: snapshot.size });
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `questions/${qId}`);
    throw err;
  }

  return qId;
}

/**
 * Save multiple questions in bulk for a test.
 */
export async function saveQuestionsBulk(questionsList: Partial<Question>[], testId: string): Promise<number> {
  let count = 0;
  const timestamp = Date.now();
  for (let i = 0; i < questionsList.length; i++) {
    const item = questionsList[i];
    const uniqueId = item.id && !item.id.startsWith('temp-') 
      ? item.id 
      : `q-${timestamp}-${i}-${Math.random().toString(36).substring(2, 8)}`;
    
    await saveQuestion({ ...item, id: uniqueId, testId }, true, true);
    count++;
  }

  // Update test question count once
  const qRef = collection(db, 'questions');
  const qQuery = query(qRef, where('testId', '==', testId));
  const snapshot = await getDocs(qQuery);
  await saveTest({ id: testId, totalQuestions: snapshot.size });

  return count;
}

/**
 * Delete all questions for a specific test in a single operation.
 */
export async function deleteAllQuestionsByTestId(testId: string): Promise<void> {
  try {
    const qRef = collection(db, 'questions');
    const qQuery = query(qRef, where('testId', '==', testId));
    const snapshot = await getDocs(qQuery);

    const deletePromises = snapshot.docs.map(qDoc => deleteDoc(doc(db, 'questions', qDoc.id)));
    await Promise.all(deletePromises);

    // Update totalQuestions count on test document to 0
    await saveTest({ id: testId, totalQuestions: 0 });
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `questions?testId=${testId}`);
    throw err;
  }
}

/**
 * Permanently delete a Question from Firestore by document ID.
 */
export async function deleteQuestion(qId: string, testId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'questions', qId));

    // Update totalQuestions count on test document in Firestore
    const qRef = collection(db, 'questions');
    const qQuery = query(qRef, where('testId', '==', testId));
    const snapshot = await getDocs(qQuery);
    await saveTest({ id: testId, totalQuestions: snapshot.size });
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `questions/${qId}`);
    throw err;
  }
}

// --- NOTICES ---

export async function getNotices(): Promise<Notice[]> {
  try {
    const snapshot = await getDocs(collection(db, 'notices'));
    const list: Notice[] = [];
    snapshot.forEach(docSnap => {
      list.push({ id: docSnap.id, ...docSnap.data() } as Notice);
    });
    memoryNotices = list;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, 'notices');
  }
  return memoryNotices;
}

/**
 * Save or update a Notice document in Firestore.
 */
export async function saveNotice(noticeData: Partial<Notice>, isNew: boolean = false): Promise<string> {
  const nId = noticeData.id || `notice-${Date.now()}`;

  if (isNew || !noticeData.id) {
    const existingDoc = await getDoc(doc(db, 'notices', nId));
    if (existingDoc.exists()) {
      throw new Error(`A notice with ID "${nId}" already exists.`);
    }
  }

  const fullNotice: Notice = {
    id: nId,
    title: noticeData.title || 'New Notice',
    content: noticeData.content || '',
    category: noticeData.category || 'General',
    date: noticeData.date || new Date().toISOString().split('T')[0],
    isImportant: noticeData.isImportant ?? false,
    linkUrl: noticeData.linkUrl || '',
  };

  try {
    await setDoc(doc(db, 'notices', nId), fullNotice, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `notices/${nId}`);
    throw err;
  }

  return nId;
}

/**
 * Permanently delete a Notice from Firestore by document ID.
 */
export async function deleteNotice(noticeId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'notices', noticeId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `notices/${noticeId}`);
    throw err;
  }
}

// --- RESULTS & LEADERBOARD ---

/**
 * Subscribe to all Exam Results in real-time.
 */
export function subscribeToResults(callback: Callback<ExamResult[]>): () => void {
  callback([...memoryResults]);

  const unsub = onSnapshot(collection(db, 'results'), (snapshot) => {
    const list: ExamResult[] = [];
    snapshot.forEach(docSnap => {
      list.push({ id: docSnap.id, ...docSnap.data() } as ExamResult);
    });
    list.sort((a, b) => new Date(b.submittedAt || 0).getTime() - new Date(a.submittedAt || 0).getTime());
    memoryResults = list;
    callback(list);
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, 'results');
  });

  return unsub;
}

/**
 * Submit student test result permanently to Firestore.
 */
export async function submitTestResult(result: ExamResult): Promise<string> {
  const lbEntry: LeaderboardEntry = {
    id: `lb-${result.id}`,
    studentName: result.studentName,
    testTitle: result.testTitle,
    score: result.score,
    totalMarks: result.totalMarks,
    percentage: result.percentage,
    timeTakenFormatted: `${Math.floor(result.timeTakenSeconds / 60)}m ${result.timeTakenSeconds % 60}s`,
    date: new Date().toISOString().split('T')[0],
  };

  // Increment test attempt count on Firestore
  const currentTest = memoryTests.find(t => t.id === result.testId);
  if (currentTest) {
    const updatedCount = (currentTest.attemptsCount || 0) + 1;
    await saveTest({ id: result.testId, attemptsCount: updatedCount });
  }

  try {
    await setDoc(doc(db, 'results', result.id), result);
    await setDoc(doc(db, 'leaderboard', lbEntry.id), lbEntry);

    // Save attempt status to localStorage for instant local detection
    localStorage.setItem(`completed_test_${result.testId}`, JSON.stringify(result));
    if (result.studentName) {
      localStorage.setItem(`completed_cand_${result.testId}_${result.studentName.trim().toLowerCase()}`, JSON.stringify(result));
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `results/${result.id}`);
    throw err;
  }

  return result.id;
}

/**
 * Check if a candidate (by local storage or by Name / Mobile / Email in Firestore) has already attempted a test.
 */
export async function checkExistingAttempt(
  testId: string,
  studentName?: string,
  studentMobile?: string,
  studentEmail?: string
): Promise<ExamResult | null> {
  // 1. Check Local Storage
  const localSaved = localStorage.getItem(`completed_test_${testId}`);
  if (localSaved) {
    try {
      const parsed = JSON.parse(localSaved);
      if (parsed && parsed.testId === testId) {
        return parsed as ExamResult;
      }
    } catch (e) {}
  }

  const normName = studentName?.trim().toLowerCase();
  const normMobile = studentMobile?.trim();
  const normEmail = studentEmail?.trim().toLowerCase();

  if (normName) {
    const candSaved = localStorage.getItem(`completed_cand_${testId}_${normName}`);
    if (candSaved) {
      try {
        const parsed = JSON.parse(candSaved);
        if (parsed && parsed.testId === testId) return parsed as ExamResult;
      } catch (e) {}
    }
  }

  // 2. Query Firestore results
  const allResults = await getResults();
  for (const r of allResults) {
    if (r.testId !== testId) continue;

    if (normName && r.studentName && r.studentName.trim().toLowerCase() === normName) {
      return r;
    }
    if (normMobile && r.studentMobile && r.studentMobile.trim() === normMobile) {
      return r;
    }
    if (normEmail && r.studentEmail && r.studentEmail.trim().toLowerCase() === normEmail) {
      return r;
    }
  }

  return null;
}

export async function getResults(): Promise<ExamResult[]> {
  try {
    const snapshot = await getDocs(collection(db, 'results'));
    const list: ExamResult[] = [];
    snapshot.forEach(docSnap => {
      list.push({ id: docSnap.id, ...docSnap.data() } as ExamResult);
    });
    memoryResults = list;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, 'results');
  }
  return memoryResults;
}

/**
 * Permanently delete an Exam Result and associated Leaderboard entry from Firestore.
 */
export async function deleteResult(resultId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'results', resultId));
    await deleteDoc(doc(db, 'leaderboard', `lb-${resultId}`));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `results/${resultId}`);
    throw err;
  }
}

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  try {
    const snapshot = await getDocs(collection(db, 'leaderboard'));
    const list: LeaderboardEntry[] = [];
    snapshot.forEach(docSnap => {
      list.push({ id: docSnap.id, ...docSnap.data() } as LeaderboardEntry);
    });
    list.sort((a, b) => b.percentage - a.percentage);
    list.forEach((e, i) => { e.rank = i + 1; });
    memoryLeaderboard = list;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, 'leaderboard');
  }
  return memoryLeaderboard;
}
