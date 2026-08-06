import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { AdminSidebar } from '../../components/admin/AdminSidebar';
import { Question, Test, QuestionType, DifficultyLevel } from '../../types';
import { 
  subscribeToTests, 
  subscribeToQuestionsByTestId, 
  getAllQuestions, 
  saveQuestion, 
  saveQuestionsBulk, 
  deleteQuestion, 
  deleteAllQuestionsByTestId,
  resetTestAttempts
} from '../../firebase/services';
import { Plus, Edit3, Trash2, HelpCircle, FileText, Check, X, Upload, Code, AlertTriangle, RotateCcw, Zap } from 'lucide-react';

import { normalizeQuestionJSON } from '../../utils/helpers';

export const AdminQuestionsPage: React.FC = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const filterTestId = searchParams.get('testId');

  const [tests, setTests] = useState<Test[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedTestId, setSelectedTestId] = useState<string>(filterTestId || '');
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingQ, setEditingQ] = useState<Partial<Question> | null>(null);
  const [isSavingSingle, setIsSavingSingle] = useState(false);

  // Bulk Upload Modal State
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkTestId, setBulkTestId] = useState<string>('');
  const [bulkJsonText, setBulkJsonText] = useState('');
  const [bulkError, setBulkError] = useState('');
  const [bulkSuccess, setBulkSuccess] = useState('');
  const [isBulkSaving, setIsBulkSaving] = useState(false);
  const [bulkResetAttempts, setBulkResetAttempts] = useState(true);

  // Reset Attempts State
  const [isResettingCurrentTest, setIsResettingCurrentTest] = useState(false);
  const [resetSuccessNotice, setResetSuccessNotice] = useState('');

  // Bulk Delete State
  const [isDeletingAll, setIsDeletingAll] = useState(false);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/admin');
      return;
    }

    const unsubTests = subscribeToTests((tList) => {
      setTests(tList);
      if (!selectedTestId && tList.length > 0) {
        setSelectedTestId(tList[0].id);
        setBulkTestId(tList[0].id);
      }
    }, false);

    return () => unsubTests();
  }, [isAdmin, navigate]);

  useEffect(() => {
    if (!selectedTestId) {
      getAllQuestions().then(qList => {
        setQuestions(qList);
        setLoading(false);
      });
      return;
    }
    const unsubQuestions = subscribeToQuestionsByTestId(selectedTestId, (qList) => {
      setQuestions(qList);
      setLoading(false);
    });
    return () => unsubQuestions();
  }, [selectedTestId]);

  const filteredQuestions = selectedTestId
    ? questions.filter(q => q.testId === selectedTestId)
    : questions;

  const handleOpenNewModal = () => {
    setEditingQ({
      testId: selectedTestId || (tests[0]?.id || ''),
      question: '',
      type: 'single',
      options: [
        { id: 'A', text: '' },
        { id: 'B', text: '' },
        { id: 'C', text: '' },
        { id: 'D', text: '' },
      ],
      correctAnswer: 'A',
      explanation: '',
      subject: 'General Knowledge',
      topic: '',
      difficulty: 'Medium',
      marks: 2,
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (q: Question) => {
    setEditingQ({ ...q });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQ || !editingQ.testId || !editingQ.question || isSavingSingle) return;

    try {
      setIsSavingSingle(true);
      await saveQuestion(editingQ as any, !editingQ.id);
      setShowModal(false);
    } catch (err: any) {
      alert(err.message || 'Error saving question. Duplicate check failed.');
    } finally {
      setIsSavingSingle(false);
    }
  };

  const handleDelete = async (qId: string, testId: string) => {
    if (window.confirm('Delete this question permanently?')) {
      await deleteQuestion(qId, testId);
    }
  };

  const handleDeleteAllQuestions = async () => {
    if (!selectedTestId) {
      alert('Please select a specific examination paper to delete all questions.');
      return;
    }
    const currentTest = tests.find(t => t.id === selectedTestId);
    const qCount = filteredQuestions.length;
    if (qCount === 0) {
      alert('There are no questions in this test to delete.');
      return;
    }

    const confirmMsg = `⚠️ Delete ALL Questions?\n\nAre you sure you want to permanently delete ALL ${qCount} questions from "${currentTest?.title || 'Selected Test'}"?\n\nThis action cannot be undone!`;
    if (window.confirm(confirmMsg)) {
      try {
        setIsDeletingAll(true);
        await deleteAllQuestionsByTestId(selectedTestId);
        alert(`Successfully deleted all ${qCount} questions from this test.`);
      } catch (err: any) {
        alert(err.message || 'Error deleting questions.');
      } finally {
        setIsDeletingAll(false);
      }
    }
  };

  const handleLoadSampleJson = () => {
    const sample = [
      {
        question: "What is the capital city of Bihar?",
        options: [
          { id: "A", text: "Patna" },
          { id: "B", text: "Gaya" },
          { id: "C", text: "Muzaffarpur" },
          { id: "D", text: "Bhagalpur" }
        ],
        correctAnswer: "A",
        explanation: "Patna is the capital city of Bihar.",
        subject: "General Knowledge",
        difficulty: "Easy",
        marks: 2
      },
      {
        question: "Which formula represents Water?",
        options: [
          { id: "A", text: "CO2" },
          { id: "B", text: "H2O" },
          { id: "C", text: "NaCl" },
          { id: "D", text: "O2" }
        ],
        correctAnswer: "B",
        explanation: "H2O is the chemical formula for water.",
        subject: "Science",
        difficulty: "Easy",
        marks: 2
      }
    ];
    setBulkJsonText(JSON.stringify(sample, null, 2));
    setBulkError('');
  };

  const handleBulkUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isBulkSaving) return;

    setBulkError('');
    setBulkSuccess('');

    if (!bulkTestId) {
      setBulkError('Please select a target examination paper.');
      return;
    }

    if (!bulkJsonText.trim()) {
      setBulkError('Please paste JSON data of questions.');
      return;
    }

    try {
      setIsBulkSaving(true);
      const parsed = JSON.parse(bulkJsonText);
      const items = Array.isArray(parsed) ? parsed : [parsed];

      if (items.length === 0) {
        setBulkError('No valid question items found in JSON.');
        setIsBulkSaving(false);
        return;
      }

      const validList: Partial<Question>[] = [];
      for (const rawItem of items) {
        const norm = normalizeQuestionJSON(rawItem, bulkTestId);
        if (norm && norm.question) {
          validList.push(norm);
        }
      }

      if (validList.length === 0) {
        setBulkError('No valid question statements found in JSON. Please make sure each item has a question statement and option choices.');
        setIsBulkSaving(false);
        return;
      }

      const count = await saveQuestionsBulk(validList, bulkTestId);

      // Auto-reset candidate attempts by incrementing version if requested
      if (bulkResetAttempts) {
        await resetTestAttempts(bulkTestId, false);
      }

      // Instantly switch view to the target examination paper
      setSelectedTestId(bulkTestId);

      setBulkSuccess(
        bulkResetAttempts
          ? `Successfully added ${count} question(s) and reset student attempts (started new exam session)!`
          : `Successfully added ${count} question(s) to this examination paper!`
      );
      setTimeout(() => {
        setShowBulkModal(false);
        setBulkSuccess('');
        setBulkJsonText('');
      }, 1500);
    } catch (err: any) {
      setBulkError('Invalid JSON format or error saving questions. Please check brackets and quotes.');
    } finally {
      setIsBulkSaving(false);
    }
  };

  const handleResetCurrentTestAttempts = async () => {
    if (!selectedTestId) {
      alert('Please select an examination paper to reset student attempts.');
      return;
    }
    const currentTest = tests.find(t => t.id === selectedTestId);
    if (!currentTest) return;

    if (window.confirm(`🔄 Start New Exam Session for "${currentTest.title}"?\n\nThis will increment paper version to v${(currentTest.testVersion || 1) + 1} so all candidates who attempted this test yesterday can attempt the new test paper today!`)) {
      try {
        setIsResettingCurrentTest(true);
        const newVer = await resetTestAttempts(selectedTestId, false);
        setResetSuccessNotice(`Attempts reset! Paper is now Version v${newVer}. Students can now attempt this test paper today.`);
        setTimeout(() => setResetSuccessNotice(''), 4000);
      } catch (err: any) {
        alert(err.message || 'Error resetting attempts.');
      } finally {
        setIsResettingCurrentTest(false);
      }
    }
  };

  if (!isAdmin) return null;

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans">
      <AdminSidebar />

      <div className="flex-1 p-6 sm:p-10 overflow-y-auto">
        
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-800">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              Question Bank & Item Pool
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Add single MCQ questions or import bulk question sets via JSON
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {selectedTestId && (
              <button
                onClick={handleResetCurrentTestAttempts}
                disabled={isResettingCurrentTest}
                className="flex items-center gap-2 bg-amber-950 hover:bg-amber-900 text-amber-300 border border-amber-800/80 font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow transition-all cursor-pointer disabled:opacity-50"
                title="Reset student attempts so candidates who took yesterday's paper can take today's new paper"
              >
                <RotateCcw className="w-4 h-4 text-amber-400" />
                <span>{isResettingCurrentTest ? 'Resetting...' : 'Reset Student Attempts'}</span>
              </button>
            )}

            {selectedTestId && filteredQuestions.length > 0 && (
              <button
                onClick={handleDeleteAllQuestions}
                disabled={isDeletingAll}
                className="flex items-center gap-2 bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800/80 font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow transition-all cursor-pointer disabled:opacity-50"
                title="Delete all questions in the selected test at once"
              >
                <Trash2 className="w-4 h-4 text-rose-400" />
                <span>{isDeletingAll ? 'Deleting All...' : `Delete All Questions (${filteredQuestions.length})`}</span>
              </button>
            )}

            <button
              onClick={() => {
                setBulkTestId(selectedTestId || (tests[0]?.id || ''));
                setShowBulkModal(true);
              }}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-purple-300 border border-purple-500/30 font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow transition-all cursor-pointer"
            >
              <Upload className="w-4 h-4 text-purple-400" />
              <span>Bulk Upload JSON</span>
            </button>

            <button
              onClick={handleOpenNewModal}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-lg shadow-purple-600/25 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Single Question</span>
            </button>
          </div>
        </div>

        {/* Test Selector Dropdown */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <div className="flex items-center gap-3 flex-1 min-w-[280px]">
            <label className="text-xs font-bold text-slate-400 uppercase shrink-0">Select Examination Paper:</label>
            <select
              value={selectedTestId}
              onChange={e => setSelectedTestId(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-white text-xs sm:text-sm font-bold rounded-xl px-3.5 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 flex-1 max-w-md"
            >
              <option value="">All Tests ({questions.length} Total Qs)</option>
              {tests.map(t => (
                <option key={t.id} value={t.id}>
                  {t.title} ({questions.filter(q => q.testId === t.id).length} Qs)
                </option>
              ))}
            </select>
          </div>

          {selectedTestId && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400">
                Total in this test: <strong className="text-purple-400 font-bold">{filteredQuestions.length}</strong> Qs
              </span>
            </div>
          )}
        </div>

        {/* Reset Success Notice */}
        {resetSuccessNotice && (
          <div className="mb-6 p-4 bg-emerald-950 border border-emerald-800 text-emerald-200 text-xs font-bold rounded-2xl flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              {resetSuccessNotice}
            </span>
            <button onClick={() => setResetSuccessNotice('')} className="p-1 text-emerald-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Questions List */}
        {loading ? (
          <div className="py-16 text-center text-slate-500">Loading Question Pool...</div>
        ) : filteredQuestions.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-400">
            <HelpCircle className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white">No Questions in this Test</h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">Click below to add questions to this mock paper.</p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => {
                  setBulkTestId(selectedTestId || (tests[0]?.id || ''));
                  setShowBulkModal(true);
                }}
                className="bg-slate-800 text-purple-300 border border-purple-500/30 text-xs font-bold px-4 py-2 rounded-xl"
              >
                Bulk Upload JSON
              </button>
              <button
                onClick={handleOpenNewModal}
                className="bg-purple-600 text-white text-xs font-bold px-4 py-2 rounded-xl"
              >
                Add First Question
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredQuestions.map((q, idx) => (
              <div
                key={q.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className="w-7 h-7 bg-purple-600 text-white font-bold text-xs rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                      Q{idx + 1}
                    </span>
                    <div>
                      <h3 className="font-bold text-sm text-white leading-snug">
                        {q.question}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-slate-800 text-slate-400 rounded">
                          {q.subject}
                        </span>
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-amber-950 text-amber-300 rounded">
                          {q.difficulty}
                        </span>
                        <span className="text-[10px] text-emerald-400 font-bold">
                          +{q.marks || 2} Marks
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleOpenEditModal(q)}
                      className="p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-lg"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(q.id, q.testId)}
                      className="p-1.5 text-rose-400 hover:text-rose-300 bg-slate-800 rounded-lg hover:bg-rose-950"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Options display */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-2">
                  {q.options?.map(opt => {
                    const corrArr = Array.isArray(q.correctAnswer) ? q.correctAnswer : [q.correctAnswer];
                    const isCorr = corrArr.includes(opt.id);
                    return (
                      <div
                        key={opt.id}
                        className={`p-2 rounded-xl border flex items-center justify-between ${
                          isCorr
                            ? 'border-emerald-700/80 bg-emerald-950/40 text-emerald-200 font-bold'
                            : 'border-slate-800 bg-slate-800/40 text-slate-300'
                        }`}
                      >
                        <span>{opt.id}. {opt.text}</span>
                        {isCorr && <Check className="w-4 h-4 text-emerald-400" />}
                      </div>
                    );
                  })}
                </div>

                {q.explanation && (
                  <p className="text-[11px] text-slate-400 italic bg-slate-800/40 p-2.5 rounded-xl border border-slate-800">
                    💡 Explanation: {q.explanation}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Bulk Upload Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-2xl w-full text-white shadow-2xl relative my-8">
            <button
              onClick={() => setShowBulkModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-2">
              <Upload className="w-6 h-6 text-purple-400" />
              <h3 className="text-xl font-extrabold text-white">Bulk Question Import (JSON)</h3>
            </div>
            <p className="text-xs text-slate-400 mb-6">
              Paste an array of questions in JSON format to quickly add multiple questions at once.
            </p>

            {bulkError && (
              <div className="mb-4 p-3 bg-rose-950/60 border border-rose-800 text-rose-300 text-xs rounded-xl font-medium">
                {bulkError}
              </div>
            )}

            {bulkSuccess && (
              <div className="mb-4 p-3 bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs rounded-xl font-medium">
                {bulkSuccess}
              </div>
            )}

            <form onSubmit={handleBulkUploadSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Target Examination Paper *</label>
                <select
                  value={bulkTestId}
                  onChange={e => setBulkTestId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
                >
                  {tests.map(t => (
                    <option key={t.id} value={t.id}>{t.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-300">JSON Data *</label>
                  <button
                    type="button"
                    onClick={handleLoadSampleJson}
                    className="text-[11px] text-purple-400 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <Code className="w-3.5 h-3.5" />
                    <span>Load Sample JSON Template</span>
                  </button>
                </div>
                <textarea
                  rows={10}
                  required
                  value={bulkJsonText}
                  onChange={e => setBulkJsonText(e.target.value)}
                  placeholder='[&#10;  {&#10;    "question": "What is 2 + 2?",&#10;    "options": [&#10;      { "id": "A", "text": "3" },&#10;      { "id": "B", "text": "4" },&#10;      { "id": "C", "text": "5" },&#10;      { "id": "D", "text": "6" }&#10;    ],&#10;    "correctAnswer": "B"&#10;  }&#10;]'
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-purple-200 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={bulkResetAttempts}
                    onChange={e => setBulkResetAttempts(e.target.checked)}
                    className="mt-0.5 rounded text-purple-600 focus:ring-purple-500 w-4 h-4"
                  />
                  <div>
                    <span className="text-xs font-bold text-amber-300 block">Start New Exam Session (Increment Paper Version)</span>
                    <span className="text-[11px] text-slate-400 leading-snug block">Allows candidates who attempted yesterday's test paper to re-attempt this new updated test paper today!</span>
                  </div>
                </label>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowBulkModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isBulkSaving}
                  className="px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-purple-600/25 disabled:opacity-50"
                >
                  {isBulkSaving ? 'Importing Questions...' : 'Import Questions'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal for Adding/Editing Single Question */}
      {showModal && editingQ && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-2xl w-full text-white shadow-2xl relative my-8">
            
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-extrabold mb-6">
              {editingQ.id ? 'Edit Question' : 'Add New Question'}
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Linked Exam Paper *</label>
                  <select
                    value={editingQ.testId || ''}
                    onChange={e => setEditingQ({ ...editingQ, testId: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  >
                    {tests.map(t => (
                      <option key={t.id} value={t.id}>{t.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Question Type</label>
                  <select
                    value={editingQ.type || 'single'}
                    onChange={e => setEditingQ({ ...editingQ, type: e.target.value as QuestionType })}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  >
                    <option value="single">Single Correct MCQ</option>
                    <option value="multiple">Multiple Correct MCQ</option>
                    <option value="true_false">True / False</option>
                    <option value="paragraph">Paragraph / Comprehension</option>
                  </select>
                </div>
              </div>

              {editingQ.type === 'paragraph' && (
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Passage / Case Study Text</label>
                  <textarea
                    rows={2}
                    value={editingQ.paragraphText || ''}
                    onChange={e => setEditingQ({ ...editingQ, paragraphText: e.target.value })}
                    placeholder="Enter reading comprehension passage..."
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Question Statement *</label>
                <textarea
                  rows={2}
                  required
                  value={editingQ.question || ''}
                  onChange={e => setEditingQ({ ...editingQ, question: e.target.value })}
                  placeholder="Enter main question text..."
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Image URL (Optional)</label>
                <input
                  type="url"
                  value={editingQ.imageUrl || ''}
                  onChange={e => setEditingQ({ ...editingQ, imageUrl: e.target.value })}
                  placeholder="Optional image link..."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs"
                />
              </div>

              {/* Options Section */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-300">Option Choices:</label>
                {['A', 'B', 'C', 'D'].map((optKey, i) => {
                  const currentOpt = editingQ.options?.[i] || { id: optKey, text: '' };
                  return (
                    <div key={optKey} className="flex items-center gap-2">
                      <span className="w-6 text-center font-bold text-xs">{optKey}.</span>
                      <input
                        type="text"
                        required
                        value={currentOpt.text}
                        onChange={e => {
                          const updatedOpts = [...(editingQ.options || [])];
                          updatedOpts[i] = { ...currentOpt, id: optKey, text: e.target.value };
                          setEditingQ({ ...editingQ, options: updatedOpts });
                        }}
                        placeholder={`Option ${optKey} text`}
                        className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs"
                      />
                    </div>
                  );
                })}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Correct Answer (e.g. A or A,B)</label>
                  <input
                    type="text"
                    required
                    value={Array.isArray(editingQ.correctAnswer) ? editingQ.correctAnswer.join(',') : (editingQ.correctAnswer || 'A')}
                    onChange={e => {
                      const val = e.target.value.toUpperCase();
                      if (editingQ.type === 'multiple') {
                        setEditingQ({ ...editingQ, correctAnswer: val.split(',').map(s => s.trim()) });
                      } else {
                        setEditingQ({ ...editingQ, correctAnswer: val });
                      }
                    }}
                    placeholder="A"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-emerald-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Subject</label>
                  <input
                    type="text"
                    value={editingQ.subject || 'General Knowledge'}
                    onChange={e => setEditingQ({ ...editingQ, subject: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Explanation / Solution Key</label>
                <textarea
                  rows={2}
                  value={editingQ.explanation || ''}
                  onChange={e => setEditingQ({ ...editingQ, explanation: e.target.value })}
                  placeholder="Provide detailed solution explanation..."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs"
                />
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingSingle}
                  className="px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-purple-600/25 disabled:opacity-50"
                >
                  {isSavingSingle ? 'Saving Question...' : 'Save Question'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
