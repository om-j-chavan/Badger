'use client';

import React from 'react';
import { Card } from '@/components/ui';
import type { WeeklySummary } from '@/types';

// ============================================
// BADGER - Weekly Summary Card
// ============================================

interface WeeklySummaryCardProps {
  summary: WeeklySummary;
  currency: string;
}

export function WeeklySummaryCard({ summary, currency }: WeeklySummaryCardProps) {
  const changeColor = summary.changeVsLastWeek >= 0 ? 'text-error' : 'text-success';
  const changeIcon = summary.changeVsLastWeek >= 0 ? '↑' : '↓';

  return (
    <Card className="space-y-4">
      <h3 className="text-lg font-semibold text-text-primary">This Week</h3>

      <div className="grid grid-cols-2 gap-4">
        {/* Total Spent */}
        <div>
          <p className="text-sm text-text-secondary">Total Spent</p>
          <p className="text-2xl font-semibold text-text-primary">
            {currency}{summary.totalSpent.toLocaleString()}
          </p>
          <p className={`text-sm ${changeColor}`}>
            {changeIcon} {Math.abs(summary.changeVsLastWeek).toFixed(1)}% vs last week
          </p>
        </div>

        {/* Unnecessary % */}
        <div>
          <p className="text-sm text-text-secondary">Unnecessary %</p>
          <p className={`text-2xl font-semibold ${
            summary.unnecessaryPercentage > 30 ? 'text-warning' : 'text-text-primary'
          }`}>
            {summary.unnecessaryPercentage.toFixed(1)}%
          </p>
          <p className="text-sm text-text-secondary">
            of your spending
          </p>
        </div>
      </div>

      {/* Insights */}
      <div className="pt-4 border-t border-divider space-y-3">
        {summary.biggestLeak && (
          <div className="flex items-center gap-3">
            <span className="text-2xl">💸</span>
            <div>
              <p className="text-sm text-text-secondary">Biggest Leak</p>
              <p className="font-medium text-text-primary">
                {summary.biggestLeak.category} ({currency}{summary.biggestLeak.amount.toLocaleString()})
              </p>
            </div>
          </div>
        )}

        {summary.biggestImpulse && (
          <div className="flex items-center gap-3">
            <span className="text-2xl">🛒</span>
            <div>
              <p className="text-sm text-text-secondary">Biggest Impulse</p>
              <p className="font-medium text-text-primary">
                {summary.biggestImpulse.name} ({currency}{summary.biggestImpulse.amount.toLocaleString()})
              </p>
            </div>
          </div>
        )}

        {!summary.biggestLeak && !summary.biggestImpulse && (
          <p className="text-text-secondary text-center py-2">
            No spending this week yet!
          </p>
        )}
      </div>
    </Card>
  );
}
