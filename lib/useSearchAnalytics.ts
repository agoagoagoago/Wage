import { useState, useEffect } from 'react';

interface TopSearch {
  query: string;
  count: number;
  lastSearched: string;
}

interface SearchStats {
  totalQueries: number;
  totalSearches: number;
  averageSearchesPerQuery: number;
}

interface SearchAnalyticsData {
  topSearches: TopSearch[];
  stats: SearchStats;
}

export function useSearchAnalytics(limit: number = 8) {
  const [data, setData] = useState<SearchAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/analytics?limit=${limit}&minCount=2`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }
      
      const analyticsData = await response.json();
      setData(analyticsData);
      setError(null);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Failed to load search analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [limit]);

  const trackSearch = async (query: string, hasResults: boolean = false) => {
    try {
      const response = await fetch('/api/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query, hasResults }),
      });

      if (response.ok) {
        // Optionally refresh analytics data after a successful track
        // You might want to debounce this or do it less frequently
        setTimeout(fetchAnalytics, 1000);
      }

      // Track in Google Analytics if available
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'search', {
          search_term: query,
          result_found: hasResults,
        });
      }
    } catch (err) {
      console.error('Error tracking search:', err);
    }
  };

  return {
    data,
    loading,
    error,
    trackSearch,
    refetch: fetchAnalytics,
  };
}

// Helper function to format search queries for display
export function formatSearchQuery(query: string): string {
  return query
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}