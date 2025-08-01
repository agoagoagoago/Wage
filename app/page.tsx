'use client';

import React, { useState } from 'react';
import SearchBox from '@/components/SearchBox';
import Results from '@/components/Results';
import MultiYearResults from '@/components/MultiYearResults';
import MostSearched from '@/components/MostSearched';
import RecentSearches from '@/components/RecentSearches';
import { wageSearcher } from '@/lib/search';
import { useSearchAnalytics } from '@/lib/useSearchAnalytics';
import type { WageRow, SearchSuggestion, MultiYearWageData } from '@/lib/types';

export default function HomePage() {
  const [results, setResults] = useState<WageRow[]>([]);
  const [multiYearResults, setMultiYearResults] = useState<MultiYearWageData[]>([]);
  const [currentQuery, setCurrentQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showMultiYear, setShowMultiYear] = useState(true); // Default to multi-year view
  const { trackSearch } = useSearchAnalytics();

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;
    
    setIsLoading(true);
    setError(null);
    setCurrentQuery(query);
    
    try {
      if (showMultiYear) {
        const multiYearSearchResults = await wageSearcher.searchMultiYear(query, 10);
        setMultiYearResults(multiYearSearchResults);
        setResults([]); // Clear single-year results
        
        // Track search with accurate result status
        trackSearch(query, multiYearSearchResults.length > 0);
      } else {
        const searchResults = await wageSearcher.search(query, 10);
        const resultItems = searchResults.map(r => r.item);
        setResults(resultItems);
        setMultiYearResults([]); // Clear multi-year results
        
        // Track search with accurate result status
        trackSearch(query, resultItems.length > 0);
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to search. Please try again.');
      setResults([]);
      setMultiYearResults([]);
      
      // Track failed search
      trackSearch(query, false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionSelect = async (suggestion: SearchSuggestion) => {
    setIsLoading(true);
    setError(null);
    setCurrentQuery(suggestion.occupation);
    
    try {
      const wage = wageSearcher.getWageByIndex(suggestion.rowIndex);
      if (wage) {
        setResults([wage]);
      } else {
        await handleSearch(suggestion.occupation);
      }
    } catch (err) {
      console.error('Selection error:', err);
      setError('Failed to load wage data. Please try again.');
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
      <div className="container mx-auto px-4 py-8">

        <header className="text-center mb-12">
          <div className="mb-4">
            <div className="flex items-center justify-center mb-4">
              <img 
                src="/wage-insights-logo.png" 
                alt="Wage Insights Logo" 
                className="h-32 w-auto mr-4"
              />
              <div>
                <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-2">
                  SingaporeWage.com
                </h1>
                <h2 className="text-2xl font-medium text-blue-600 dark:text-blue-400">
                  From Official Singapore Sources
                </h2>
              </div>
            </div>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-6">
            Find median gross wage trends for Singapore occupations from 2021-2024. Search by job title for instant salary insights with historical analysis.
          </p>
          <div className="text-sm text-gray-500 dark:text-gray-400 max-w-3xl mx-auto">
            <p className="mb-2">
              <strong>🇸🇬 Singapore occupations</strong> • <strong>📊 4-Year Wage Trends</strong> • <strong>📈 Interactive Charts</strong> • <strong>💯 100% Free</strong>
            </p>
            <p>
              Get instant access to median gross wage data and growth trends for Software Engineers, Nurses, Teachers, Managers, and hundreds more occupations in Singapore. See how salaries have changed from 2021 to 2024.
            </p>
          </div>
        </header>

        {/* Main Content Area */}
        <div>
          {/* Main Content */}
          <main className="max-w-4xl mx-auto">
            <div className="mb-8">
              <SearchBox
                onSearch={handleSearch}
                onSelect={handleSuggestionSelect}
                placeholder="Type an occupation, e.g., 'nurse', 'software engineer'"
              />
              
              {/* View Toggle */}
              <div className="flex justify-center mt-4">
                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-1 flex">
                  <button
                    onClick={() => setShowMultiYear(true)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      showMultiYear
                        ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    📈 Multi-Year Trends (2021-2024)
                  </button>
                  <button
                    onClick={() => setShowMultiYear(false)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      !showMultiYear
                        ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    📊 Current Year Only
                  </button>
                </div>
              </div>
            </div>

        {error && (
          <div className="w-full max-w-2xl mx-auto mb-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-red-700 dark:text-red-300">{error}</span>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="w-full max-w-2xl mx-auto mb-8 text-center">
            <div className="inline-flex items-center px-4 py-2 text-gray-600 dark:text-gray-400">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500 mr-3"></div>
              Searching...
            </div>
          </div>
        )}

            {showMultiYear ? (
              <MultiYearResults
                results={multiYearResults}
                query={currentQuery}
              />
            ) : (
              <Results
                results={results}
                query={currentQuery}
              />
            )}

            {/* Recent Searches Section */}
            <div className="mt-12">
              <RecentSearches 
                limit={10}
                className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700"
              />
            </div>

          </main>
        </div>

        {/* SEO Content Section */}
        <section className="mt-16 max-w-4xl mx-auto">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 text-center">
              Why Choose SingaporeWage.com?
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                  🏆 Singapore's #1 Wage Lookup Tool
                </h3>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                  <li>📊 <strong>Official MOM Data:</strong> Singapore Manpower Ministry 2021-2024 statistics</li>
                  <li>🎯 <strong>Most Comprehensive:</strong> Historical trends across different Singapore occupations</li>
                  <li>⚡ <strong>Multi-Year Analysis:</strong> 4-year wage trends with growth analysis</li>
                  <li>💯 <strong>100% Free:</strong> No registration or hidden costs</li>
                  <li>🚀 <strong>Lightning Fast:</strong> Instant search results with smart suggestions</li>
                  <li>📱 <strong>Mobile Optimized:</strong> Perfect on desktop, tablet, and mobile</li>
                </ul>
              </div>
              
              <MostSearched limit={8} />
            </div>

            <div className="mt-8 text-center">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                🇸🇬 Trusted by Thousands of Singaporeans
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                SingaporeWage.com is Singapore's most trusted salary lookup platform. Whether you're job hunting, 
                negotiating a raise, or researching career options, our official government data helps you make 
                informed decisions about your career in Singapore.
              </p>
            </div>
          </div>
        </section>

        <footer className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              <p className="font-medium">© 2024 SingaporeWage.com - Singapore's #1 Salary Lookup Tool</p>
              <p className="mt-1">Source: Singapore Manpower Ministry Occupational Wages 2024</p>
              <p className="mt-1">Wage statistics may vary by location, experience, and other factors</p>
              <div className="mt-3 flex flex-wrap gap-4 justify-center">
                <a href="/privacy" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Privacy Policy</a>
                <a href="/terms" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Terms of Service</a>
                <a href="/about" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">About SingaporeWage.com</a>
                <a href="mailto:contact@singaporewage.com" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Contact Us</a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}