'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { wageSearcher } from '@/lib/search';
import { useSearchAnalytics } from '@/lib/useSearchAnalytics';
import type { SearchSuggestion } from '@/lib/types';

interface SearchBoxProps {
  onSearch: (query: string) => void;
  onSelect: (suggestion: SearchSuggestion) => void;
  placeholder?: string;
  className?: string;
}

export default function SearchBox({
  onSearch,
  onSelect,
  placeholder = "Type an occupation, e.g., 'nurse', 'software engineer'",
  className = ''
}: SearchBoxProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isInitialized, setIsInitialized] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();
  
  const { trackSearch } = useSearchAnalytics();

  const initializeSearch = useCallback(async () => {
    if (isInitialized) return;
    
    try {
      setIsLoading(true);
      await wageSearcher.loadData();
      setIsInitialized(true);
    } catch (error) {
      console.error('Failed to initialize search:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isInitialized]);

  const fetchSuggestions = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      setIsLoading(true);
      const results = await wageSearcher.getSuggestions(searchQuery, 8);
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
      setSelectedIndex(-1);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const debouncedFetchSuggestions = useCallback((searchQuery: string) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    debounceRef.current = setTimeout(() => {
      fetchSuggestions(searchQuery);
    }, 200);
  }, [fetchSuggestions]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    
    if (isInitialized) {
      debouncedFetchSuggestions(value);
    }
  };

  const handleInputFocus = async () => {
    if (!isInitialized) {
      await initializeSearch();
    }
    
    if (query.length >= 2) {
      setShowSuggestions(suggestions.length > 0);
    }
  };

  const handleInputBlur = () => {
    setTimeout(() => {
      setShowSuggestions(false);
    }, 150);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setShowSuggestions(false);
      // Track the search
      trackSearch(query.trim(), true); // Assume it has results for now
      onSearch(query.trim());
    }
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.occupation);
    setShowSuggestions(false);
    // Track the search from suggestion
    trackSearch(suggestion.occupation, true);
    onSelect(suggestion);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => prev < suggestions.length - 1 ? prev + 1 : 0);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : suggestions.length - 1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSuggestionClick(suggestions[selectedIndex]);
        } else if (query.trim()) {
          setShowSuggestions(false);
          // Track the search from keyboard
          trackSearch(query.trim(), true);
          onSearch(query.trim());
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const clearSearch = () => {
    setQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  return (
    <div className={`relative w-full max-w-2xl mx-auto ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className="h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full pl-10 pr-12 py-4 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
            aria-label="Search for occupation"
            aria-autocomplete="list"
            aria-expanded={showSuggestions}
            role="combobox"
          />
          
          {query && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              aria-label="Clear search"
            >
              <svg
                className="h-5 w-5 text-gray-400 hover:text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
          
          {isLoading && (
            <div className="absolute inset-y-0 right-8 flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
            </div>
          )}
        </div>
      </form>

      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-64 overflow-y-auto"
          role="listbox"
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={`${suggestion.occupation}-${suggestion.rowIndex}`}
              onClick={() => handleSuggestionClick(suggestion)}
              className={`w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-b-0 ${
                index === selectedIndex ? 'bg-blue-50 dark:bg-blue-900/20' : ''
              }`}
              role="option"
              aria-selected={index === selectedIndex}
            >
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {suggestion.occupation}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}