import React from 'react';
import { Link } from 'react-router-dom';
import { LeaderboardEntry } from '../../types';
import { Award, ChevronRight, Trophy } from 'lucide-react';

interface LeaderboardTeaserProps {
  entries: LeaderboardEntry[];
}

export const LeaderboardTeaser: React.FC<LeaderboardTeaserProps> = ({ entries }) => {
  return (
    <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl p-5 shadow-lg my-8 border border-indigo-900/50">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-indigo-900/60">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center font-black">
            <Trophy className="w-4 h-4 fill-slate-950" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-white">
              All India Rankers & Top Performers
            </h3>
            <p className="text-[11px] text-indigo-200">Live score updates from latest mock attempts</p>
          </div>
        </div>
        <Link
          to="/leaderboard"
          className="text-xs font-bold text-amber-300 hover:text-amber-200 hover:underline flex items-center gap-0.5"
        >
          Full Leaderboard <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="space-y-2.5">
        {entries.length === 0 ? (
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center text-xs text-indigo-200">
            No live test attempts recorded yet. Be the first student to take a test and feature on the Leaderboard!
          </div>
        ) : (
          entries.slice(0, 3).map((item, index) => {
            const rankColors = [
              'bg-amber-400 text-slate-950 border-amber-300',
              'bg-slate-300 text-slate-950 border-slate-200',
              'bg-amber-700 text-white border-amber-600',
            ];
            return (
              <div
                key={item.id || index}
                className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-extrabold text-xs border ${rankColors[index] || 'bg-slate-800 text-slate-300 border-slate-700'}`}>
                    #{item.rank || index + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">{item.studentName}</p>
                    <p className="text-[11px] text-indigo-300 truncate">{item.testTitle}</p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-sm font-black text-amber-300">
                    {item.score}/{item.totalMarks}
                  </span>
                  <span className="block text-[10px] text-indigo-300 font-semibold">
                    {item.percentage}% ({item.timeTakenFormatted})
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
