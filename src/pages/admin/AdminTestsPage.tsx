import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { AdminSidebar } from '../../components/admin/AdminSidebar';
import { Test, CategoryType } from '../../types';
import { subscribeToTests, saveTest, deleteTest, resetTestAttempts } from '../../firebase/services';
import { CATEGORIES } from '../../components/home/CategoryPills';
import { computeTestStatus, formatDateTime, getTimeDifferenceText } from '../../utils/testHelpers';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Eye, 
  HelpCircle, 
  CheckCircle, 
  XCircle, 
  X, 
  Clock, 
  Award, 
  Image as ImageIcon,
  RotateCcw,
  RefreshCw,
  Zap,
  ShieldAlert,
  Calendar,
  AlertCircle,
  Timer,
  Upload
} from 'lucide-react';
import { convertImageToWebP } from '../../utils/imageUtils';

export const AdminTestsPage: React.FC = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingTest, setEditingTest] = useState<Partial<Test> | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Reset Attempts Modal
  const [resetTargetTest, setResetTargetTest] = useState<Test | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [resetSuccessMsg, setResetSuccessMsg] = useState('');

  useEffect(() => {
    if (!isAdmin) {
      navigate('/admin');
      return;
    }

    const unsub = subscribeToTests((data) => {
      setTests(data);
      setLoading(false);
    }, false);

    return () => unsub();
  }, [isAdmin, navigate]);

  const handleOpenNewModal = () => {
    setEditingTest({
      title: '',
      description: '',
      category: 'SSC',
      imageUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=600&q=80',
      durationMins: 15,
      totalQuestions: 10,
      totalMarks: 20,
      negativeMarking: 0.5,
      passingMarks: 8,
      marksPerQuestion: 2,
      instructions: ['Read questions carefully before answering.'],
      isPublished: true,
      isPopular: false,
      isFeatured: false,
      allowRetake: false,
      autoSchedule: false,
      startTime: '',
      endTime: '',
      testVersion: 1,
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (t: Test) => {
    setEditingTest({ ...t });
    setShowModal(true);
  };

  const handleResetAttempts = async (clearAllData: boolean) => {
    if (!resetTargetTest || isResetting) return;

    try {
      setIsResetting(true);
      const newVer = await resetTestAttempts(resetTargetTest.id, clearAllData);
      setResetSuccessMsg(
        clearAllData 
          ? `Cleared all past results! Test reset to Version ${newVer}.`
          : `Started New Test Session (Version ${newVer})! Students who attempted older paper can now take this updated test paper today.`
      );
      setTimeout(() => {
        setResetTargetTest(null);
        setResetSuccessMsg('');
      }, 2500);
    } catch (e: any) {
      alert(e.message || 'Error resetting test attempts.');
    } finally {
      setIsResetting(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTest || !editingTest.title || isSaving) return;

    try {
      setIsSaving(true);
      await saveTest(editingTest, !editingTest.id);
      setShowModal(false);
    } catch (err: any) {
      alert(err.message || 'Error saving test. Duplicate check failed.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (testId: string) => {
    if (window.confirm('Are you sure you want to delete this test and its linked questions?')) {
      await deleteTest(testId);
    }
  };

  const handleTogglePublish = async (t: Test) => {
    await saveTest({ ...t, isPublished: !t.isPublished });
  };

  if (!isAdmin) return null;

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans">
      <AdminSidebar />

      <div className="flex-1 p-6 sm:p-10 overflow-y-auto">
        
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-800">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              Mock Test Series Management
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Create, edit, publish, or draft exam papers with custom duration & negative marking
            </p>
          </div>

          <button
            onClick={handleOpenNewModal}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-lg shadow-purple-600/25 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Test</span>
          </button>
        </div>

        {/* Tests List */}
        {loading ? (
          <div className="py-16 text-center text-slate-500">Loading tests...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tests.map(test => {
              const status = computeTestStatus(test);
              return (
                <div
                  key={test.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="px-2.5 py-0.5 bg-purple-950 text-purple-300 border border-purple-800 text-[10px] font-bold uppercase rounded">
                          {test.category}
                        </span>

                        {status === 'upcoming' && (
                          <span className="px-2 py-0.5 bg-amber-950 text-amber-300 border border-amber-800 text-[10px] font-bold rounded flex items-center gap-1">
                            <Clock className="w-3 h-3 text-amber-400" /> SCHEDULED
                          </span>
                        )}

                        {status === 'expired' && (
                          <span className="px-2 py-0.5 bg-slate-800 text-slate-400 border border-slate-700 text-[10px] font-bold rounded flex items-center gap-1">
                            <AlertCircle className="w-3 h-3 text-slate-400" /> EXPIRED
                          </span>
                        )}

                        {status === 'live' && test.isPublished && (
                          <span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold rounded flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" /> LIVE
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => handleTogglePublish(test)}
                        className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded cursor-pointer ${
                          test.isPublished 
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' 
                            : 'bg-rose-950 text-rose-300 border border-rose-800'
                        }`}
                      >
                        {test.isPublished ? 'PUBLISHED' : 'DRAFT'}
                      </button>
                    </div>

                  <h3 className="font-bold text-base text-white mb-2 line-clamp-2">
                    {test.title}
                  </h3>

                  <p className="text-xs text-slate-400 line-clamp-2 mb-4">
                    {test.description}
                  </p>

                  <div className="grid grid-cols-3 gap-2 py-2 px-3 bg-slate-800/60 rounded-xl text-center text-xs font-bold mb-4">
                    <div>
                      <span className="block text-[10px] text-slate-500">Duration</span>
                      <span>{test.durationMins}m</span>
                    </div>
                    <div className="border-x border-slate-700">
                      <span className="block text-[10px] text-slate-500">Questions</span>
                      <span>{test.totalQuestions}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-500">Marks</span>
                      <span>{test.totalMarks}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                  <button
                    onClick={() => navigate(`/admin/questions?testId=${test.id}`)}
                    className="flex items-center gap-1 text-xs font-bold text-purple-400 hover:underline"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Manage Qs</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setResetTargetTest(test)}
                      className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-extrabold text-amber-300 bg-amber-950/60 border border-amber-800/80 rounded-lg hover:bg-amber-900/80 cursor-pointer transition-all"
                      title="Reset Student Attempts / Enable Re-take"
                    >
                      <RotateCcw className="w-3 h-3 text-amber-400" />
                      <span>Reset Attempts</span>
                    </button>

                    <button
                      onClick={() => handleOpenEditModal(test)}
                      className="p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-lg hover:bg-slate-700"
                      title="Edit Test Details"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDelete(test.id)}
                      className="p-1.5 text-rose-400 hover:text-rose-300 bg-slate-800 rounded-lg hover:bg-rose-950"
                      title="Delete Test"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          </div>
        )}

      </div>

      {/* Create / Edit Modal */}
      {showModal && editingTest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-xl w-full text-white shadow-2xl relative my-8">
            
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-extrabold mb-6">
              {editingTest.id ? 'Edit Examination Paper' : 'Create New Examination Paper'}
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Test Title *</label>
                <input
                  type="text"
                  required
                  value={editingTest.title || ''}
                  onChange={e => setEditingTest({ ...editingTest, title: e.target.value })}
                  placeholder="e.g. SSC CGL Tier-1 Grand Full Mock Test"
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={editingTest.description || ''}
                  onChange={e => setEditingTest({ ...editingTest, description: e.target.value })}
                  placeholder="Comprehensive mock paper according to TCS pattern..."
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Category</label>
                  <select
                    value={editingTest.category || 'SSC'}
                    onChange={e => setEditingTest({ ...editingTest, category: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  >
                    {CATEGORIES.filter(c => c.value !== 'All').map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-300">Thumbnail Image (WebP Auto-Convert)</label>
                    <label className="text-[11px] text-purple-400 hover:text-purple-300 cursor-pointer flex items-center gap-1 font-bold">
                      <Upload className="w-3 h-3" />
                      <span>Upload & WebP Convert</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            try {
                              const result = await convertImageToWebP(file, 800, 500, 0.82);
                              setEditingTest(prev => prev ? ({ ...prev, imageUrl: result.dataUrl }) : null);
                            } catch {
                              alert('Failed to process image');
                            }
                          }
                        }}
                      />
                    </label>
                  </div>
                  <input
                    type="url"
                    value={editingTest.imageUrl || ''}
                    onChange={e => setEditingTest({ ...editingTest, imageUrl: e.target.value })}
                    placeholder="https://i.ibb.co/... or upload file above"
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                  {editingTest.imageUrl && (
                    <div className="mt-2 flex items-center gap-2">
                      <img src={editingTest.imageUrl} alt="Preview" className="w-12 h-12 object-cover rounded-lg border border-slate-700" />
                      <span className="text-[11px] text-slate-400">Preview (Optimized WebP format)</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Exam Options & Marks Configuration */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 bg-slate-800/50 rounded-2xl border border-slate-700/60">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Total Questions</label>
                  <input
                    type="number"
                    value={editingTest.totalQuestions || 10}
                    onChange={e => {
                      const qCount = Number(e.target.value);
                      const perQ = editingTest.marksPerQuestion || 2;
                      setEditingTest({
                        ...editingTest,
                        totalQuestions: qCount,
                        totalMarks: qCount * perQ
                      });
                    }}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm font-bold focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Time (Minutes)</label>
                  <input
                    type="number"
                    value={editingTest.durationMins || 15}
                    onChange={e => setEditingTest({ ...editingTest, durationMins: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm font-bold focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Total Marks</label>
                  <input
                    type="number"
                    value={editingTest.totalMarks || 20}
                    onChange={e => setEditingTest({ ...editingTest, totalMarks: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm font-bold focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Marks per Question</label>
                  <input
                    type="number"
                    step="0.5"
                    value={editingTest.marksPerQuestion || 2}
                    onChange={e => {
                      const perQ = Number(e.target.value);
                      const qCount = editingTest.totalQuestions || 10;
                      setEditingTest({
                        ...editingTest,
                        marksPerQuestion: perQ,
                        totalMarks: qCount * perQ
                      });
                    }}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm font-bold focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Passing Marks</label>
                  <input
                    type="number"
                    value={editingTest.passingMarks ?? 8}
                    onChange={e => setEditingTest({ ...editingTest, passingMarks: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm font-bold focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Negative Marking</label>
                  <input
                    type="number"
                    step="0.05"
                    value={editingTest.negativeMarking ?? 0.5}
                    onChange={e => setEditingTest({ ...editingTest, negativeMarking: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm font-bold focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              {/* Automatic Live & Expiry Schedule Section */}
              <div className="p-4 bg-purple-950/30 border border-purple-800/80 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-purple-400" />
                    <span className="text-xs font-black text-purple-200 uppercase tracking-wide">
                      Automated Live & Expiry Scheduling (समय सेट करें)
                    </span>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-purple-300">
                    <input
                      type="checkbox"
                      checked={editingTest.autoSchedule ?? false}
                      onChange={e => setEditingTest({ ...editingTest, autoSchedule: e.target.checked })}
                      className="rounded text-purple-600 focus:ring-purple-500 w-4 h-4"
                    />
                    <span>Enable Schedule</span>
                  </label>
                </div>

                {editingTest.autoSchedule && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-[11px] font-bold text-purple-200 mb-1 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-emerald-400" /> Test Live Start Time (कब Live होगा)
                      </label>
                      <input
                        type="datetime-local"
                        value={editingTest.startTime ? editingTest.startTime.slice(0, 16) : ''}
                        onChange={e => setEditingTest({ ...editingTest, startTime: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 text-white rounded-xl text-xs font-medium focus:ring-2 focus:ring-purple-500"
                      />
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        {editingTest.startTime ? `Will go Live on: ${formatDateTime(editingTest.startTime)}` : 'Leave blank for immediate Live'}
                      </span>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-purple-200 mb-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 text-rose-400" /> Test Auto Expiry Time (कब Expire होगा)
                      </label>
                      <input
                        type="datetime-local"
                        value={editingTest.endTime ? editingTest.endTime.slice(0, 16) : ''}
                        onChange={e => setEditingTest({ ...editingTest, endTime: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 text-white rounded-xl text-xs font-medium focus:ring-2 focus:ring-purple-500"
                      />
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        {editingTest.endTime ? `Will Expire on: ${formatDateTime(editingTest.endTime)}` : 'Leave blank for lifetime active'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold">
                  <input
                    type="checkbox"
                    checked={editingTest.isPublished ?? true}
                    onChange={e => setEditingTest({ ...editingTest, isPublished: e.target.checked })}
                    className="rounded text-purple-600 focus:ring-purple-500 w-4 h-4"
                  />
                  <span>Publish Paper</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold">
                  <input
                    type="checkbox"
                    checked={editingTest.isPopular ?? false}
                    onChange={e => setEditingTest({ ...editingTest, isPopular: e.target.checked })}
                    className="rounded text-amber-500 focus:ring-amber-500 w-4 h-4"
                  />
                  <span>Mark Popular</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold">
                  <input
                    type="checkbox"
                    checked={editingTest.isFeatured ?? false}
                    onChange={e => setEditingTest({ ...editingTest, isFeatured: e.target.checked })}
                    className="rounded text-purple-500 focus:ring-purple-500 w-4 h-4"
                  />
                  <span>Mark Featured</span>
                </label>
              </div>

              <div className="p-3 bg-slate-800/80 border border-slate-700/80 rounded-2xl space-y-2">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingTest.allowRetake ?? false}
                    onChange={e => setEditingTest({ ...editingTest, allowRetake: e.target.checked })}
                    className="mt-0.5 rounded text-blue-500 focus:ring-blue-500 w-4 h-4"
                  />
                  <div>
                    <span className="text-xs font-bold text-white block">Allow Unlimited Retakes (बार-बार टेस्ट देने की अनुमति दें)</span>
                    <span className="text-[11px] text-slate-400 leading-snug block">If enabled, students can attempt this test paper multiple times. If unchecked (default), students are limited to 1 attempt per paper version.</span>
                  </div>
                </label>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-purple-600/25 disabled:opacity-50 cursor-pointer"
                >
                  {isSaving ? 'Saving Paper...' : 'Save Test'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Attempts Confirmation Modal */}
      {resetTargetTest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="bg-slate-900 border border-amber-500/30 rounded-3xl p-6 sm:p-8 max-w-lg w-full text-white shadow-2xl relative">
            <button
              onClick={() => setResetTargetTest(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 bg-amber-500/10 text-amber-400 rounded-2xl flex items-center justify-center mb-4 border border-amber-500/20">
              <RotateCcw className="w-6 h-6" />
            </div>

            <h3 className="text-xl font-black text-white mb-2">
              Reset Attempts for Candidate Retakes
            </h3>
            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              Paper: <strong className="text-amber-300">{resetTargetTest.title}</strong> (Current Version: v{resetTargetTest.testVersion || 1})
            </p>

            {resetSuccessMsg ? (
              <div className="p-4 bg-emerald-950 border border-emerald-800 text-emerald-200 text-xs font-bold rounded-2xl mb-4 text-center">
                {resetSuccessMsg}
              </div>
            ) : null}

            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              When you edit questions or prepare a new exam paper on an existing test slot, choose how to allow candidates to re-attempt:
            </p>

            <div className="space-y-3">
              <button
                onClick={() => handleResetAttempts(false)}
                disabled={isResetting}
                className="w-full p-4 bg-purple-900/40 hover:bg-purple-800/60 border border-purple-700/80 rounded-2xl text-left transition-all group cursor-pointer"
              >
                <div className="flex items-center justify-between font-bold text-sm text-purple-200 mb-1">
                  <span className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-purple-400 fill-purple-400" />
                    Option 1: Start New Exam Session (v{(resetTargetTest.testVersion || 1) + 1})
                  </span>
                  <span className="text-[10px] bg-purple-950 text-purple-300 px-2 py-0.5 rounded border border-purple-800">RECOMMENDED</span>
                </div>
                <p className="text-xs text-slate-400 leading-normal">
                  Increments paper version to v{(resetTargetTest.testVersion || 1) + 1}. All students can attempt the test paper again today with new questions, while keeping past test result records intact in the system.
                </p>
              </button>

              <button
                onClick={() => handleResetAttempts(true)}
                disabled={isResetting}
                className="w-full p-4 bg-rose-950/30 hover:bg-rose-900/50 border border-rose-800/80 rounded-2xl text-left transition-all group cursor-pointer"
              >
                <div className="flex items-center justify-between font-bold text-sm text-rose-200 mb-1">
                  <span className="flex items-center gap-2">
                    <Trash2 className="w-4 h-4 text-rose-400" />
                    Option 2: Delete All Previous Results & Reset
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-normal">
                  Completely erases all past result cards and leaderboard ranks for this test, allowing everyone to take it again from a blank slate.
                </p>
              </button>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 text-right">
              <button
                type="button"
                onClick={() => setResetTargetTest(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
              >
                Close / Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
