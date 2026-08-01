import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { AdminSidebar } from '../../components/admin/AdminSidebar';
import { Test, CategoryType } from '../../types';
import { subscribeToTests, saveTest, deleteTest } from '../../firebase/services';
import { CATEGORIES } from '../../components/home/CategoryPills';
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
  Image as ImageIcon 
} from 'lucide-react';

export const AdminTestsPage: React.FC = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingTest, setEditingTest] = useState<Partial<Test> | null>(null);
  const [isSaving, setIsSaving] = useState(false);

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
      instructions: ['Read questions carefully before answering.'],
      isPublished: true,
      isPopular: false,
      isFeatured: false,
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (t: Test) => {
    setEditingTest({ ...t });
    setShowModal(true);
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
            {tests.map(test => (
              <div
                key={test.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-2.5 py-0.5 bg-purple-950 text-purple-300 border border-purple-800 text-[10px] font-bold uppercase rounded">
                      {test.category}
                    </span>
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

                  <div className="flex items-center gap-2">
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
            ))}
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
                  <label className="block text-xs font-bold text-slate-300 mb-1">Image URL (IMGBB / Direct)</label>
                  <input
                    type="url"
                    value={editingTest.imageUrl || ''}
                    onChange={e => setEditingTest({ ...editingTest, imageUrl: e.target.value })}
                    placeholder="https://i.ibb.co/..."
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Duration (Mins)</label>
                  <input
                    type="number"
                    value={editingTest.durationMins || 15}
                    onChange={e => setEditingTest({ ...editingTest, durationMins: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Total Marks</label>
                  <input
                    type="number"
                    value={editingTest.totalMarks || 20}
                    onChange={e => setEditingTest({ ...editingTest, totalMarks: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Negative Mark</label>
                  <input
                    type="number"
                    step="0.05"
                    value={editingTest.negativeMarking ?? 0.5}
                    onChange={e => setEditingTest({ ...editingTest, negativeMarking: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold">
                  <input
                    type="checkbox"
                    checked={editingTest.isPublished ?? true}
                    onChange={e => setEditingTest({ ...editingTest, isPublished: e.target.checked })}
                    className="rounded text-purple-600 focus:ring-purple-500 w-4 h-4"
                  />
                  <span>Publish Immediately</span>
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
                  disabled={isSaving}
                  className="px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-purple-600/25 disabled:opacity-50"
                >
                  {isSaving ? 'Saving Paper...' : 'Save Test'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
