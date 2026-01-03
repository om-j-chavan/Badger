'use client';

import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';
import type { CategorySpend } from '@/types';

// ============================================
// BADGER - Category Spend Chart
// ============================================

interface CategoryChartProps {
  data: CategorySpend[];
  currency: string;
}

export function CategoryChart({ data, currency }: CategoryChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-text-secondary">
        No spending data for this period
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-card shadow-soft rounded-xl px-4 py-3 border border-divider">
          <p className="font-medium text-text-primary">{item.categoryName}</p>
          <p className="text-text-secondary">
            {currency}{item.amount.toLocaleString()} ({item.percentage.toFixed(1)}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          dataKey="amount"
          nameKey="categoryName"
          cx="50%"
          cy="50%"
          outerRadius={100}
          innerRadius={60}
          paddingAngle={2}
          label={({ categoryName, percentage }) =>
            percentage > 5 ? `${categoryName.split(' ')[0]} ${percentage.toFixed(0)}%` : ''
          }
          labelLine={false}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.categoryColor} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          layout="horizontal"
          verticalAlign="bottom"
          align="center"
          formatter={(value) => (
            <span className="text-sm text-text-secondary">{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
