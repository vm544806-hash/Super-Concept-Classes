import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { AdminSidebar } from '../../components/admin/AdminSidebar';
import { ExamResult } from '../../types';
import { getResults, deleteResult } from '../../firebase/services';
import { Search, Download, Trash2, Award, Calendar, Clock, User, FileSpreadsheet } from 'lucide-react';

export const AdminResultsPage: React.FC = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  const [results, setResults] = useState<ExamResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchResults = async () => {
    const data = await getResults();
    setResults(data);
    setLoading(false);
  };

  useEffect(() => {
    if (!isAdmin) {
      navigate('/admin');
      return;
    }
    fetchResults();
  }, [isAdmin, navigate]);

  const filtered = results.filter(r => 
    !searchTerm ||
    r.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.testTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (resId: string) => {
    if (window.confirm('Delete this result record?')) {
      await deleteResult(resId);
      fetchResults();
    }
  };

  const handleExportCSV = () => {
    if (results.length === 0) return;

    const headers = ['Result ID', 'Student Name', 'Test Title', 'Category', 'Score', 'Total Marks', 'Percentage', 'Correct', 'Wrong', 'Skipped', 'Submitted At'];
    const rows = filtered.map(r => [
      r.id,
      `"${r.studentName}"`,
      `"${r.testTitle}"`,
      `"${r.category}"`,
      r.score,
      r.totalMarks,
      `${r.percentage}%`,
      r.correctCount,
      r.wrongCount,
      r.skippedCount,
      `"${r.submittedAt}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Exam_Results_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
              Student Scorecard Records
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              View all candidate exam attempts, export CSV reports, and audit scores
            </p>
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-lg shadow-emerald-600/25 transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export CSV Report</span>
          </button>
        </div>

        {/* Search */}
        <div className="mb-6 relative">
          <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search candidate name or test title..."
            className="w-full pl-12 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-sm font-medium text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Table */}
        {loading ? (
          <div className="py-16 text-center text-slate-500">Loading student results...</div>
        ) : filtered.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-400">
            <Award className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white">No Results Recorded</h3>
            <p className="text-xs text-slate-500 mt-1">Student exam attempts will show up here automatically.</p>
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider bg-slate-900/80">
                    <th className="py-3.5 px-4">Candidate</th>
                    <th className="py-3.5 px-4">Test Title</th>
                    <th className="py-3.5 px-4">Score</th>
                    <th className="py-3.5 px-4">Stats (C / W / S)</th>
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filtered.map(res => (
                    <tr key={res.id} className="hover:bg-slate-800/50">
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-white block text-sm">{res.studentName}</span>
                        <span className="text-[11px] text-slate-500">{res.studentEmail || res.studentMobile || 'Guest Student'}</span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-300 font-medium">
                        {res.testTitle}
                      </td>

                      <td className="py-3.5 px-4 font-mono">
                        <span className="text-sm font-black text-amber-300">{res.score}/{res.totalMarks}</span>
                        <span className="block text-[11px] text-emerald-400 font-bold">{res.percentage}%</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="text-emerald-400 font-bold">{res.correctCount} Right</span> / {' '}
                        <span className="text-rose-400 font-bold">{res.wrongCount} Wrong</span> / {' '}
                        <span className="text-slate-400 font-bold">{res.skippedCount} Skip</span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-400">
                        {res.submittedAt?.split('T')[0] || 'Today'}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleDelete(res.id)}
                          className="p-1.5 text-rose-400 hover:text-rose-300 bg-slate-800 rounded-lg hover:bg-rose-950"
                          title="Delete Score Record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
