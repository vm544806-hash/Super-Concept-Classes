import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { AdminSidebar } from '../../components/admin/AdminSidebar';
import { ExamResult } from '../../types';
import { subscribeToResults, deleteResult } from '../../firebase/services';
import { Search, Trash2, Award, FileSpreadsheet, Mail, Phone, User, Calendar, CheckCircle2, XCircle, MinusCircle, CheckSquare, Square, AlertOctagon } from 'lucide-react';

export const AdminResultsPage: React.FC = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  const [results, setResults] = useState<ExamResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/admin');
      return;
    }

    const unsub = subscribeToResults((data) => {
      setResults(data);
      setLoading(false);
    });

    return () => unsub();
  }, [isAdmin, navigate]);

  const filtered = results.filter(r => 
    !searchTerm ||
    r.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.studentEmail && r.studentEmail.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (r.studentMobile && r.studentMobile.toLowerCase().includes(searchTerm.toLowerCase())) ||
    r.testTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const allSelected = filtered.length > 0 && filtered.every(r => selectedIds.includes(r.id));

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map(r => r.id));
    }
  };

  const toggleSelectRow = (resId: string) => {
    setSelectedIds(prev => 
      prev.includes(resId) ? prev.filter(id => id !== resId) : [...prev, resId]
    );
  };

  const handleDeleteSingle = async (resId: string, studentName: string) => {
    if (window.confirm(`Are you sure you want to permanently delete the scorecard for "${studentName}"?`)) {
      try {
        await deleteResult(resId);
        setSelectedIds(prev => prev.filter(id => id !== resId));
      } catch (e) {
        alert('Error deleting scorecard record');
      }
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;
    if (window.confirm(`⚠️ PERMANENT DELETE WARNING:\n\nAre you sure you want to delete ${selectedIds.length} selected candidate record(s)? This action cannot be undone.`)) {
      try {
        setIsDeleting(true);
        for (const id of selectedIds) {
          await deleteResult(id);
        }
        setSelectedIds([]);
      } catch (e) {
        alert('Error deleting selected records.');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleDeleteAllFiltered = async () => {
    if (filtered.length === 0) return;
    const confirmPrompt = window.prompt(
      `🚨 EXTREME DANGER ZONE:\n\nYou are about to DELETE ALL ${filtered.length} student records shown on screen.\n\nType "DELETE ALL" below to confirm permanent deletion:`
    );

    if (confirmPrompt === 'DELETE ALL') {
      try {
        setIsDeleting(true);
        for (const res of filtered) {
          await deleteResult(res.id);
        }
        setSelectedIds([]);
      } catch (e) {
        alert('Error deleting student records.');
      } finally {
        setIsDeleting(false);
      }
    } else if (confirmPrompt !== null) {
      alert('Deletion cancelled. Text did not match "DELETE ALL".');
    }
  };

  const handleExportCSV = () => {
    if (results.length === 0) return;

    const dataToExport = selectedIds.length > 0 
      ? filtered.filter(r => selectedIds.includes(r.id))
      : filtered;

    const headers = [
      'Result ID',
      'Candidate Name',
      'Gmail / Email',
      'Mobile Number',
      'Test Title',
      'Category',
      'Score',
      'Total Marks',
      'Percentage (%)',
      'Correct Answers',
      'Wrong Answers',
      'Skipped Questions',
      'Paper Version',
      'Submitted Date & Time'
    ];

    const rows = dataToExport.map(r => [
      `"${r.id}"`,
      `"${(r.studentName || '').replace(/"/g, '""')}"`,
      `"${(r.studentEmail || '').replace(/"/g, '""')}"`,
      `"${(r.studentMobile || '').replace(/"/g, '""')}"`,
      `"${(r.testTitle || '').replace(/"/g, '""')}"`,
      `"${(r.category || '').replace(/"/g, '""')}"`,
      r.score,
      r.totalMarks,
      `${r.percentage}%`,
      r.correctCount,
      r.wrongCount,
      r.skippedCount,
      `"v${r.testVersion || 1}"`,
      `"${r.submittedAt ? new Date(r.submittedAt).toLocaleString('en-IN') : ''}"`
    ]);

    // Include UTF-8 BOM (\uFEFF) so Microsoft Excel opens Hindi/English text perfectly
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Student_Data_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!isAdmin) return null;

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans">
      <AdminSidebar />

      <div className="flex-1 p-6 sm:p-10 overflow-y-auto">
        
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-800">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
              <Award className="w-8 h-8 text-purple-500" />
              <span>Student Scorecard & Contact Data</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Complete database of candidate entries (Name, Email/Gmail, Mobile No.) with option to export Excel/CSV or bulk delete.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {selectedIds.length > 0 && (
              <button
                onClick={handleDeleteSelected}
                disabled={isDeleting}
                className="flex items-center gap-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-lg shadow-rose-600/25 transition-all cursor-pointer disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Selected ({selectedIds.length})</span>
              </button>
            )}

            {filtered.length > 0 && (
              <button
                onClick={handleDeleteAllFiltered}
                disabled={isDeleting}
                className="flex items-center gap-2 bg-rose-950/80 hover:bg-rose-900 border border-rose-800 text-rose-300 font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl transition-all cursor-pointer disabled:opacity-50"
              >
                <AlertOctagon className="w-4 h-4 text-rose-400" />
                <span>Delete All ({filtered.length})</span>
              </button>
            )}

            <button
              onClick={handleExportCSV}
              disabled={filtered.length === 0}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-lg shadow-emerald-600/25 transition-all cursor-pointer disabled:opacity-50"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Export Excel / CSV {selectedIds.length > 0 ? `(${selectedIds.length})` : `(${filtered.length})`}</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
            <span className="text-xs text-slate-400 block font-bold">Total Candidates</span>
            <span className="text-xl font-black text-white">{results.length}</span>
          </div>
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
            <span className="text-xs text-slate-400 block font-bold">Emails Collected</span>
            <span className="text-xl font-black text-blue-400">{results.filter(r => r.studentEmail).length}</span>
          </div>
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
            <span className="text-xs text-slate-400 block font-bold">Mobiles Collected</span>
            <span className="text-xl font-black text-emerald-400">{results.filter(r => r.studentMobile).length}</span>
          </div>
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
            <span className="text-xs text-slate-400 block font-bold">Filtered Results</span>
            <span className="text-xl font-black text-purple-400">{filtered.length}</span>
          </div>
        </div>

        {/* Search Input */}
        <div className="mb-6 relative">
          <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search candidate name, Gmail/email, mobile number, or exam title..."
            className="w-full pl-12 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-sm font-medium text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Table */}
        {loading ? (
          <div className="py-16 text-center text-slate-500">Loading student scorecard records...</div>
        ) : filtered.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-400">
            <Award className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white">No Scorecard Records Found</h3>
            <p className="text-xs text-slate-500 mt-1">When students complete tests, their name, Gmail, mobile number, and score will be permanently saved here.</p>
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider bg-slate-900/90">
                    <th className="py-4 px-4 w-10 text-center">
                      <button
                        onClick={toggleSelectAll}
                        className="text-slate-400 hover:text-white cursor-pointer"
                        title={allSelected ? "Deselect All" : "Select All"}
                      >
                        {allSelected ? <CheckSquare className="w-4 h-4 text-purple-400" /> : <Square className="w-4 h-4" />}
                      </button>
                    </th>
                    <th className="py-4 px-4 font-bold">Candidate Details</th>
                    <th className="py-4 px-4 font-bold">Gmail / Email</th>
                    <th className="py-4 px-4 font-bold">Mobile Number</th>
                    <th className="py-4 px-4 font-bold">Exam / Mock Test</th>
                    <th className="py-4 px-4 font-bold">Score & Accuracy</th>
                    <th className="py-4 px-4 font-bold">Breakdown</th>
                    <th className="py-4 px-4 font-bold">Date & Time</th>
                    <th className="py-4 px-4 text-right font-bold">Delete</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filtered.map(res => {
                    const isChecked = selectedIds.includes(res.id);
                    return (
                      <tr 
                        key={res.id} 
                        className={`transition-colors ${isChecked ? 'bg-purple-950/30' : 'hover:bg-slate-800/50'}`}
                      >
                        {/* Checkbox */}
                        <td className="py-4 px-4 text-center">
                          <button
                            onClick={() => toggleSelectRow(res.id)}
                            className="text-slate-400 hover:text-white cursor-pointer"
                          >
                            {isChecked ? <CheckSquare className="w-4 h-4 text-purple-400" /> : <Square className="w-4 h-4" />}
                          </button>
                        </td>

                        {/* Name */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold text-xs shrink-0">
                              <User className="w-4 h-4" />
                            </div>
                            <div>
                              <span className="font-extrabold text-white block text-sm">{res.studentName || 'Candidate'}</span>
                              <span className="text-[10px] text-slate-500 font-mono">ID: {res.id.slice(0, 14)}</span>
                            </div>
                          </div>
                        </td>

                        {/* Gmail / Email */}
                        <td className="py-4 px-4">
                          {res.studentEmail ? (
                            <div className="flex items-center gap-1.5 text-slate-200 font-medium">
                              <Mail className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                              <a href={`mailto:${res.studentEmail}`} className="hover:underline hover:text-blue-400">
                                {res.studentEmail}
                              </a>
                            </div>
                          ) : (
                            <span className="text-slate-500 italic text-[11px]">Not provided</span>
                          )}
                        </td>

                        {/* Mobile Number */}
                        <td className="py-4 px-4">
                          {res.studentMobile ? (
                            <div className="flex items-center gap-1.5 text-emerald-400 font-mono font-bold">
                              <Phone className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                              <a href={`tel:${res.studentMobile}`} className="hover:underline">
                                {res.studentMobile}
                              </a>
                            </div>
                          ) : (
                            <span className="text-slate-500 italic text-[11px]">Not provided</span>
                          )}
                        </td>

                        {/* Test Title */}
                        <td className="py-4 px-4">
                          <span className="text-slate-200 font-bold block text-xs">{res.testTitle}</span>
                          <div className="flex items-center gap-1 mt-1">
                            {res.category && (
                              <span className="px-2 py-0.5 bg-slate-800 text-slate-400 text-[10px] rounded font-semibold uppercase">
                                {res.category}
                              </span>
                            )}
                            <span className="px-1.5 py-0.5 bg-purple-950/80 text-purple-300 border border-purple-800/80 text-[9px] rounded font-mono">
                              v{res.testVersion || 1}
                            </span>
                          </div>
                        </td>

                        {/* Score */}
                        <td className="py-4 px-4 font-mono">
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-base font-black text-amber-300">{res.score}</span>
                            <span className="text-xs text-slate-400">/ {res.totalMarks} Marks</span>
                          </div>
                          <span className={`inline-block text-[11px] font-bold mt-0.5 ${res.percentage >= 60 ? 'text-emerald-400' : res.percentage >= 35 ? 'text-amber-400' : 'text-rose-400'}`}>
                            {res.percentage}% Accuracy
                          </span>
                        </td>

                        {/* Stats Breakdown */}
                        <td className="py-4 px-4">
                          <div className="flex flex-col gap-1 text-[11px]">
                            <span className="text-emerald-400 font-medium flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> {res.correctCount} Correct
                            </span>
                            <span className="text-rose-400 font-medium flex items-center gap-1">
                              <XCircle className="w-3 h-3" /> {res.wrongCount} Wrong
                            </span>
                            <span className="text-slate-400 font-medium flex items-center gap-1">
                              <MinusCircle className="w-3 h-3" /> {res.skippedCount} Skipped
                            </span>
                          </div>
                        </td>

                        {/* Date & Time */}
                        <td className="py-4 px-4 text-slate-400">
                          <div className="flex items-center gap-1 text-[11px]">
                            <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                            <span>
                              {res.submittedAt ? new Date(res.submittedAt).toLocaleString('en-IN', {
                                dateStyle: 'short',
                                timeStyle: 'short',
                              }) : 'Recently'}
                            </span>
                          </div>
                        </td>

                        {/* Delete */}
                        <td className="py-4 px-4 text-right">
                          <button
                            onClick={() => handleDeleteSingle(res.id, res.studentName)}
                            className="p-2 text-rose-400 hover:text-white bg-rose-950/40 hover:bg-rose-600 border border-rose-900/60 rounded-xl transition-all cursor-pointer"
                            title="Permanently Delete Scorecard Record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};


