'use client';

import React from 'react';
import { useSearchAnalytics, formatSearchQuery } from '@/lib/useSearchAnalytics';

export default function AnalyticsPage() {
  const { data, loading, error, refetch } = useSearchAnalytics(20);

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 py-16">
        <div className="container mx-auto px-4 max-w-6xl text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Analytics Error</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <button 
            onClick={refetch}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-16">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            SingaporeWage.com Analytics
          </h1>
          <div className="flex gap-4">
            <button 
              onClick={refetch}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Refresh Data
            </button>
            <a 
              href="/"
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
            >
              Back to Home
            </a>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              Total Searches
            </h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {data?.stats.totalSearches || 0}
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              Unique Queries
            </h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {data?.stats.totalQueries || 0}
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              Avg Searches per Query
            </h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {data?.stats.averageSearchesPerQuery || 0}
            </p>
          </div>
        </div>

        {/* Top Searches Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Top Search Queries
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Occupation
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Search Count
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Last Searched
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {data?.topSearches && data.topSearches.length > 0 ? (
                  data.topSearches.map((search, index) => (
                    <tr key={search.query} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        #{index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {formatSearchQuery(search.query)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="text-sm text-gray-900 dark:text-white font-medium">
                            {search.count}
                          </div>
                          <div className="ml-2 w-16 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ 
                                width: `${Math.min(100, (search.count / Math.max(...(data.topSearches.map(s => s.count)))) * 100)}%` 
                              }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(search.lastSearched).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                      No search data available yet. Start using the search to see analytics here!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>Analytics data is updated in real-time as users search on SingaporeWage.com</p>
          <p className="mt-1">This dashboard helps you understand what occupations people are most interested in.</p>
        </div>
      </div>
    </div>
  );
}