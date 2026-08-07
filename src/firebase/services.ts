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
import { 
  isSupabaseConfigured, 
  saveSupabaseQuestion, 
  deleteSupabaseQuestion, 
  saveSupabaseTest, 
  deleteSupabaseTest,
  saveSupabaseAppointment,
  saveSupabaseNotice,
  deleteSupabaseNotice,
  saveSupabaseResult,
  deleteSupabaseResult,
  saveSupabaseSettings,
  fetchSupabaseSettings,
  fetchSupabaseQuestions,
  fetchSupabaseTests,
  fetchSupabaseNotices,
  fetchSupabaseResults,
  fetchSupabaseLeaderboard,
  deleteSupabaseLeaderboard,
  saveSupabaseLeaderboard,
  checkSupabaseHealth
} from '../supabase/supabaseServices';

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

let loggedQuotaWarn = false;

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const isOfflineOrQuotaExceeded = 
    errorMessage.includes('unavailable') ||
    errorMessage.includes('offline') ||
    errorMessage.includes('RESOURCE_EXHAUSTED') ||
    errorMessage.includes('quota') ||
    errorMessage.includes('Quota exceeded') ||
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

  if (isOfflineOrQuotaExceeded) {
    if (!loggedQuotaWarn) {
      console.warn(`[Database Auto-Shift] Firestore quota limit/offline detected. Switched active database engine to Supabase.`);
      loggedQuotaWarn = true;
    }
    return;
  }

  console.error('Firestore Details (Auto-shift to Supabase active):', JSON.stringify(errInfo));
}

// Clear legacy localStorage caches
try {
  localStorage.removeItem('app_cache_questions');
  localStorage.removeItem('app_cache_tests');
  localStorage.removeItem('app_cache_settings');
  localStorage.removeItem('app_cache_notices');
  localStorage.removeItem('app_cache_results');
  localStorage.removeItem('app_cache_leaderboard');
} catch (e) {}

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
const resultsSubscribers = new Set<Callback<ExamResult[]>>();
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
function notifyResults() {
  resultsSubscribers.forEach(cb => cb([...memoryResults]));
}
function notifyQuestions(testId: string) {
  const subs = questionsSubscribers.get(testId);
  if (subs) {
    const qList = memoryQuestions.filter(q => q.testId === testId);
    subs.forEach(cb => cb([...qList]));
  }
}

// Health status monitor
export function getDatabaseHealth() {
  return {
    firestoreConfigured: true,
    supabaseConfigured: isSupabaseConfigured,
    mode: isSupabaseConfigured ? 'Dual-Engine Active (Firestore + Supabase Dual-Write & Instant Quota Auto-Shift)' : 'Firestore Primary',
    activeDatabases: isSupabaseConfigured ? ['Firestore (Primary)', 'Supabase (Secondary / Auto-Shift)'] : ['Firestore']
  };
}

export { checkSupabaseHealth };

// --- REAL-TIME SUBSCRIBERS ---

