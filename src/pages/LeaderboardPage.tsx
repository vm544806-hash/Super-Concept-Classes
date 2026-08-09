import React, { useEffect, useState } from 'react';
import { LeaderboardEntry } from '../types';
import { subscribeToLeaderboard } from '../firebase/services';
import { Trophy, Award, Search, Clock, Zap, Target, Flame } from 'lucide-react';

export const LeaderboardPage: React.FC = () => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>(() => {
    try {
      const cached = localStorage.getItem('cached_leaderboard_data');
      return cached ? JSON.parse(cached) : [];
    } catch (e) {
      return [];
    }
  });
  const [loading, setLoading] = useState<boolean>(() => {
    try {
      const cached = localStorage.getItem('cached_leaderboard_data');
      return !(cached && JSON.parse(cached).length > 0);
    } catch (e) {
      return true;
    }
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    let mounted = true;
    const unsub = subscribeToLeaderboard((data) => {
      if (mounted) {
        setEntries(data);
        setLoading(false);
      }
    });

    // Fast safety fallback: remove spinner after 400ms max
    const timer = setTimeout(() => {
      if (mounted) setLoading(false);
    }, 400);

    return () => {
      mounted = false;
      clearTimeout(timer);
      unsub();
    };
  }, []);

  const filteredEntries = entries.filter(e => 
    !searchTerm || 
    e.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.testTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const top3 = filteredEntries.slice(0, 3);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Header Hero */}
        <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 mb-8 shadow-xl border border-indigo-800/50 relative overflow-hidden">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider mb-3">
              <Trophy className="w-3.5 h-3.5 fill-slate-950" />
              <span>All India Rankers</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
              Exam Hall of Fame & Leaderboard
            </h1>
            <p className="text-xs sm:text-sm text-indigo-200 mt-2 max-w-2xl leading-relaxed">
              ⚡ <strong>Ranking Criteria:</strong> Students are ranked by <strong>Highest Score / Accuracy</strong> first. If scores are tied, the student who completed the test in the <strong>Shortest Time</strong> claims the top rank!
            </p>
          </div>
        </div>

        {/* Top 3 Podium Cards (If entries exist) */}
        {!loading && top3.length > 0 && !searchTerm && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {top3.map((item, index) => {
              const rankNum = item.rank || index + 1;
              const badgeColors = [
                'from-amber-500 to-yellow-600 text-amber-950 border-amber-300',
                'from-slate-400 to-slate-600 text-slate-950 border-slate-300',
                'from-amber-700 to-amber-900 text-amber-100 border-amber-600'
              ];
              const titles = ['🥇 Top Rank #1', '🥈 Rank #2', '🥉 Rank #3'];

              return (
                <div
                  key={`top-${item.id || index}`}
                  className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-md relative overflow-hidden flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className={`px-3 py-1 rounded-full bg-gradient-to-r ${badgeColors[index]} text-xs font-black uppercase tracking-wider shadow-sm flex items-center gap-1`}>
                      <Trophy className="w-3.5 h-3.5" /> {titles[index]}
                    </span>
                    <span className="text-xs text-slate-400 font-semibold">{item.date}</span>
                  </div>

                  <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 truncate">
                      {item.studentName}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {item.testTitle}
                    </p>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-3 gap-2 text-center">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">Score</span>
                      <span className="text-sm font-black text-blue-600 dark:text-blue-400">
                        {item.score}/{item.totalMarks}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">Accuracy</span>
                      <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                        {item.percentage}%
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">Speed</span>
                      <span className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center justify-center gap-0.5 mt-0.5">
                        <Zap className="w-3 h-3 fill-amber-500" /> {item.timeTakenFormatted || '—'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

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
          <div className="py-16 text-center text-slate-400 font-semibold flex items-center justify-center gap-2">
            <Clock className="w-5 h-5 animate-spin text-blue-500" />
            <span>Loading Leaderboard Rankings...</span>
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800">
            <Award className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold">No Rankers Found</h3>
            <p className="text-sm text-slate-500 mt-1">Be the first to complete a test and claim Rank #1!</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-100/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden sm:grid grid-cols-12 gap-4">
              <div className="col-span-1 text-center">Rank</div>
              <div className="col-span-5">Candidate & Exam</div>
              <div className="col-span-2 text-center">Completion Time</div>
              <div className="col-span-2 text-center">Accuracy</div>
              <div className="col-span-2 text-right pr-2">Score</div>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredEntries.map((item, index) => {
                const rankNum = item.rank || index + 1;
                const isTop3 = rankNum <= 3;
                const rankColors = [
                  'bg-amber-400 text-slate-950 border-amber-300 font-black',
                  'bg-slate-300 text-slate-950 border-slate-200 font-black',
                  'bg-amber-700 text-white border-amber-600 font-black',
                ];

                return (
                  <div
                    key={item.id || index}
                    className="p-4 sm:p-5 flex flex-col sm:grid sm:grid-cols-12 sm:items-center gap-3 sm:gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    {/* Rank Badge */}
                    <div className="col-span-1 flex items-center justify-start sm:justify-center">
                      <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs border shadow-sm ${
                        isTop3 ? rankColors[rankNum - 1] : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 font-bold'
                      }`}>
                        #{rankNum}
                      </span>
                    </div>

                    {/* Student Name & Exam Title */}
                    <div className="col-span-5">
                      <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        {item.studentName}
                        {rankNum === 1 && (
                          <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-2 py-0.5 rounded-full border border-amber-200 flex items-center gap-1">
                            <Flame className="w-3 h-3 text-amber-600 fill-amber-500" /> Rank #1 Top
                          </span>
                        )}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {item.testTitle}
                      </p>
                    </div>

                    {/* Time Taken */}
                    <div className="col-span-2 text-left sm:text-center">
                      <span className="sm:hidden text-xs text-slate-400 font-medium mr-2">Time:</span>
                      <span className="text-xs font-bold text-amber-700 dark:text-amber-400 inline-flex items-center gap-1">
                        <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-400" /> {item.timeTakenFormatted || '—'}
                      </span>
                    </div>

                    {/* Accuracy */}
                    <div className="col-span-2 text-left sm:text-center">
                      <span className="sm:hidden text-xs text-slate-400 font-medium mr-2">Accuracy:</span>
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-1">
                        <Target className="w-3.5 h-3.5" /> {item.percentage}%
                      </span>
                    </div>

                    {/* Score */}
                    <div className="col-span-2 text-left sm:text-right">
                      <div className="inline-block sm:block bg-blue-50 dark:bg-blue-950/60 px-3 py-1 rounded-xl border border-blue-200 dark:border-blue-900/60">
                        <span className="text-[10px] text-blue-600 dark:text-blue-400 uppercase font-bold block sm:hidden">Score</span>
                        <span className="text-sm font-black text-blue-700 dark:text-blue-300">
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
