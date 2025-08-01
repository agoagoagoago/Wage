'use client';

import React, { useState, useEffect } from 'react';

interface RecentSearch {
  query: string;
  timestamp: string;
  hasResults: boolean;
}

interface RecentSearchesProps {
  limit?: number;
  className?: string;
  showHeader?: boolean;
}

export default function RecentSearches({ 
  limit = 10, 
  className = '',
  showHeader = true 
}: RecentSearchesProps) {
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecentSearches = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/analytics?type=recent&limit=${limit}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch recent searches');
      }
      
      const data = await response.json();
      setRecentSearches(data.recentSearches || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching recent searches:', err);
      setError('Failed to load recent searches');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecentSearches();
    
    // Refresh recent searches every 30 seconds
    const interval = setInterval(fetchRecentSearches, 30000);
    
    return () => clearInterval(interval);
  }, [limit]);

  const formatTimeAgo = (timestamp: string): string => {
    const now = new Date();
    const searchTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - searchTime.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const handleSearchClick = (query: string) => {
    // Trigger a search when clicked
    const searchBox = document.querySelector('input[aria-label="Search for occupation"]') as HTMLInputElement;
    if (searchBox) {
      searchBox.value = query;
      searchBox.focus();
      // Trigger the search event
      const event = new Event('input', { bubbles: true });
      searchBox.dispatchEvent(event);
    }
  };

  if (loading) {
    return (
      <div className={className}>
        {showHeader && (
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
            🕐 Recent Searches
          </h3>
        )}
        <div className="space-y-2">
          {Array.from({ length: Math.min(limit, 5) }).map((_, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-700 rounded animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-12"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={className}>
        {showHeader && (
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
            🕐 Recent Searches
          </h3>
        )}
        <div className="text-center text-gray-500 dark:text-gray-400 text-sm py-4">
          {error}
        </div>
      </div>
    );
  }

  if (!recentSearches || recentSearches.length === 0) {
    return (
      <div className={className}>
        {showHeader && (
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
            🕐 Recent Searches
          </h3>
        )}
        <div className="text-center text-gray-500 dark:text-gray-400 text-sm py-6">
          <div className="mb-2">👀</div>
          <p>No recent searches yet.</p>
          <p className="text-xs mt-1">Start searching to see activity here!</p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {showHeader && (
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            🕐 Recent Searches
          </h3>
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
            Live
          </div>
        </div>
      )}
      
      <div className="space-y-2 max-h-80 overflow-y-auto">
        {recentSearches.slice(0, limit).map((search, index) => (
          <div 
            key={`${search.query}-${search.timestamp}-${index}`}
            className="flex items-center justify-between p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-100 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer transition-all duration-200 hover:scale-[1.02]"
            onClick={() => handleSearchClick(search.query)}
          >
            <div className="flex items-center flex-1 min-w-0">
              <div className={`w-2 h-2 rounded-full mr-3 flex-shrink-0 ${
                search.hasResults 
                  ? 'bg-green-500' 
                  : 'bg-yellow-500'
              }`}></div>
              
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {search.query}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {search.hasResults ? 'Found results' : 'No results'}
                </div>
              </div>
            </div>
            
            <div className="text-xs text-gray-400 dark:text-gray-500 ml-2 flex-shrink-0">
              {formatTimeAgo(search.timestamp)}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 text-center">
        <p>🟢 Results found • 🟡 No results • Click to search</p>
        <p className="mt-1">Updates every 30 seconds</p>
      </div>
    </div>
  );
}