// 1. Subscribe to Tests
export function subscribeToTests(callback: Callback<Test[]>, onlyPublished = false): () => void {
  const filteredCallback = (data: Test[]) => {
    callback(onlyPublished ? data.filter(t => t.isPublished) : data);
  };
  testsSubscribers.add(filteredCallback);

  if (isSupabaseConfigured) {
    fetchSupabaseTests().then(supaTests => {
      if (supaTests && supaTests.length > 0) {
        memoryTests = supaTests;
        notifyTests();
      }
    }).catch(err => console.error('Supabase fetch tests error:', err));
  }

  filteredCallback(memoryTests);

  const unsub = onSnapshot(collection(db, 'tests'), (snapshot) => {
    const list: Test[] = [];
    snapshot.forEach(docSnap => {
      list.push({ id: docSnap.id, ...docSnap.data() } as Test);
    });
    memoryTests = list;
    notifyTests();
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, 'tests');
    if (isSupabaseConfigured) {
      fetchSupabaseTests().then(supaTests => {
        if (supaTests && supaTests.length > 0) {
          memoryTests = supaTests;
          notifyTests();
        }
      });
    } else {
      filteredCallback(memoryTests);
    }
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

  if (isSupabaseConfigured) {
    fetchSupabaseNotices().then(supaNotices => {
      if (supaNotices && supaNotices.length > 0) {
        memoryNotices = supaNotices;
        notifyNotices();
      }
    }).catch(err => console.error('Supabase fetch notices error:', err));
  }

  const unsub = onSnapshot(collection(db, 'notices'), (snapshot) => {
    const notices: Notice[] = [];
    snapshot.forEach(docSnap => {
      notices.push({ id: docSnap.id, ...docSnap.data() } as Notice);
    });
    memoryNotices = notices;
    notifyNotices();
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, 'notices');
    if (isSupabaseConfigured) {
      fetchSupabaseNotices().then(supa => {
        if (supa && supa.length > 0) {
          memoryNotices = supa;
          notifyNotices();
        }
      });
    } else {
      callback([...memoryNotices]);
    }
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

  if (isSupabaseConfigured) {
    fetchSupabaseSettings().then(supa => {
      if (supa) {
        memorySettings = supa;
        notifySettings();
      }
    }).catch(e => {});
  }

  const unsub = onSnapshot(doc(db, 'settings', 'general'), (docSnap) => {
    if (docSnap.exists()) {
      memorySettings = { ...INITIAL_SETTINGS, ...docSnap.data() } as SiteSettings;
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

  if (isSupabaseConfigured) {
    fetchSupabaseLeaderboard().then(supaLb => {
      if (supaLb && supaLb.length > 0) {
        memoryLeaderboard = supaLb;
        notifyLeaderboard();
      }
    }).catch(e => {});
  }

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
    if (isSupabaseConfigured) {
      fetchSupabaseLeaderboard().then(supa => {
        if (supa && supa.length > 0) {
          memoryLeaderboard = supa;
          notifyLeaderboard();
        }
      });
    } else {
      callback([...memoryLeaderboard]);
    }
  });

  return () => {
    leaderboardSubscribers.delete(callback);
    unsub();
  };
}

// 5. Subscribe to Questions
export function subscribeToQuestions(testId: string, callback: Callback<Question[]>): () => void {
  let subs = questionsSubscribers.get(testId);
  if (!subs) {
    subs = new Set();
    questionsSubscribers.set(testId, subs);
  }
  subs.add(callback);

  if (isSupabaseConfigured) {
    fetchSupabaseQuestions(testId).then(supaQuestions => {
      if (supaQuestions && supaQuestions.length > 0) {
        memoryQuestions = memoryQuestions.filter(q => q.testId !== testId).concat(supaQuestions);
        notifyQuestions(testId);
      }
    }).catch(err => console.error('Supabase subscription fetch error:', err));
  }

  callback(memoryQuestions.filter(q => q.testId === testId));

  const qRef = collection(db, 'questions');
  const qQuery = query(qRef, where('testId', '==', testId));

  const unsub = onSnapshot(qQuery, (snapshot) => {
    const fetched: Question[] = [];
    snapshot.forEach(docSnap => {
      fetched.push({ id: docSnap.id, ...docSnap.data() } as Question);
    });

    if (fetched.length > 0) {
      memoryQuestions = memoryQuestions.filter(q => q.testId !== testId).concat(fetched);
      notifyQuestions(testId);
    } else if (isSupabaseConfigured) {
      fetchSupabaseQuestions(testId).then(supaQuestions => {
        if (supaQuestions && supaQuestions.length > 0) {
          memoryQuestions = memoryQuestions.filter(q => q.testId !== testId).concat(supaQuestions);
          notifyQuestions(testId);
        }
      });
    }
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, `questions?testId=${testId}`);
    if (isSupabaseConfigured) {
      fetchSupabaseQuestions(testId).then(supaQuestions => {
        if (supaQuestions && supaQuestions.length > 0) {
          memoryQuestions = memoryQuestions.filter(q => q.testId !== testId).concat(supaQuestions);
          notifyQuestions(testId);
        }
      });
    } else {
      callback(memoryQuestions.filter(q => q.testId === testId));
    }
  });

  return () => {
    const currentSubs = questionsSubscribers.get(testId);
    if (currentSubs) {
      currentSubs.delete(callback);
    }
    unsub();
  };
}

export { subscribeToQuestions as subscribeToQuestionsByTestId };

// --- GETTERS & WRITERS WITH DUAL WRITE AND INSTANT AUTO-SHIFT ---

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const docSnap = await getDoc(doc(db, 'settings', 'general'));
    if (docSnap.exists()) {
      memorySettings = { ...INITIAL_SETTINGS, ...docSnap.data() } as SiteSettings;
      return memorySettings;
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, 'settings/general');
  }

  if (isSupabaseConfigured) {
    const supa = await fetchSupabaseSettings();
    if (supa) {
      memorySettings = { ...INITIAL_SETTINGS, ...supa };
      return memorySettings;
    }
  }

  return memorySettings;
}

