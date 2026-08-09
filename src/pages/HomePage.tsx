import React, { useEffect, useState } from 'react';
import { Test, Notice, LeaderboardEntry } from '../types';
import { subscribeToTests, subscribeToNotices, subscribeToLeaderboard } from '../firebase/services';
import { HeroBanner } from '../components/home/HeroBanner';
import { SearchBar } from '../components/home/SearchBar';
import { CategoryPills } from '../components/home/CategoryPills';
import { TestCard } from '../components/home/TestCard';
import { NoticeTeaser } from '../components/home/NoticeTeaser';
import { LeaderboardTeaser } from '../components/home/LeaderboardTeaser';
import { HomeBannerAd, HomeInlineAd } from '../components/common/AdComponents';
import { Flame, Star, Sparkles, BookOpen, Clock, CheckCircle2, AlertCircle, Zap } from 'lucide-react';
import { computeTestStatus } from '../utils/testHelpers';

export const HomePage: React.FC = () => {
  const [tests, setTests] = useState<Test[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<'all' | 'live' | 'upcoming' | 'expired'>('all');

  useEffect(() => {
    const unsubTests = subscribeToTests((testsData) => {
      setTests(testsData);
      setLoading(false);
    }, true);

    const unsubNotices = subscribeToNotices((noticesData) => {
      setNotices(noticesData);
    });

    const unsubLeaderboard = subscribeToLeaderboard((lbData) => {
      setLeaderboard(lbData);
    });

    return () => {
      unsubTests();
      unsubNotices();
      unsubLeaderboard();
    };
  }, []);

  // Filter tests based on category, search term & schedule status
  const filteredTests = tests.filter(test => {
    const matchesCategory = selectedCategory === 'All' || test.category === selectedCategory;
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch = !term || 
      test.title.toLowerCase().includes(term) ||
      test.description.toLowerCase().includes(term) ||
      test.category.toLowerCase().includes(term);

    const testStatus = computeTestStatus(test);
    const matchesStatus = statusFilter === 'all' || testStatus === statusFilter;

    return matchesCategory && matchesSearch && matchesStatus;
  });

  // Compute test arrays by schedule status
  const liveTests = filteredTests.filter(t => computeTestStatus(t) === 'live');
  const upcomingTests = filteredTests.filter(t => computeTestStatus(t) === 'upcoming');
  const expiredTests = filteredTests.filter(t => computeTestStatus(t) === 'expired');

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Hero Section */}
        <HeroBanner />

        {/* 300x250 Viralnex Advertisement Container Box */}
        <HomeBannerAd />

        {/* Search & Filters */}
        <div className="my-6 space-y-4">
          <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="flex-1 overflow-x-auto pb-1">
              <CategoryPills selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} />
            </div>

            {/* Status Filter Tabs */}
            <div className="flex items-center gap-1 bg-slate-200/80 dark:bg-slate-900 p-1 rounded-2xl border border-slate-300/60 dark:border-slate-800 shrink-0 self-start sm:self-auto">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  statusFilter === 'all'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                All Papers ({filteredTests.length})
              </button>
              
              <button
                onClick={() => setStatusFilter('live')}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1 ${
                  statusFilter === 'live'
                    ? 'bg-rose-600 text-white shadow-sm shadow-rose-500/20'
                    : 'text-slate-600 dark:text-slate-400 hover:text-rose-500'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
                Live ({liveTests.length})
              </button>

              <button
                onClick={() => setStatusFilter('upcoming')}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1 ${
                  statusFilter === 'upcoming'
                    ? 'bg-amber-500 text-slate-950 shadow-sm shadow-amber-500/20'
                    : 'text-slate-600 dark:text-slate-400 hover:text-amber-500'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                Scheduled ({upcomingTests.length})
              </button>

              <button
                onClick={() => setStatusFilter('expired')}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1 ${
                  statusFilter === 'expired'
                    ? 'bg-slate-700 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <AlertCircle className="w-3.5 h-3.5" />
                Expired ({expiredTests.length})
              </button>
            </div>
          </div>
        </div>

        {/* Loading Skeleton */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 my-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-80 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filteredTests.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 my-8">
            <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">No mock tests found</h3>
            <p className="text-sm text-slate-500 mt-1">Try adjusting your category filter or search query.</p>
          </div>
        ) : (
          <div className="space-y-12 my-8">
            {/* SECTION 1: 🔴 LIVE TESTS */}
            {(statusFilter === 'all' || statusFilter === 'live') && (
              <section className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
                <div className="flex items-center justify-between gap-4 mb-6 border-b border-slate-100 dark:border-slate-800/80 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center font-black">
                      <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        🔴 Live Active Examinations (लाइव टेस्ट)
                        <span className="text-xs bg-rose-500/10 text-rose-500 border border-rose-500/20 px-2.5 py-0.5 rounded-full font-bold">
                          {liveTests.length} Active
                        </span>
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Currently open for candidate examination with real-time timers and instant result analytics.
                      </p>
                    </div>
                  </div>
                </div>

                {liveTests.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                    No active Live tests right now. Check scheduled tests below!
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {liveTests.map(test => (
                      <TestCard key={test.id} test={test} />
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* Inline Ad Banner */}
            <HomeInlineAd />

            {/* SECTION 2: ⏰ SCHEDULED / UPCOMING TESTS */}
            {(statusFilter === 'all' || statusFilter === 'upcoming') && (
              <section className="bg-amber-500/5 dark:bg-amber-500/5 border border-amber-500/20 rounded-3xl p-6 shadow-sm">
                <div className="flex items-center justify-between gap-4 mb-6 border-b border-amber-500/20 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-500 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-amber-500" />
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        ⏰ Scheduled / Live Soon Papers (आगामी परीक्षा)
                        <span className="text-xs bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded-full font-bold">
                          {upcomingTests.length} Scheduled
                        </span>
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Test entry is locked until the set Live Start Time. It automatically transitions to Live when the timer hits zero!
                      </p>
                    </div>
                  </div>
                </div>

                {upcomingTests.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                    No upcoming scheduled tests at the moment.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {upcomingTests.map(test => (
                      <TestCard key={test.id} test={test} />
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* SECTION 3: ⌛ EXPIRED TESTS & SOLUTIONS */}
            {(statusFilter === 'all' || statusFilter === 'expired') && (
              <section className="bg-slate-100/70 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
                <div className="flex items-center justify-between gap-4 mb-6 border-b border-slate-200 dark:border-slate-800 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center">
                      <AlertCircle className="w-5 h-5 text-slate-500" />
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        ⌛ Expired Papers & Answer Solutions (समय समाप्त / Question Papers)
                        <span className="text-xs bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-0.5 rounded-full font-bold">
                          {expiredTests.length} Expired
                        </span>
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Active testing window has closed. Candidate paper & detailed solution keys are available for study reference.
                      </p>
                    </div>
                  </div>
                </div>

                {expiredTests.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400 bg-white dark:bg-slate-950/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                    No expired tests found.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {expiredTests.map(test => (
                      <TestCard key={test.id} test={test} />
                    ))}
                  </div>
                )}
              </section>
            )}
          </div>
        )}

        {/* Notices & Leaderboard Teasers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 my-10">
          <NoticeTeaser notices={notices} />
          <LeaderboardTeaser entries={leaderboard} />
        </div>

      </div>
    </div>
  );
};
