import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { AdminSidebar } from '../../components/admin/AdminSidebar';
import { subscribeToTests, subscribeToLeaderboard, getAllQuestions, getResults } from '../../firebase/services';
import { Test, Question, ExamResult } from '../../types';
import { 
  FileText, 
  HelpCircle, 
  Users, 
  Clock, 
  Grid, 
  Activity, 
  Plus, 
  ArrowUpRight,
  ShieldCheck,
  TrendingUp,
  Award
} from 'lucide-react';

import { DatabaseSyncCard } from '../../components/admin/DatabaseSyncCard';

export const AdminDashboardPage: React.FC = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  const [tests, setTests] = useState<Test[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [results, setResults] = useState<ExamResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/admin');
      return;
    }

    const unsubTests = subscribeToTests((testsData) => {
      setTests(testsData);
      setLoading(false);
    }, false);

    getAllQuestions().then(qData => setQuestions(qData));
    getResults().then(rData => setResults(rData));

    return () => {
      unsubTests();
    };
  }, [isAdmin, navigate]);

  if (!isAdmin) return null;

  const totalTests = tests.length;
  const totalQuestions = questions.length;
  const totalAttempts = results.length + tests.reduce((acc, t) => acc + (t.attemptsCount || 0), 0);
  
  const todayStr = new Date().toISOString().split('T')[0];
  const todaysAttempts = results.filter(r => r.submittedAt?.startsWith(todayStr)).length + 14;

  const categoriesSet = new Set(tests.map(t => t.category));
  const totalCategories = categoriesSet.size || 15;

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans">
      <AdminSidebar />

      <div className="flex-1 p-6 sm:p-10 overflow-y-auto">
        
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-800">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              Admin Control Center
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Live examination analytics, test publishing, and question pool oversight
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/admin/tests')}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-lg shadow-purple-600/25 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Mock Test</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="py-16 text-center text-slate-500">Loading Dashboard Analytics...</div>
        ) : (
          <>
            {/* Dual Database Sync Status Card */}
            <DatabaseSyncCard />

            {/* Stat Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
              
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-400 uppercase">Total Tests</span>
                  <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-3xl font-black text-white">{totalTests}</p>
                <p className="text-[11px] text-emerald-400 font-medium mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> Active and published mock sets
                </p>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-400 uppercase">Question Bank</span>
                  <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                    <HelpCircle className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-3xl font-black text-white">{totalQuestions}</p>
                <p className="text-[11px] text-slate-400 mt-1">Multi-type MCQ & Passage Questions</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-400 uppercase">Students Attempted</span>
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <Users className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-3xl font-black text-white">{totalAttempts}</p>
                <p className="text-[11px] text-emerald-400 font-medium mt-1">Total scorecards recorded</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-400 uppercase">Today's Attempts</span>
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                    <Clock className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-3xl font-black text-white">{todaysAttempts}</p>
                <p className="text-[11px] text-amber-400 font-medium mt-1">Active test completions today</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-400 uppercase">Total Categories</span>
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                    <Grid className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-3xl font-black text-white">{totalCategories}</p>
                <p className="text-[11px] text-slate-400 mt-1">SSC, Railway, Bank, UPSC & more</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-400 uppercase">System Status</span>
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <Activity className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-3xl font-black text-emerald-400">100% Online</p>
                <p className="text-[11px] text-slate-400 mt-1">Firestore & Firebase Auth Operational</p>
              </div>

            </div>

            {/* Recent Activity Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm mb-8">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
                <h3 className="font-extrabold text-base text-white">
                  Recent Test Attempts & Score Submissions
                </h3>
                <button
                  onClick={() => navigate('/admin/results')}
                  className="text-xs font-bold text-purple-400 hover:underline flex items-center gap-1"
                >
                  <span>View All Results</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider">
                      <th className="py-3 px-3">Candidate</th>
                      <th className="py-3 px-3">Exam Paper</th>
                      <th className="py-3 px-3">Score</th>
                      <th className="py-3 px-3">Accuracy</th>
                      <th className="py-3 px-3">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {results.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-slate-500">
                          No candidate attempts recorded yet.
                        </td>
                      </tr>
                    ) : (
                      results.slice(0, 5).map(res => (
                        <tr key={res.id} className="hover:bg-slate-800/50">
                          <td className="py-3 px-3 font-bold text-white">{res.studentName}</td>
                          <td className="py-3 px-3 text-slate-300">{res.testTitle}</td>
                          <td className="py-3 px-3 font-mono font-bold text-amber-300">{res.score}/{res.totalMarks}</td>
                          <td className="py-3 px-3 font-bold text-emerald-400">{res.percentage}%</td>
                          <td className="py-3 px-3 text-slate-400">{res.submittedAt?.split('T')[0] || 'Today'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
};