export async function updateSiteSettings(settings: SiteSettings): Promise<void> {
  memorySettings = { ...settings };
  notifySettings();

  // Dual Write
  if (isSupabaseConfigured) {
    saveSupabaseSettings(settings).catch(e => console.error('Supabase settings update error:', e));
  }

  try {
    await setDoc(doc(db, 'settings', 'general'), settings, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'settings/general');
  }
}

export async function getTests(onlyPublished: boolean = false): Promise<Test[]> {
  let fetchedFirestore = false;
  try {
    const snapshot = await getDocs(collection(db, 'tests'));
    const list: Test[] = [];
    snapshot.forEach(docSnap => {
      list.push({ id: docSnap.id, ...docSnap.data() } as Test);
    });
    memoryTests = list;
    fetchedFirestore = true;
    if (list.length > 0 && isSupabaseConfigured) {
      for (const t of list) {
        saveSupabaseTest(t).catch(e => {});
      }
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, 'tests');
  }

  if (!fetchedFirestore && isSupabaseConfigured) {
    try {
      const supaTests = await fetchSupabaseTests();
      if (supaTests && supaTests.length > 0) {
        memoryTests = supaTests;
      }
    } catch (e) {
      console.error('Supabase getTests failover error:', e);
    }
  }

  return onlyPublished ? memoryTests.filter(t => t.isPublished) : memoryTests;
}

export async function getTestById(id: string): Promise<Test | null> {
  try {
    const snap = await getDoc(doc(db, 'tests', id));
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as Test;
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, `tests/${id}`);
  }

  if (isSupabaseConfigured) {
    const supaTests = await fetchSupabaseTests();
    const found = supaTests?.find(t => t.id === id);
    if (found) return found;
  }

  return memoryTests.find(t => t.id === id) || null;
}

export async function saveTest(testData: Partial<Test> & { id?: string }, isNew: boolean = false): Promise<string> {
  const testId = testData.id || `test-${Date.now()}`;

  const updatePayload: Record<string, any> = {};

  if (isNew) {
    updatePayload.id = testId;
    updatePayload.title = testData.title || 'New Mock Test';
    updatePayload.description = testData.description || '';
    updatePayload.category = testData.category || 'Class 10th';
    updatePayload.imageUrl = testData.imageUrl || 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800';
    updatePayload.durationMins = testData.durationMins !== undefined ? Number(testData.durationMins) : 30;
    updatePayload.totalQuestions = testData.totalQuestions !== undefined ? Number(testData.totalQuestions) : 0;
    updatePayload.totalMarks = testData.totalMarks !== undefined ? Number(testData.totalMarks) : 100;
    updatePayload.negativeMarking = testData.negativeMarking !== undefined ? Number(testData.negativeMarking) : 0;
    updatePayload.passingMarks = testData.passingMarks !== undefined ? Number(testData.passingMarks) : 40;
    updatePayload.instructions = testData.instructions || [];
    updatePayload.isPublished = testData.isPublished !== undefined ? Boolean(testData.isPublished) : true;
    updatePayload.isPopular = Boolean(testData.isPopular);
    updatePayload.isFeatured = Boolean(testData.isFeatured);
    updatePayload.allowRetake = testData.allowRetake !== undefined ? Boolean(testData.allowRetake) : true;
    updatePayload.testVersion = testData.testVersion !== undefined ? Number(testData.testVersion) : 1;
    updatePayload.attemptsCount = testData.attemptsCount !== undefined ? Number(testData.attemptsCount) : 0;
    updatePayload.createdAt = new Date().toISOString();
    updatePayload.updatedAt = new Date().toISOString();
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
    if (testData.isPublished !== undefined) updatePayload.isPublished = Boolean(testData.isPublished);
    if (testData.isPopular !== undefined) updatePayload.isPopular = Boolean(testData.isPopular);
    if (testData.isFeatured !== undefined) updatePayload.isFeatured = Boolean(testData.isFeatured);
    if (testData.allowRetake !== undefined) updatePayload.allowRetake = Boolean(testData.allowRetake);
    if (testData.testVersion !== undefined) updatePayload.testVersion = Number(testData.testVersion);
    if (testData.attemptsCount !== undefined) updatePayload.attemptsCount = Number(testData.attemptsCount);
    updatePayload.updatedAt = new Date().toISOString();
  }

  const existingTest = memoryTests.find(t => t.id === testId);
  const fullTest = { ...existingTest, ...updatePayload } as Test;

  const tIdx = memoryTests.findIndex(t => t.id === testId);
  if (tIdx >= 0) {
    memoryTests[tIdx] = fullTest;
  } else {
    memoryTests.unshift(fullTest);
  }
  notifyTests();

  // DUAL WRITE: Save to both Supabase and Firestore
  if (isSupabaseConfigured) {
    saveSupabaseTest(fullTest).catch(e => console.error('Supabase save test error:', e));
  }

  try {
    await setDoc(doc(db, 'tests', testId), updatePayload, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `tests/${testId}`);
  }

  return testId;
}

