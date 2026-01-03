'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { MonthlySummary } from '@/types';

// ============================================
// BADGER - Monthly Income vs Expense Chart
// ============================================

interface MonthlyChartProps {
  data: MonthlySummary[];
  currency: string;
}

export function MonthlyChart({ data, currency }: MonthlyChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-text-secondary">
        No monthly data available
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card shadow-soft rounded-xl px-4 py-3 border border-divider">
          <p className="font-medium text-text-primary mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {currency}{entry.value.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E3EFE8" />
        <XAxis
          dataKey="month"
          tick={{ fill: '#6B7C77', fontSize: 12 }}
          tickLine={{ stroke: '#E3EFE8' }}
        />
        <YAxis
          tick={{ fill: '#6B7C77', fontSize: 12 }}
          tickLine={{ stroke: '#E3EFE8' }}
          tickFormatter={(value) => `${currency}${(value / 1000).toFixed(0)}k`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          formatter={(value) => (
            <span className="text-sm text-text-secondary">{value}</span>
          )}
        />
        <Bar dataKey="totalIncome" name="Income" fill="#7FC8A9" radius={[4, 4, 0, 0]} />
        <Bar dataKey="totalExpense" name="Expense" fill="#E8B4BC" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
