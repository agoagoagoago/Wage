'use client';

import React from 'react';
import AdBanner from './AdBanner';
import RecentSearches from './RecentSearches';

interface AdSidebarProps {
  className?: string;
}

export default function AdSidebar({ className = '' }: AdSidebarProps) {
  return (
    <aside className={`space-y-6 ${className}`}>
      {/* Recent Searches - Shows activity and social proof */}
      <div className="sticky top-8">
        <RecentSearches 
          limit={8} 
          className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm"
        />
      </div>
      
      {/* Vertical Ad Unit */}
      <div>
        <div className="text-xs text-gray-400 mb-2 text-center">Advertisement</div>
        <AdBanner 
          slot="1234567890"
          format="vertical"
          className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4"
          style={{ minHeight: '600px', width: '300px' }}
        />
      </div>
      
      {/* Rectangle Ad Unit */}
      <div>
        <div className="text-xs text-gray-400 mb-2 text-center">Advertisement</div>
        <AdBanner 
          slot="0987654321"
          format="rectangle"
          className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4"
          style={{ minHeight: '280px', width: '300px' }}
        />
      </div>
    </aside>
  );
}