export async function deleteTest(testId: string): Promise<void> {
  memoryTests = memoryTests.filter(t => t.id !== testId);
  memoryQuestions = memoryQuestions.filter(q => q.testId !== testId);
  notifyTests();

  // Dual Delete
  if (isSupabaseConfigured) {
    deleteSupabaseTest(testId).catch(e => console.error('Supabase test delete error:', e));
  }

  try {
    await deleteDoc(doc(db, 'tests', testId));
    const qRef = collection(db, 'questions');
    const qQuery = query(qRef, where('testId', '==', testId));
    const snapshot = await getDocs(qQuery);
    const deletePromises = snapshot.docs.map(qDoc => deleteDoc(doc(db, 'questions', qDoc.id)));
    await Promise.all(deletePromises);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `tests/${testId}`);
  }
}

export async function getQuestionsByTestId(testId: string): Promise<Question[]> {
  let foundInFirestore = false;

  try {
    const qRef = collection(db, 'questions');
    const qQuery = query(qRef, where('testId', '==', testId));
    const snapshot = await getDocs(qQuery);
    const fetched: Question[] = [];
    snapshot.forEach(docSnap => {
      fetched.push({ id: docSnap.id, ...docSnap.data() } as Question);
    });

    if (fetched.length > 0) {
      foundInFirestore = true;
      memoryQuestions = memoryQuestions.filter(q => q.testId !== testId).concat(fetched);
      notifyQuestions(testId);

      if (isSupabaseConfigured) {
        for (const q of fetched) {
          saveSupabaseQuestion(q).catch(e => {});
        }
      }
      return memoryQuestions.filter(q => q.testId === testId);
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, `questions?testId=${testId}`);
  }

  if (!foundInFirestore && isSupabaseConfigured) {
    try {
      const supaQuestions = await fetchSupabaseQuestions(testId);
      if (supaQuestions && supaQuestions.length > 0) {
        memoryQuestions = memoryQuestions.filter(q => q.testId !== testId).concat(supaQuestions);
        notifyQuestions(testId);

        for (const q of supaQuestions) {
          setDoc(doc(db, 'questions', q.id), q, { merge: true }).catch(e => {});
        }
        return memoryQuestions.filter(q => q.testId === testId);
      }
    } catch (e) {
      console.error('Supabase fetch questions failover error:', e);
    }
  }

  return memoryQuestions.filter(q => q.testId === testId);
}

export async function getAllQuestions(): Promise<Question[]> {
  let foundInFirestore = false;
  try {
    const snapshot = await getDocs(collection(db, 'questions'));
    const list: Question[] = [];
    snapshot.forEach(docSnap => {
      list.push({ id: docSnap.id, ...docSnap.data() } as Question);
    });
    memoryQuestions = list;
    foundInFirestore = true;
    if (list.length > 0 && isSupabaseConfigured) {
      for (const q of list) {
        saveSupabaseQuestion(q).catch(e => {});
      }
    }
    return memoryQuestions;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, 'questions');
  }

  if (!foundInFirestore && isSupabaseConfigured) {
    try {
      const supaQuestions = await fetchSupabaseQuestions();
      if (supaQuestions && supaQuestions.length > 0) {
        memoryQuestions = supaQuestions;
        return memoryQuestions;
      }
    } catch (e) {
      console.error('Supabase getAllQuestions failover error:', e);
    }
  }

  return memoryQuestions;
}

