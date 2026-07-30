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
import { Flame, Star, Sparkles, BookOpen } from 'lucide-react';

export const HomePage: React.FC = () => {
  const [tests, setTests] = useState<Test[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

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

  // Filter tests based on category & search term
  const filteredTests = tests.filter(test => {
    const matchesCategory = selectedCategory === 'All' || test.category === selectedCategory;
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch = !term || 
      test.title.toLowerCase().includes(term) ||
      test.description.toLowerCase().includes(term) ||
      test.category.toLowerCase().includes(term);

    return matchesCategory && matchesSearch;
  });

  const popularTests = filteredTests.filter(t => t.isPopular);
  const featuredTests = filteredTests.filter(t => t.isFeatured);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Hero Section */}
        <HeroBanner />

        {/* Search & Filters */}
        <div className="my-6">
          <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
          <CategoryPills selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} />
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
          <>
            {/* Featured Tests Section */}
            {featuredTests.length > 0 && !searchTerm && (
              <section className="my-10">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-8 h-8 rounded-lg bg-purple-600/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                    <Star className="w-5 h-5 fill-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                      Featured Full Mock Papers
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Curated exam series by top exam subject experts</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {featuredTests.map(test => (
                    <TestCard key={test.id} test={test} />
                  ))}
                </div>
              </section>
            )}

            {/* Inline Ad Component */}
            <HomeInlineAd />

            {/* Popular Tests Section */}
            {popularTests.length > 0 && !searchTerm && (
              <section className="my-10">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                    <Flame className="w-5 h-5 fill-amber-500" />
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                      Most Attempted & Trending Tests
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">High volume practice papers taken by top rankers</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {popularTests.map(test => (
                    <TestCard key={test.id} test={test} />
                  ))}
                </div>
              </section>
            )}

            {/* All Tests Grid */}
            <section className="my-10">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-lg bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                    {selectedCategory === 'All' ? 'All Live Mock Tests' : `${selectedCategory} Mock Tests`}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Showing {filteredTests.length} mock examination papers
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTests.map(test => (
                  <TestCard key={test.id} test={test} />
                ))}
              </div>
            </section>
          </>
        )}

        {/* Notices & Leaderboard Teasers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 my-10">
          <NoticeTeaser notices={notices} />
          <LeaderboardTeaser entries={leaderboard} />
        </div>

        {/* 300x250 Banner Ad placed in the gap right above Telegram Channel Alert Bar */}
        <HomeBannerAd />

      </div>
    </div>
  );
};
