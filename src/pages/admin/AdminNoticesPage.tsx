import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { AdminSidebar } from '../../components/admin/AdminSidebar';
import { Notice } from '../../types';
import { subscribeToNotices, saveNotice, deleteNotice, deleteAllNotices } from '../../firebase/services';
import { 
  Bell, 
  Plus, 
  Trash2, 
  Edit3, 
  ExternalLink, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  Calendar, 
  X, 
  Link as LinkIcon,
  Megaphone,
  Check
} from 'lucide-react';

export const AdminNoticesPage: React.FC = () => {
  const { isAdmin } = useAuth();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);
  const [isDeleteAllConfirmOpen, setIsDeleteAllConfirmOpen] = useState(false);
  const [deletingSingleId, setDeletingSingleId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'Exam Alert',
    date: new Date().toISOString().split('T')[0],
    isImportant: false,
    linkUrl: '',
  });

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const unsub = subscribeToNotices((data) => {
      setNotices(data);
    });
    return () => unsub();
  }, []);

  const handleOpenAddModal = () => {
    setEditingNotice(null);
    setFormData({
      title: '',
      content: '',
      category: 'Exam Alert',
      date: new Date().toISOString().split('T')[0],
      isImportant: false,
      linkUrl: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (notice: Notice) => {
    setEditingNotice(notice);
    setFormData({
      title: notice.title || '',
      content: notice.content || '',
      category: notice.category || 'General',
      date: notice.date || new Date().toISOString().split('T')[0],
      isImportant: Boolean(notice.isImportant),
      linkUrl: notice.linkUrl || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    setSaving(true);
    try {
      await saveNotice({
        id: editingNotice ? editingNotice.id : undefined,
        title: formData.title.trim(),
        content: formData.content.trim(),
        category: formData.category,
        date: formData.date,
        isImportant: formData.isImportant,
        linkUrl: formData.linkUrl.trim(),
      }, !editingNotice);

      setSuccessMsg(editingNotice ? 'Notice updated successfully!' : 'New Notice published successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
      setIsModalOpen(false);
    } catch (err) {
      console.error('Save notice error:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSingle = async (id: string) => {
    try {
      await deleteNotice(id);
      setDeletingSingleId(null);
    } catch (err) {
      console.error('Delete notice error:', err);
    }
  };

  const handleDeleteAll = async () => {
    try {
      await deleteAllNotices();
      setIsDeleteAllConfirmOpen(false);
      setSuccessMsg('All notices cleared successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error('Delete all notices error:', err);
    }
  };

  if (!isAdmin) {
    return <div className="p-8 text-center text-slate-400">Access Denied</div>;
  }

  // Filter logic
  const filteredNotices = notices.filter(n => {
    const matchesSearch = n.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          n.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || n.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = ['All', 'Exam Alert', 'Syllabus Update', 'Admit Card', 'Results', 'Notification', 'General'];

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans">
      <AdminSidebar />

      <main className="flex-1 p-6 sm:p-8 max-w-7xl mx-auto overflow-y-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
                <Bell className="w-5 h-5" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white">Notice Board Management</h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Publish, edit, or delete exam notifications, official news links, and syllabus alerts for students.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {notices.length > 0 && (
              <button
                onClick={() => setIsDeleteAllConfirmOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold transition"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete All Notices ({notices.length})</span>
              </button>
            )}

            <button
              onClick={handleOpenAddModal}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-amber-500/20 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Notice</span>
            </button>
          </div>
        </div>

        {/* Success Alert */}
        {successMsg && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Filters and Search Bar */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search notices by keyword..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            <span className="text-xs text-slate-400 font-bold mr-1 shrink-0">Category:</span>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition ${
                  categoryFilter === cat
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Notice List */}
        {filteredNotices.length === 0 ? (
          <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-12 text-center">
            <Megaphone className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-300">No Notices Found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {notices.length === 0 
                ? "There are currently no active notices on the platform. Click 'Create New Notice' to publish one." 
                : "No notices match your search term or category filter."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredNotices.map(notice => (
              <div
                key={notice.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 flex flex-col justify-between transition group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-md font-bold text-[10px] uppercase">
                        {notice.category || 'General'}
                      </span>
                      {notice.isImportant && (
                        <span className="px-2 py-0.5 bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded font-extrabold text-[10px] uppercase animate-pulse">
                          High Priority
                        </span>
                      )}
                    </div>

                    <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {notice.date}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-white mb-2 leading-snug group-hover:text-amber-400 transition-colors">
                    {notice.title}
                  </h3>

                  <p className="text-xs text-slate-400 leading-relaxed mb-4 line-clamp-3">
                    {notice.content}
                  </p>

                  {notice.linkUrl && (
                    <div className="mb-4 p-2.5 bg-slate-950 rounded-xl border border-slate-800/80 flex items-center justify-between">
                      <div className="flex items-center gap-2 overflow-hidden text-xs text-blue-400 font-mono truncate">
                        <LinkIcon className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                        <span className="truncate">{notice.linkUrl}</span>
                      </div>
                      <a
                        href={notice.linkUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 text-slate-400 hover:text-white transition shrink-0"
                        title="Test Link (Opens in new tab)"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-end gap-2">
                  <button
                    onClick={() => handleOpenEditModal(notice)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>

                  <button
                    onClick={() => setDeletingSingleId(notice.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-bold transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </main>

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative animate-fadeIn">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-400" />
                <span>{editingNotice ? 'Edit Notice' : 'Create New Notice'}</span>
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Notice Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. BSEB 10th Result Date Declared / Bihar Board Update"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Category / Type
                  </label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Exam Alert">Exam Alert</option>
                    <option value="Syllabus Update">Syllabus Update</option>
                    <option value="Admit Card">Admit Card</option>
                    <option value="Results">Results</option>
                    <option value="Notification">Notification</option>
                    <option value="General">General</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Description / Details
                </label>
                <textarea
                  rows={3}
                  placeholder="Enter notice explanation or details for students..."
                  value={formData.content}
                  onChange={e => setFormData({ ...formData, content: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  External Official Link (URL)
                </label>
                <div className="relative">
                  <LinkIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="url"
                    placeholder="https://official-portal.gov.in/news-pdf"
                    value={formData.linkUrl}
                    onChange={e => setFormData({ ...formData, linkUrl: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  Students can click this link on the notice board to navigate directly to the original official site.
                </p>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isImportantToggle"
                  checked={formData.isImportant}
                  onChange={e => setFormData({ ...formData, isImportant: e.target.checked })}
                  className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 bg-slate-950 border-slate-800"
                />
                <label htmlFor="isImportantToggle" className="text-xs font-bold text-slate-300 select-none cursor-pointer">
                  Mark as High Priority / Important Notice (Pulsing Badge)
                </label>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold shadow-md transition flex items-center gap-1.5 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : (editingNotice ? 'Update Notice' : 'Publish Notice')}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* CONFIRM DELETE SINGLE MODAL */}
      {deletingSingleId && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto mb-4 border border-rose-500/20">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-base font-black text-white mb-1">Delete Notice?</h3>
            <p className="text-xs text-slate-400 mb-6">
              This action will permanently delete this notice from Firestore & Supabase.
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setDeletingSingleId(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
              >
                Cancel
              </button>

              <button
                onClick={() => handleDeleteSingle(deletingSingleId)}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition"
              >
                Delete Notice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE ALL MODAL */}
      {isDeleteAllConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-500/30 rounded-2xl max-w-md w-full p-6 text-center shadow-2xl">
            <div className="w-14 h-14 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-4 border border-rose-500/40">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <h3 className="text-lg font-black text-white mb-1">Delete All Notices?</h3>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              Are you sure you want to delete all <strong className="text-rose-400">{notices.length} notices</strong>? This will clear the notice board completely for both Firestore and Supabase.
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setIsDeleteAllConfirmOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
              >
                Cancel
              </button>

              <button
                onClick={handleDeleteAll}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-extrabold shadow-lg shadow-rose-600/30 transition"
              >
                Yes, Delete All
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