export async function saveQuestion(
  questionData: Partial<Question> & { testId: string },
  isNew: boolean = false,
  existingQId?: string
): Promise<string> {
  const qId = existingQId || questionData.id || `q-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

  let existingQ: Question | null = memoryQuestions.find(q => q.id === qId) || null;

  const updatePayload: Record<string, any> = {};

  if (isNew && !existingQ) {
    updatePayload.id = qId;
    updatePayload.testId = questionData.testId;
    updatePayload.question = questionData.question || '';
    updatePayload.options = questionData.options || ['Option A', 'Option B', 'Option C', 'Option D'];
    updatePayload.correctAnswer = questionData.correctAnswer || 'A';
    updatePayload.explanation = questionData.explanation || '';
    updatePayload.subject = questionData.subject || 'General Knowledge';
    updatePayload.topic = questionData.topic || '';
    updatePayload.difficulty = questionData.difficulty || 'Medium';
    updatePayload.type = questionData.type || 'single';
    updatePayload.marks = questionData.marks !== undefined ? Number(questionData.marks) : 2;
    updatePayload.imageUrl = questionData.imageUrl || '';
    updatePayload.paragraphText = questionData.paragraphText || '';
    updatePayload.createdAt = new Date().toISOString();
  } else {
    updatePayload.id = qId;
    updatePayload.testId = questionData.testId;
    if (questionData.question !== undefined) updatePayload.question = questionData.question;
    if (questionData.options !== undefined) updatePayload.options = questionData.options;
    if (questionData.correctAnswer !== undefined) updatePayload.correctAnswer = questionData.correctAnswer;
    if (questionData.explanation !== undefined) updatePayload.explanation = questionData.explanation;
    if (questionData.subject !== undefined) updatePayload.subject = questionData.subject;
    if (questionData.topic !== undefined) updatePayload.topic = questionData.topic;
    if (questionData.difficulty !== undefined) updatePayload.difficulty = questionData.difficulty;
    if (questionData.type !== undefined) updatePayload.type = questionData.type;
    if (questionData.imageUrl !== undefined) updatePayload.imageUrl = questionData.imageUrl;
    if (questionData.paragraphText !== undefined) updatePayload.paragraphText = questionData.paragraphText;
    if (questionData.marks !== undefined) updatePayload.marks = Number(questionData.marks);
  }

  const fullQ = { ...existingQ, ...updatePayload } as Question;
  const qIdx = memoryQuestions.findIndex(q => q.id === qId);
  if (qIdx >= 0) {
    memoryQuestions[qIdx] = fullQ;
  } else {
    memoryQuestions.push(fullQ);
  }
  notifyQuestions(questionData.testId);

  // DUAL WRITE: Supabase write
  if (isSupabaseConfigured) {
    saveSupabaseQuestion(fullQ).catch(e => console.error('Supabase question write error:', e));
  }

  // DUAL WRITE: Firestore write
  try {
    await setDoc(doc(db, 'questions', qId), updatePayload, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `questions/${qId}`);
  }

  return qId;
}

export async function saveQuestionsBulk(questionsList: Partial<Question>[], testId: string): Promise<number> {
  let count = 0;
  for (const qData of questionsList) {
    await saveQuestion({ ...qData, testId }, true);
    count++;
  }

  const qList = memoryQuestions.filter(q => q.testId === testId);
  await saveTest({ id: testId, totalQuestions: qList.length });
  return count;
}

export async function deleteAllQuestionsByTestId(testId: string): Promise<void> {
  memoryQuestions = memoryQuestions.filter(q => q.testId !== testId);
  notifyQuestions(testId);

  if (isSupabaseConfigured) {
    fetchSupabaseQuestions(testId).then(list => {
      list?.forEach(q => deleteSupabaseQuestion(q.id));
    });
  }

  try {
    const qRef = collection(db, 'questions');
    const qQuery = query(qRef, where('testId', '==', testId));
    const snapshot = await getDocs(qQuery);
    const deletePromises = snapshot.docs.map(qDoc => deleteDoc(doc(db, 'questions', qDoc.id)));
    await Promise.all(deletePromises);
    await saveTest({ id: testId, totalQuestions: 0 });
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `questions?testId=${testId}`);
  }
}

export async function deleteQuestion(qId: string, testId: string): Promise<void> {
  memoryQuestions = memoryQuestions.filter(q => q.id !== qId);
  notifyQuestions(testId);

  // Dual Delete
  if (isSupabaseConfigured) {
    deleteSupabaseQuestion(qId).catch(e => console.error('Supabase question delete error:', e));
  }

  try {
    await deleteDoc(doc(db, 'questions', qId));
    const qList = memoryQuestions.filter(q => q.testId === testId);
    await saveTest({ id: testId, totalQuestions: qList.length });
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `questions/${qId}`);
  }
}

// --- APPOINTMENTS & CONTACT FORM DUAL WRITE ---

export async function saveAppointment(appointmentData: {
  name: string;
  email?: string;
  phone?: string;
  subject?: string;
  message?: string;
  date?: string;
}): Promise<string> {
  const aptId = `apt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const payload = {
    id: aptId,
    name: appointmentData.name,
    email: appointmentData.email || '',
    phone: appointmentData.phone || '',
    subject: appointmentData.subject || 'Appointment Booking',
    message: appointmentData.message || '',
    date: appointmentData.date || new Date().toISOString().split('T')[0],
    createdAt: new Date().toISOString()
  };

  if (isSupabaseConfigured) {
    saveSupabaseAppointment(payload).catch(e => console.error('Supabase save appointment error:', e));
  }

  try {
    await setDoc(doc(db, 'appointments', aptId), payload);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `appointments/${aptId}`);
  }

  return aptId;
}

