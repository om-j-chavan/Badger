'use client';

import { Card } from '../ui';
import type { MonthlySavingsSummary } from '@/types';

interface MonthlySavingsCardProps {
  summary: MonthlySavingsSummary;
  currency?: string;
}

export default function MonthlySavingsCard({ summary, currency = '₹' }: MonthlySavingsCardProps) {
  const isPositive = summary.savings >= 0;
  const savingsRate = summary.incomeTotal > 0
    ? (summary.savings / summary.incomeTotal) * 100
    : 0;

  const monthName = new Date(summary.year, summary.month - 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <Card>
      <div className="text-center">
        <p className="text-sm text-text-secondary mb-2">{monthName}</p>
        <div className={`text-4xl font-bold mb-2 ${isPositive ? 'text-primary' : 'text-red-500'}`}>
          {currency}{Math.abs(summary.savings).toLocaleString()}
        </div>
        <p className="text-lg font-medium text-text-primary mb-4">
          {isPositive ? 'Saved this month 💰' : 'Overspent this month 😬'}
        </p>

        {isPositive && savingsRate > 0 && (
          <div className="bg-primary/10 rounded-lg p-3 mb-4">
            <p className="text-sm text-text-secondary">Savings Rate</p>
            <p className="text-2xl font-bold text-primary">{Math.round(savingsRate)}%</p>
            <p className="text-xs text-text-secondary mt-1">of your income</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 text-left">
          <div>
            <p className="text-xs text-text-secondary">Income</p>
            <p className="text-lg font-semibold text-text-primary">
              {currency}{summary.incomeTotal.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-xs text-text-secondary">Expenses</p>
            <p className="text-lg font-semibold text-text-primary">
              {currency}{summary.expenseTotal.toLocaleString()}
            </p>
          </div>
          {summary.creditPaidTotal > 0 && (
            <div>
              <p className="text-xs text-text-secondary">Credit Paid</p>
              <p className="text-lg font-semibold text-text-primary">
                {currency}{summary.creditPaidTotal.toLocaleString()}
              </p>
            </div>
          )}
          {summary.investmentTotal > 0 && (
            <div>
              <p className="text-xs text-text-secondary">Invested</p>
              <p className="text-lg font-semibold text-accent">
                {currency}{summary.investmentTotal.toLocaleString()}
              </p>
            </div>
          )}
        </div>

        <div className="mt-4 text-xs text-text-secondary border-t border-card-border pt-3">
          <p>Savings = Income - Expenses - Credit Payments</p>
        </div>
      </div>
    </Card>
  );
}
