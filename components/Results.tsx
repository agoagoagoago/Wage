'use client';

import React from 'react';
import type { WageRow } from '@/lib/types';
import { wageSearcher } from '@/lib/search';

interface ResultsProps {
  results: WageRow[];
  query: string;
  onExportCsv?: (wage: WageRow) => void;
  onExportAllCsv?: (wages: WageRow[]) => void;
}

export default function Results({ results, query, onExportCsv, onExportAllCsv }: ResultsProps) {
  if (results.length === 0 && query) {
    return (
      <div className="w-full max-w-2xl mx-auto mt-8 p-8 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
        <div className="text-gray-500 dark:text-gray-400 mb-4">
          <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No results found for "{query}"
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Try different keywords or check your spelling
        </p>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          <p className="mb-1">Tips:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Use common job titles like "nurse" or "teacher"</li>
            <li>Try broader terms like "engineer" instead of specific roles</li>
            <li>Check for typos or try synonyms</li>
          </ul>
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return null;
  }

  const getSelectedWageStats = (wage: WageRow): Array<[string, number]> => {
    const selectedStats: Array<[string, number]> = [];
    
    // Get Median wage
    const median = wage.stats["Median  ($)"];
    if (median !== null && median !== undefined && typeof median === 'number') {
      selectedStats.push(["Median Gross Wage", median]);
    }
    
    return selectedStats;
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleCopyToClipboard = async (wage: WageRow) => {
    const grossStats = getSelectedWageStats(wage);
    const text = `${wage.occupation}\n${grossStats.map(([key, value]) => 
      `${key}: ${value ? formatCurrency(value) : 'N/A'}`
    ).join('\n')}`;
    
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const handleExportCsv = async (wage: WageRow) => {
    try {
      const csv = await wageSearcher.exportToCsv([wage]);
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `wage-${wage.occupation.replace(/[^a-zA-Z0-9]/g, '-')}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export CSV:', err);
    }
  };

  const handleExportAllCsv = async () => {
    try {
      const csv = await wageSearcher.exportToCsv(results);
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `wage-results-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export all CSV:', err);
    }
  };

  if (results.length === 1) {
    const wage = results[0];
    const wageStats = getSelectedWageStats(wage);

    return (
      <div className="w-full max-w-4xl mx-auto mt-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6">
          <div className="mb-4">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
              {wage.occupation}
            </h2>
            {wage.group && (
              <p className="text-gray-600 dark:text-gray-400">{wage.group}</p>
            )}
          </div>

          {wageStats.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Statistic
                    </th>
                    <th className="text-right py-3 px-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {wageStats.map(([key, value]) => (
                    <tr key={key} className="border-b border-gray-100 dark:border-gray-800 last:border-b-0">
                      <td className="py-3 px-2 text-sm text-gray-900 dark:text-white">
                        {key}
                      </td>
                      <td className="py-3 px-2 text-sm font-medium text-right text-gray-900 dark:text-white">
                        {value ? formatCurrency(value) : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 italic">
              No wage data available for this occupation.
            </p>
          )}

        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto mt-8">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Multiple matches found ({results.length})
        </h2>
      </div>

      <div className="space-y-4">
        {results.map((wage, index) => {
          const wageStats = getSelectedWageStats(wage);
          return (
            <div
              key={`${wage.occupation}-${index}`}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-4"
            >
              <div className="mb-3">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {wage.occupation}
                </h3>
                {wage.group && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">{wage.group}</p>
                )}
              </div>

              {wageStats.length > 0 && (
                <div className="grid grid-cols-1 gap-3 text-sm">
                  {wageStats.map(([key, value]) => (
                    <div key={key} className="bg-gray-50 dark:bg-gray-700 p-2 rounded">
                      <div className="text-gray-600 dark:text-gray-400 text-xs mb-1">
                        {key}
                      </div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {value ? formatCurrency(value) : 'N/A'}
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>
          );
        })}
      </div>
    </div>
  );
}