import React from 'react';
import { CategoryType } from '../../types';

export const CATEGORIES: { label: string; value: CategoryType | 'All' }[] = [
  { label: 'All Categories', value: 'All' },
  { label: 'Class 10th', value: 'Class 10th' },
  { label: 'Class 11th', value: 'Class 11th' },
  { label: 'Class 12th All Stream', value: 'Class 12th All Stream' },
  { label: 'B.A', value: 'B.A' },
];

interface CategoryPillsProps {
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
}

export const CategoryPills: React.FC<CategoryPillsProps> = ({ selectedCategory, setSelectedCategory }) => {
  return (
    <div className="w-full overflow-x-auto py-2 no-scrollbar scroll-smooth">
      <div className="flex items-center gap-2 min-w-max pb-1">
        {CATEGORIES.map(cat => {
          const isActive = selectedCategory === cat.value;
          return (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer border ${
                isActive
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/25 scale-105'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
