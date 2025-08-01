'use client';

import React from 'react';
import WageTrendChart from './WageTrendChart';
import { wageSearcher } from '@/lib/search';
import type { MultiYearWageData, WageGrowthStats } from '@/lib/types';

interface MultiYearResultsProps {
  results: MultiYearWageData[];
  query: string;
}

export default function MultiYearResults({ results, query }: MultiYearResultsProps) {
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

  const formatCurrency = (value: number | null): string => {
    if (value === null) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getMedianWage = (stats: Record<string, number | null>): number | null => {
    return stats['Median  ($)'] || stats['Median ($)'] || null;
  };

  const renderGrowthStats = (growthStats: WageGrowthStats) => {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
          <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">Total Change</div>
          <div className={`text-sm font-bold ${growthStats.totalChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {growthStats.totalChange >= 0 ? '+' : ''}{formatCurrency(growthStats.totalChange)}
          </div>
          <div className={`text-xs ${growthStats.totalChangePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ({growthStats.totalChangePercent >= 0 ? '+' : ''}{growthStats.totalChangePercent.toFixed(1)}%)
          </div>
        </div>
        
        <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
          <div className="text-xs text-green-600 dark:text-green-400 font-medium">Avg. Annual Growth</div>
          <div className={`text-sm font-bold ${growthStats.averageAnnualGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {growthStats.averageAnnualGrowth >= 0 ? '+' : ''}{growthStats.averageAnnualGrowth.toFixed(1)}%
          </div>
        </div>
        
        <div className="bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-lg">
          <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Best Year</div>
          <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
            {growthStats.bestYear}
          </div>
        </div>
        
        <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg">
          <div className="text-xs text-orange-600 dark:text-orange-400 font-medium">Slowest Year</div>
          <div className="text-sm font-bold text-orange-600 dark:text-orange-400">
            {growthStats.worstYear}
          </div>
        </div>
      </div>
    );
  };

  const renderYearlyTable = (data: MultiYearWageData) => {
    return (
      <div className="overflow-x-auto mb-6">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left py-3 px-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Year
              </th>
              <th className="text-right py-3 px-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Median Wage
              </th>
              <th className="text-right py-3 px-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                YoY Change
              </th>
            </tr>
          </thead>
          <tbody>
            {data.yearlyData.map((yearData, index) => {
              const medianWage = getMedianWage(yearData.stats);
              const prevYearData = index > 0 ? data.yearlyData[index - 1] : null;
              const prevMedianWage = prevYearData ? getMedianWage(prevYearData.stats) : null;
              
              let yoyChange = null;
              let yoyChangePercent = null;
              if (prevMedianWage && medianWage) {
                yoyChange = medianWage - prevMedianWage;
                yoyChangePercent = (yoyChange / prevMedianWage) * 100;
              }

              return (
                <tr key={yearData.year} className="border-b border-gray-100 dark:border-gray-800 last:border-b-0">
                  <td className="py-3 px-2 text-sm font-medium text-gray-900 dark:text-white">
                    {yearData.year}
                  </td>
                  <td className="py-3 px-2 text-sm text-right text-gray-900 dark:text-white">
                    {formatCurrency(medianWage)}
                  </td>
                  <td className="py-3 px-2 text-sm text-right">
                    {yoyChange !== null ? (
                      <span className={yoyChange >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {yoyChange >= 0 ? '+' : ''}{formatCurrency(yoyChange)}
                        <br />
                        <span className="text-xs">
                          ({yoyChangePercent! >= 0 ? '+' : ''}{yoyChangePercent!.toFixed(1)}%)
                        </span>
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  if (results.length === 1) {
    const data = results[0];
    const growthStats = wageSearcher.calculateWageGrowth(data.yearlyData);
    const trendData = wageSearcher.getWageTrendData(data.yearlyData);

    return (
      <div className="w-full max-w-6xl mx-auto mt-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
              {data.occupation}
            </h2>
            {data.group && (
              <p className="text-gray-600 dark:text-gray-400">{data.group}</p>
            )}
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Wage trend from {data.yearlyData[0]?.year} to {data.yearlyData[data.yearlyData.length - 1]?.year}
            </p>
          </div>

          {growthStats && renderGrowthStats(growthStats)}

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Yearly Breakdown
              </h3>
              {renderYearlyTable(data)}
            </div>
            
            <div>
              <WageTrendChart
                data={trendData}
                occupation={data.occupation}
                className="h-full"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Multiple results - show compact view
  return (
    <div className="w-full max-w-6xl mx-auto mt-8 space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Multi-Year Wage Trends for "{query}"
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Found {results.length} occupation{results.length > 1 ? 's' : ''} with historical data
        </p>
      </div>

      {results.map((data, index) => {
        const growthStats = wageSearcher.calculateWageGrowth(data.yearlyData);
        const trendData = wageSearcher.getWageTrendData(data.yearlyData);

        return (
          <div key={`${data.occupation}-${index}`} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                {data.occupation}
              </h3>
              {data.group && (
                <p className="text-sm text-gray-600 dark:text-gray-400">{data.group}</p>
              )}
            </div>

            {growthStats && (
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="text-center">
                  <div className="text-xs text-gray-500 dark:text-gray-400">Total Change</div>
                  <div className={`font-medium ${growthStats.totalChangePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {growthStats.totalChangePercent >= 0 ? '+' : ''}{growthStats.totalChangePercent.toFixed(1)}%
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-500 dark:text-gray-400">Avg. Annual</div>
                  <div className={`font-medium ${growthStats.averageAnnualGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {growthStats.averageAnnualGrowth >= 0 ? '+' : ''}{growthStats.averageAnnualGrowth.toFixed(1)}%
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-500 dark:text-gray-400">Years</div>
                  <div className="font-medium text-gray-700 dark:text-gray-300">
                    {data.yearlyData[0]?.year}-{data.yearlyData[data.yearlyData.length - 1]?.year}
                  </div>
                </div>
              </div>
            )}

            <WageTrendChart
              data={trendData}
              occupation={data.occupation}
              className="h-64"
            />
          </div>
        );
      })}
    </div>
  );
}