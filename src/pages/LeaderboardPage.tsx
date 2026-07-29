import React, { useEffect, useState } from 'react';
import { LeaderboardEntry } from '../types';
import { subscribeToLeaderboard } from '../firebase/services';
import { Trophy, Award, Search, Clock } from 'lucide-react';

export const LeaderboardPage: React.FC = () => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const unsub = subscribeToLeaderboard((data) => {
      setEntries(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const filteredEntries = entries.filter(e => 
    !searchTerm || 
    e.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.testTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Header Hero */}
        <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 text-white rounded-3xl p-8 mb-8 shadow-xl border border-indigo-800/50 relative overflow-hidden">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider mb-3">
              <Trophy className="w-3.5 h-3.5 fill-slate-950" />
              <span>All India Rankers</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
              Exam Hall of Fame & Leaderboard
            </h1>
            <p className="text-sm text-indigo-200 mt-2 max-w-xl">
              Real-time rankings based on exam score, percentage accuracy, and completion speed.
            </p>
          </div>
        </div>

        {/* Search Input */}
        <div className="mb-6 relative">
          <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search candidate name or exam title..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm"
          />
        </div>

        {/* Leaderboard Table / Cards */}
        {loading ? (
          <div className="py-16 text-center text-slate-400 font-semibold">Loading Leaderboard Rankings...</div>
        ) : filteredEntries.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800">
            <Award className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold">No Rankers Found</h3>
            <p className="text-sm text-slate-500 mt-1">Be the first to complete a test and claim Rank #1!</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredEntries.map((item, index) => {
                const rankNum = item.rank || index + 1;
                const isTop3 = rankNum <= 3;
                const rankColors = [
                  'bg-amber-400 text-slate-950 border-amber-300',
                  'bg-slate-300 text-slate-950 border-slate-200',
                  'bg-amber-700 text-white border-amber-600',
                ];

                return (
                  <div
                    key={item.id || index}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <span className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm border shadow-sm ${
                        isTop3 ? rankColors[rankNum - 1] : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}>
                        #{rankNum}
                      </span>

                      <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                          {item.studentName}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {item.testTitle}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 text-right ml-13 sm:ml-0">
                      <div>
                        <span className="text-xs text-slate-400 block font-medium">Time Taken</span>
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1 justify-end">
                          <Clock className="w-3.5 h-3.5" /> {item.timeTakenFormatted}
                        </span>
                      </div>

                      <div>
                        <span className="text-xs text-slate-400 block font-medium">Accuracy</span>
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          {item.percentage}%
                        </span>
                      </div>

                      <div className="bg-blue-50 dark:bg-blue-950/60 px-3.5 py-1.5 rounded-xl border border-blue-200 dark:border-blue-900/60">
                        <span className="text-[10px] text-blue-600 dark:text-blue-400 uppercase font-bold block">Score</span>
                        <span className="text-base font-black text-blue-700 dark:text-blue-300">
                          {item.score}/{item.totalMarks}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
