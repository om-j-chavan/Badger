'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import type { AccountBalance } from '@/types';

// ============================================
// BADGER - Account Balance Chart
// ============================================

interface AccountBalanceChartProps {
  data: AccountBalance[];
  currency: string;
}

const COLORS = ['#ADEBB3', '#7FC8A9', '#A3D9D3', '#F5C16C', '#E8B4BC', '#C3B1E1'];

export function AccountBalanceChart({ data, currency }: AccountBalanceChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-text-secondary">
        No accounts found
      </div>
    );
  }

  const chartData = data.map((account) => ({
    name: account.accountName,
    balance: account.currentBalance,
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const account = data.find((a) => a.accountName === label);
      return (
        <div className="bg-card shadow-soft rounded-xl px-4 py-3 border border-divider">
          <p className="font-medium text-text-primary mb-2">{label}</p>
          <div className="space-y-1 text-sm">
            <p className="text-text-secondary">
              Opening: {currency}{account?.openingBalance.toLocaleString()}
            </p>
            <p className="text-success">
              + Income: {currency}{account?.totalIncome.toLocaleString()}
            </p>
            <p className="text-error">
              - Expense: {currency}{account?.totalExpense.toLocaleString()}
            </p>
            <p className="text-text-primary font-medium pt-1 border-t border-divider">
              Balance: {currency}{account?.currentBalance.toLocaleString()}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={chartData} layout="vertical" margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E3EFE8" horizontal={true} vertical={false} />
        <XAxis
          type="number"
          tick={{ fill: '#6B7C77', fontSize: 12 }}
          tickLine={{ stroke: '#E3EFE8' }}
          tickFormatter={(value) => `${currency}${(value / 1000).toFixed(0)}k`}
        />
        <YAxis
          dataKey="name"
          type="category"
          tick={{ fill: '#6B7C77', fontSize: 12 }}
          tickLine={{ stroke: '#E3EFE8' }}
          width={100}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="balance" radius={[0, 4, 4, 0]}>
          {chartData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.balance >= 0 ? COLORS[index % COLORS.length] : '#E58C8C'}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
