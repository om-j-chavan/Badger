'use client';

// ============================================
// BADGER - Vibe Score Card Component
// ============================================

import { useEffect, useState } from 'react';
import type { VibeScore } from '@/types';

export default function VibeScoreCard() {
  const [vibeScore, setVibeScore] = useState<VibeScore | null>(null);
  const [loading, setLoading] = useState(true);
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    async function fetchVibeScore() {
      try {
        const res = await fetch('/api/vibe-score');
        const data = await res.json();
        if (data.success) {
          setVibeScore(data.data);
          // Animate score
          animateScore(data.data.score);
        }
      } catch (error) {
        console.error('Error fetching vibe score:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchVibeScore();
  }, []);

  const animateScore = (targetScore: number) => {
    let current = 0;
    const increment = targetScore / 30; // 30 frames for smooth animation
    const timer = setInterval(() => {
      current += increment;
      if (current >= targetScore) {
        setAnimatedScore(targetScore);
        clearInterval(timer);
      } else {
        setAnimatedScore(Math.floor(current));
      }
    }, 20);
  };

  const getVibeLabel = (score: number): { label: string; emoji: string; color: string } => {
    if (score >= 80) return { label: 'Vibing', emoji: '🔥', color: '#10B981' };
    if (score >= 60) return { label: 'Decent', emoji: '👍', color: '#ADEBB3' };
    if (score >= 40) return { label: 'Mid', emoji: '😐', color: '#D3AF37' };
    if (score >= 20) return { label: 'Rough', emoji: '😬', color: '#F59E0B' };
    return { label: 'Down Bad', emoji: '💀', color: '#EF4444' };
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-pulse">
        <div className="h-48 bg-gray-100 rounded-lg"></div>
      </div>
    );
  }

  if (!vibeScore) return null;

  const vibe = getVibeLabel(vibeScore.score);
  const circumference = 2 * Math.PI * 70; // radius = 70
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

  return (
    <div className="bg-gradient-to-br from-white to-primary/5 rounded-2xl shadow-lg border border-primary/20 p-6 hover:shadow-xl transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800">Weekly Vibe Check</h3>
        <span className="text-2xl">{vibe.emoji}</span>
      </div>

      {/* Score Circle */}
      <div className="flex flex-col items-center mb-6">
        <div className="relative w-48 h-48">
          {/* Background Circle */}
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="96"
              cy="96"
              r="70"
              stroke="#E5E7EB"
              strokeWidth="12"
              fill="none"
            />
            {/* Animated Progress Circle */}
            <circle
              cx="96"
              cy="96"
              r="70"
              stroke={vibe.color}
              strokeWidth="12"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          {/* Score Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl font-bold" style={{ color: vibe.color }}>
              {animatedScore}
            </span>
            <span className="text-sm text-gray-500 mt-1">/ 100</span>
          </div>
        </div>

        {/* Vibe Label */}
        <div className="mt-4 px-6 py-2 rounded-full" style={{ backgroundColor: vibe.color + '20' }}>
          <span className="text-lg font-semibold" style={{ color: vibe.color }}>
            {vibe.label}
          </span>
        </div>
      </div>

      {/* Breakdown */}
      <div className="space-y-3 pt-4 border-t border-gray-100">
        <BreakdownItem
          label="Unnecessary Spending"
          value={vibeScore.unnecessaryPercentage}
          icon="🛍️"
        />
        <BreakdownItem
          label="Credit Usage"
          value={vibeScore.creditPercentage}
          icon="💳"
        />
        <BreakdownItem
          label="Over Budget"
          value={vibeScore.overspendPercentage}
          icon="📈"
        />
        <BreakdownItem
          label="Open Liabilities"
          value={vibeScore.openLiabilitiesPercentage}
          icon="⚠️"
        />
        {vibeScore.savingsRate !== undefined && vibeScore.savingsRate > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-gray-600">
                <span>💰</span>
                Savings Rate (Bonus!)
              </span>
              <span className="font-semibold text-primary">{Math.round(vibeScore.savingsRate)}%</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Boosting your vibe score!</p>
          </div>
        )}
      </div>
    </div>
  );
}

function BreakdownItem({ label, value, icon }: { label: string; value: number; icon: string }) {
  const percentage = Math.min(100, Math.round(value));
  const color = percentage > 50 ? '#EF4444' : percentage > 25 ? '#F59E0B' : '#10B981';

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-2 text-gray-600">
          <span>{icon}</span>
          {label}
        </span>
        <span className="font-medium text-gray-800">{percentage}%</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{
            width: `${percentage}%`,
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  );
}
