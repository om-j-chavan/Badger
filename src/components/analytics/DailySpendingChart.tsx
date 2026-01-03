'use client';

import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { format, parseISO } from 'date-fns';

// ============================================
// BADGER - Daily Spending Chart
// ============================================

interface DailySpendingChartProps {
  data: { date: string; amount: number }[];
  currency: string;
}

export function DailySpendingChart({ data, currency }: DailySpendingChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-text-secondary">
        No spending data for this period
      </div>
    );
  }

  const formattedData = data.map((d) => ({
    ...d,
    day: format(parseISO(d.date), 'd'),
    fullDate: format(parseISO(d.date), 'MMM d'),
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-card shadow-soft rounded-xl px-4 py-3 border border-divider">
          <p className="font-medium text-text-primary">{item.fullDate}</p>
          <p className="text-text-secondary">
            {currency}{payload[0].value.toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={formattedData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#ADEBB3" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#ADEBB3" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#E3EFE8" vertical={false} />
        <XAxis
          dataKey="day"
          tick={{ fill: '#6B7C77', fontSize: 11 }}
          tickLine={{ stroke: '#E3EFE8' }}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fill: '#6B7C77', fontSize: 11 }}
          tickLine={{ stroke: '#E3EFE8' }}
          tickFormatter={(value) => `${currency}${value}`}
          width={60}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="amount"
          stroke="#ADEBB3"
          strokeWidth={2}
          fill="url(#colorAmount)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
