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
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
    },
    operationType,
    path
  };
  console.error('Firestore Error Details: ', JSON.stringify(errInfo));
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

  // Duplicate check when creating a new test
  if (isNew || !testData.id) {
    const existingDoc = await getDoc(doc(db, 'tests', testId));
    if (existingDoc.exists()) {
      throw new Error(`A test with ID "${testId}" already exists. Cannot create duplicate.`);
    }
    // Check title duplicates in memory
    const titleDuplicate = memoryTests.find(t => t.title.trim().toLowerCase() === testData.title?.trim().toLowerCase());
    if (titleDuplicate) {
      throw new Error(`A test with title "${testData.title}" already exists. Duplicate creation prevented.`);
    }
  }

  const fullTest: Test = {
    id: testId,
    title: testData.title || 'Untitled Test',
    description: testData.description || '',
    category: testData.category || 'Class 10th',
    imageUrl: testData.imageUrl || 'https://i.ibb.co/L5Q31mR/ssc-mock-banner.jpg',
    durationMins: Number(testData.durationMins) || 15,
    totalQuestions: Number(testData.totalQuestions) || 0,
    totalMarks: Number(testData.totalMarks) || 20,
    negativeMarking: Number(testData.negativeMarking) || 0,
    passingMarks: Number(testData.passingMarks) || 8,
    instructions: testData.instructions || ['Read questions carefully before answering.'],
    isPublished: testData.isPublished ?? true,
    isPopular: testData.isPopular ?? false,
    isFeatured: testData.isFeatured ?? false,
    createdAt: testData.createdAt || new Date().toISOString(),
    attemptsCount: testData.attemptsCount || 0,
  };

  try {
    await setDoc(doc(db, 'tests', testId), fullTest, { merge: true });
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
export async function saveQuestion(questionData: Partial<Question> & { testId: string }, isNew: boolean = false): Promise<string> {
  const qId = questionData.id || `q-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  if (isNew || !questionData.id) {
    const existingDoc = await getDoc(doc(db, 'questions', qId));
    if (existingDoc.exists()) {
      throw new Error(`A question with ID "${qId}" already exists. Duplicate creation prevented.`);
    }
  }

  const fullQ: Question = {
    id: qId,
    testId: questionData.testId,
    question: questionData.question || '',
    imageUrl: questionData.imageUrl || '',
    paragraphText: questionData.paragraphText || '',
    type: questionData.type || 'single',
    options: questionData.options || [
      { id: 'A', text: '' },
      { id: 'B', text: '' },
      { id: 'C', text: '' },
      { id: 'D', text: '' }
    ],
    correctAnswer: questionData.correctAnswer || 'A',
    explanation: questionData.explanation || '',
    subject: questionData.subject || 'General Knowledge',
    topic: questionData.topic || '',
    difficulty: questionData.difficulty || 'Medium',
    marks: Number(questionData.marks) || 2,
  };

  try {
    await setDoc(doc(db, 'questions', qId), fullQ, { merge: true });

    // Update totalQuestions count on test document in Firestore
    const qRef = collection(db, 'questions');
    const qQuery = query(qRef, where('testId', '==', questionData.testId));
    const snapshot = await getDocs(qQuery);
    await saveTest({ id: questionData.testId, totalQuestions: snapshot.size });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `questions/${qId}`);
    throw err;
  }

  return qId;
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
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `results/${result.id}`);
    throw err;
  }

  return result.id;
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