// --- NOTICES ---

export async function getNotices(): Promise<Notice[]> {
  let fetchedFirestore = false;
  try {
    const snapshot = await getDocs(collection(db, 'notices'));
    const list: Notice[] = [];
    snapshot.forEach(docSnap => {
      list.push({ id: docSnap.id, ...docSnap.data() } as Notice);
    });
    if (list.length > 0) {
      memoryNotices = list;
      fetchedFirestore = true;
      if (isSupabaseConfigured) {
        for (const n of list) {
          saveSupabaseNotice(n).catch(e => {});
        }
      }
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, 'notices');
  }

  if (!fetchedFirestore && isSupabaseConfigured) {
    try {
      const supaNotices = await fetchSupabaseNotices();
      if (supaNotices && supaNotices.length > 0) {
        memoryNotices = supaNotices;
      }
    } catch (e) {
      console.error('Supabase getNotices error:', e);
    }
  }

  return memoryNotices;
}

export async function saveNotice(noticeData: Partial<Notice>, isNew: boolean = false): Promise<string> {
  const nId = noticeData.id || `notice-${Date.now()}`;

  const fullNotice: Notice = {
    id: nId,
    title: noticeData.title || 'New Notice',
    content: noticeData.content || '',
    category: noticeData.category || 'General',
    date: noticeData.date || new Date().toISOString().split('T')[0],
    isImportant: noticeData.isImportant !== undefined ? Boolean(noticeData.isImportant) : false,
    linkUrl: noticeData.linkUrl || '',
  };

  const idx = memoryNotices.findIndex(n => n.id === nId);
  if (idx >= 0) {
    memoryNotices[idx] = fullNotice;
  } else {
    memoryNotices.unshift(fullNotice);
  }
  notifyNotices();

  // Dual Write
  if (isSupabaseConfigured) {
    saveSupabaseNotice(fullNotice).catch(e => console.error('Supabase notice save error:', e));
  }

  try {
    await setDoc(doc(db, 'notices', nId), fullNotice, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `notices/${nId}`);
  }

  return nId;
}

