'use client';

import { Card } from '../ui';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import type { MonthlySavingsSummary } from '@/types';

interface SavingsTrendChartProps {
  data: MonthlySavingsSummary[];
}

export default function SavingsTrendChart({ data }: SavingsTrendChartProps) {
  const chartData = data.map((item) => ({
    month: `${new Date(item.year, item.month - 1).toLocaleDateString('en-US', { month: 'short' })} ${item.year.toString().slice(-2)}`,
    savings: item.savings,
  }));

  const hasNegativeSavings = data.some((item) => item.savings < 0);

  return (
    <Card>
      <h3 className="text-lg font-semibold mb-4 text-text-primary">Savings Trend</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis
              dataKey="month"
              stroke="#6B7280"
              style={{ fontSize: '12px' }}
            />
            <YAxis
              stroke="#6B7280"
              style={{ fontSize: '12px' }}
              tickFormatter={(value) => `₹${Math.abs(value).toLocaleString()}`}
            />
            <Tooltip
              formatter={(value: number) => [
                `₹${value.toLocaleString()}`,
                value >= 0 ? 'Saved' : 'Overspent',
              ]}
              contentStyle={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
              }}
            />
            {hasNegativeSavings && <ReferenceLine y={0} stroke="#6B7280" strokeDasharray="3 3" />}
            <Bar
              dataKey="savings"
              fill="#ADEBB3"
              radius={[4, 4, 0, 0]}
              onMouseEnter={(data) => {
                if (data.savings < 0) {
                  // Change color for negative savings
                  data.fill = '#FCA5A5';
                }
              }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 text-xs text-text-secondary">
        <p>Savings = Income - Expenses - Credit Payments</p>
        <p className="mt-1">Investments are tracked separately and don't reduce savings.</p>
      </div>
    </Card>
  );
}
