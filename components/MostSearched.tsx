'use client';

import React from 'react';
import { useSearchAnalytics, formatSearchQuery } from '@/lib/useSearchAnalytics';

interface MostSearchedProps {
  limit?: number;
  className?: string;
}

export default function MostSearched({ limit = 8, className = '' }: MostSearchedProps) {
  const { data, loading, error } = useSearchAnalytics(limit);

  // Fallback data for when there's no search data yet
  const fallbackSearches = [
    'Software Engineer',
    'Registered Nurse',
    'Data Scientist',
    'Teacher',
    'Accountant',
    'Marketing Manager',
    'Project Manager',
    'Financial Analyst'
  ];

  const displaySearches = data?.topSearches && data.topSearches.length > 0
    ? data.topSearches.map(search => formatSearchQuery(search.query))
    : fallbackSearches;

  const hasRealData = data?.topSearches && data.topSearches.length > 0;

  if (loading) {
    return (
      <div className={className}>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
          🔥 Most Searched Occupations
        </h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="p-3 bg-gray-100 dark:bg-gray-700 rounded animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    console.error('MostSearched error:', error);
    // Still show fallback data even if there's an error
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          🔥 Most Searched Occupations
        </h3>
        {hasRealData && (
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
            Live Data
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-3 text-sm">
        {displaySearches.slice(0, limit).map((occupation, index) => {
          const isPopular = hasRealData && data?.topSearches[index]?.count > 5;
          
          return (
            <div 
              key={occupation} 
              className={`p-3 rounded text-center transition-all duration-200 hover:scale-105 cursor-pointer ${
                isPopular 
                  ? 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800' 
                  : 'bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600'
              }`}
              onClick={() => {
                // Trigger a search when clicked
                const searchBox = document.querySelector('input[aria-label="Search for occupation"]') as HTMLInputElement;
                if (searchBox) {
                  searchBox.value = occupation;
                  searchBox.focus();
                  // Trigger the search event
                  const event = new Event('input', { bubbles: true });
                  searchBox.dispatchEvent(event);
                }
              }}
            >
              <span className="text-gray-900 dark:text-white font-medium">
                {occupation}
              </span>
            </div>
          );
        })}
      </div>
      
    </div>
  );
}