export async function deleteNotice(noticeId: string): Promise<void> {
  memoryNotices = memoryNotices.filter(n => n.id !== noticeId);
  notifyNotices();

  if (isSupabaseConfigured) {
    deleteSupabaseNotice(noticeId).catch(e => console.error('Supabase notice delete error:', e));
  }

  try {
    await deleteDoc(doc(db, 'notices', noticeId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `notices/${noticeId}`);
  }
}

// --- RESULTS & LEADERBOARD ---

export function subscribeToResults(callback: Callback<ExamResult[]>): () => void {
  resultsSubscribers.add(callback);
  callback([...memoryResults]);

  if (isSupabaseConfigured) {
    fetchSupabaseResults().then(supaRes => {
      if (supaRes && supaRes.length > 0) {
        memoryResults = supaRes;
        notifyResults();
      }
    }).catch(e => {});
  }

  const unsub = onSnapshot(collection(db, 'results'), (snapshot) => {
    const list: ExamResult[] = [];
    snapshot.forEach(docSnap => {
      list.push({ id: docSnap.id, ...docSnap.data() } as ExamResult);
    });
    list.sort((a, b) => new Date(b.submittedAt || 0).getTime() - new Date(a.submittedAt || 0).getTime());
    memoryResults = list;
    notifyResults();
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, 'results');
    if (isSupabaseConfigured) {
      fetchSupabaseResults().then(supa => {
        if (supa && supa.length > 0) {
          memoryResults = supa;
          notifyResults();
        }
      });
    } else {
      callback([...memoryResults]);
    }
  });

  return () => {
    resultsSubscribers.delete(callback);
    unsub();
  };
}

export async function submitTestResult(result: ExamResult): Promise<string> {
  const currentTest = memoryTests.find(t => t.id === result.testId) || await getTestById(result.testId);
  const version = result.testVersion || currentTest?.testVersion || 1;
  result.testVersion = version;

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

  if (currentTest) {
    const updatedCount = (currentTest.attemptsCount || 0) + 1;
    await saveTest({ id: result.testId, attemptsCount: updatedCount });
  }

  // Reactive memory update
  memoryResults = [result, ...memoryResults.filter(r => r.id !== result.id)];
  memoryLeaderboard = [lbEntry, ...memoryLeaderboard.filter(l => l.id !== lbEntry.id)];
  notifyResults();
  notifyLeaderboard();

  // DUAL WRITE: Supabase
  if (isSupabaseConfigured) {
    saveSupabaseResult(result).catch(e => console.error('Supabase save result error:', e));
    saveSupabaseLeaderboard(lbEntry).catch(e => console.error('Supabase save leaderboard error:', e));
  }

  // DUAL WRITE: Firestore
  try {
    await setDoc(doc(db, 'results', result.id), result);
    await setDoc(doc(db, 'leaderboard', lbEntry.id), lbEntry);

    localStorage.setItem(`completed_test_${result.testId}_v${version}`, JSON.stringify(result));
    localStorage.setItem(`completed_test_${result.testId}`, JSON.stringify(result));

    if (result.studentName) {
      const normName = result.studentName.trim().toLowerCase();
      localStorage.setItem(`completed_cand_${result.testId}__${normName}_v${version}`, JSON.stringify(result));
      localStorage.setItem(`completed_cand_${result.testId}_${normName}`, JSON.stringify(result));
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `results/${result.id}`);
  }

  return result.id;
}

export async function checkExistingAttempt(
  _testId: string,
  _studentName?: string,
  _studentMobile?: string,
  _studentEmail?: string
): Promise<ExamResult | null> {
  return null;
}

export async function resetTestAttempts(testId: string, clearAllResultsData: boolean = false): Promise<number> {
  const currentTest = memoryTests.find(t => t.id === testId) || await getTestById(testId);
  const currentVer = currentTest?.testVersion || 1;
  const newVer = currentVer + 1;

  await saveTest({
    id: testId,
    testVersion: newVer,
    attemptsCount: clearAllResultsData ? 0 : (currentTest?.attemptsCount || 0),
    updatedAt: new Date().toISOString()
  });

  if (clearAllResultsData) {
    const allRes = await getResults();
    const testRes = allRes.filter(r => r.testId === testId);
    for (const r of testRes) {
      await deleteResult(r.id);
    }
  }

  return newVer;
}

