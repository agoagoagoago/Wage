'use client';

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { WageTrendPoint } from '@/lib/types';

interface WageTrendChartProps {
  data: WageTrendPoint[];
  occupation: string;
  className?: string;
}

export default function WageTrendChart({ data, occupation, className = '' }: WageTrendChartProps) {
  if (data.length < 2) {
    return (
      <div className={`bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-center ${className}`}>
        <p className="text-gray-500 dark:text-gray-400">
          Insufficient data for trend visualization
        </p>
      </div>
    );
  }

  // Filter out null wages for the chart
  const chartData = data.filter(point => point.wage !== null);
  
  if (chartData.length < 2) {
    return (
      <div className={`bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-center ${className}`}>
        <p className="text-gray-500 dark:text-gray-400">
          No wage data available for trend visualization
        </p>
      </div>
    );
  }

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const value = payload[0].value;
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 dark:text-white">{`Year: ${label}`}</p>
          <p className="text-blue-600 dark:text-blue-400">
            {`Median Wage: $${value?.toLocaleString()}`}
          </p>
        </div>
      );
    }
    return null;
  };

  // Calculate trend
  const firstWage = chartData[0].wage!;
  const lastWage = chartData[chartData.length - 1].wage!;
  const totalChange = lastWage - firstWage;
  const isPositiveTrend = totalChange > 0;
  const lineColor = isPositiveTrend ? '#10b981' : '#ef4444'; // green for up, red for down

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Wage Trend: {occupation}
        </h3>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-gray-600 dark:text-gray-400">
            {chartData[0].year} - {chartData[chartData.length - 1].year}
          </span>
          <span className={`font-medium ${isPositiveTrend ? 'text-green-600' : 'text-red-600'}`}>
            {isPositiveTrend ? '↗' : '↘'} ${Math.abs(totalChange).toLocaleString()} 
            ({isPositiveTrend ? '+' : '-'}{Math.abs((totalChange / firstWage) * 100).toFixed(1)}%)
          </span>
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 20,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="year" 
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              domain={['dataMin - 1000', 'dataMax + 1000']}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="wage"
              stroke={lineColor}
              strokeWidth={3}
              dot={{
                fill: lineColor,
                strokeWidth: 2,
                r: 6
              }}
              activeDot={{
                r: 8,
                fill: lineColor,
                stroke: '#fff',
                strokeWidth: 2
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
        <p>* Based on median gross wage data from Singapore Ministry of Manpower</p>
      </div>
    </div>
  );
}