export async function getResults(): Promise<ExamResult[]> {
  let fetchedFirestore = false;
  try {
    const snapshot = await getDocs(collection(db, 'results'));
    const list: ExamResult[] = [];
    snapshot.forEach(docSnap => {
      list.push({ id: docSnap.id, ...docSnap.data() } as ExamResult);
    });
    memoryResults = list;
    fetchedFirestore = true;
    if (list.length > 0 && isSupabaseConfigured) {
      for (const r of list) {
        saveSupabaseResult(r).catch(e => {});
      }
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, 'results');
  }

  if (!fetchedFirestore && isSupabaseConfigured) {
    try {
      const supaResults = await fetchSupabaseResults();
      if (supaResults && supaResults.length > 0) {
        memoryResults = supaResults;
      }
    } catch (e) {
      console.error('Supabase getResults error:', e);
    }
  }

  notifyResults();
  return memoryResults;
}

export async function deleteResult(resultId: string): Promise<void> {
  const targetResult = memoryResults.find(r => r.id === resultId);

  // Clear memory state instantly
  memoryResults = memoryResults.filter(r => r.id !== resultId);
  memoryLeaderboard = memoryLeaderboard.filter(l => l.id !== `lb-${resultId}` && l.id !== resultId);
  notifyResults();
  notifyLeaderboard();

  // Clear local storage keys if present
  if (targetResult) {
    try {
      localStorage.removeItem(`completed_test_${targetResult.testId}_v${targetResult.testVersion || 1}`);
      localStorage.removeItem(`completed_test_${targetResult.testId}`);
      if (targetResult.studentName) {
        const normName = targetResult.studentName.trim().toLowerCase();
        localStorage.removeItem(`completed_cand_${targetResult.testId}__${normName}_v${targetResult.testVersion || 1}`);
        localStorage.removeItem(`completed_cand_${targetResult.testId}_${normName}`);
      }
    } catch (e) {}
  }

  // Dual Delete from Supabase
  if (isSupabaseConfigured) {
    try {
      await deleteSupabaseResult(resultId);
    } catch (e) {
      console.error('Supabase result delete error:', e);
    }
  }

  // Dual Delete from Firestore
  try {
    await deleteDoc(doc(db, 'results', resultId));
    await deleteDoc(doc(db, 'leaderboard', `lb-${resultId}`));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `results/${resultId}`);
  }
}

// Bulk Sync helper function to replicate all current data into Supabase
export async function syncAllDataToSupabase(): Promise<{ tests: number; questions: number; notices: number; results: number }> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase client is not configured.');
  }

  const tests = await getTests();
  const questions = await getAllQuestions();
  const notices = await getNotices();
  const results = await getResults();
  const settings = await getSiteSettings();

  // Sync tests
  for (const t of tests) {
    await saveSupabaseTest(t);
  }

  // Sync questions
  for (const q of questions) {
    await saveSupabaseQuestion(q);
  }

  // Sync notices
  for (const n of notices) {
    await saveSupabaseNotice(n);
  }

  // Sync results & leaderboard
  for (const r of results) {
    await saveSupabaseResult(r);
    const lbEntry: LeaderboardEntry = {
      id: `lb-${r.id}`,
      studentName: r.studentName,
      testTitle: r.testTitle,
      score: r.score,
      totalMarks: r.totalMarks,
      percentage: r.percentage,
      timeTakenFormatted: `${Math.floor((r.timeTakenSeconds || 0) / 60)}m ${(r.timeTakenSeconds || 0) % 60}s`,
      date: (r.submittedAt || new Date().toISOString()).split('T')[0],
    };
    await saveSupabaseLeaderboard(lbEntry);
  }

  // Sync settings
  await saveSupabaseSettings(settings);

  return {
    tests: tests.length,
    questions: questions.length,
    notices: notices.length,
    results: results.length
  };
}

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  let fetchedFirestore = false;
  try {
    const snapshot = await getDocs(collection(db, 'leaderboard'));
    const list: LeaderboardEntry[] = [];
    snapshot.forEach(docSnap => {
      list.push({ id: docSnap.id, ...docSnap.data() } as LeaderboardEntry);
    });
    list.sort((a, b) => b.percentage - a.percentage);
    list.forEach((e, i) => { e.rank = i + 1; });
    if (list.length > 0) {
      memoryLeaderboard = list;
      fetchedFirestore = true;
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, 'leaderboard');
  }

  if (!fetchedFirestore && isSupabaseConfigured) {
    try {
      const supa = await fetchSupabaseLeaderboard();
      if (supa && supa.length > 0) {
        memoryLeaderboard = supa;
      }
    } catch (e) {}
  }

  return memoryLeaderboard;
}
