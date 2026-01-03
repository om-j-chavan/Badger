'use client';

// ============================================
// BADGER - Streak Card Component
// ============================================

import { useEffect, useState } from 'react';
import type { Streaks } from '@/types';

export default function StreakCard() {
  const [streaks, setStreaks] = useState<Streaks | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStreaks() {
      try {
        const res = await fetch('/api/streaks');
        const data = await res.json();
        if (data.success) {
          setStreaks(data.data);
        }
      } catch (error) {
        console.error('Error fetching streaks:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStreaks();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-pulse">
        <div className="h-48 bg-gray-100 rounded-lg"></div>
      </div>
    );
  }

  if (!streaks) return null;

  return (
    <div className="bg-gradient-to-br from-white to-accent/5 rounded-2xl shadow-lg border border-accent/20 p-6 hover:shadow-xl transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800">Your Streaks</h3>
        <span className="text-2xl">🔥</span>
      </div>

      {/* Streaks */}
      <div className="space-y-6">
        {/* Log Streak */}
        <StreakItem
          title="Daily Logging"
          icon="📝"
          current={streaks.currentLogStreak}
          best={streaks.longestLogStreak}
          color="#ADEBB3"
          gradient="from-primary/20 to-primary/5"
        />

        {/* Unnecessary Streak */}
        <StreakItem
          title="Under Budget"
          icon="💰"
          current={streaks.currentUnnecessaryStreak}
          best={streaks.longestUnnecessaryStreak}
          color="#D3AF37"
          gradient="from-accent/20 to-accent/5"
          unit="weeks"
        />
      </div>

      {/* Motivational Message */}
      {streaks.currentLogStreak > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-100">
          <p className="text-sm text-gray-600 text-center italic">
            {getMotivationalMessage(streaks.currentLogStreak)}
          </p>
        </div>
      )}
    </div>
  );
}

function StreakItem({
  title,
  icon,
  current,
  best,
  color,
  gradient,
  unit = 'days',
}: {
  title: string;
  icon: string;
  current: number;
  best: number;
  color: string;
  gradient: string;
  unit?: string;
}) {
  const [animatedCurrent, setAnimatedCurrent] = useState(0);

  useEffect(() => {
    let count = 0;
    const increment = current / 20;
    const timer = setInterval(() => {
      count += increment;
      if (count >= current) {
        setAnimatedCurrent(current);
        clearInterval(timer);
      } else {
        setAnimatedCurrent(Math.floor(count));
      }
    }, 30);

    return () => clearInterval(timer);
  }, [current]);

  const isNewRecord = current > 0 && current === best;

  return (
    <div className={`bg-gradient-to-r ${gradient} rounded-xl p-4 border-2 border-transparent hover:border-gray-200 transition-all duration-300`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{icon}</span>
          <span className="font-medium text-gray-700">{title}</span>
        </div>
        {isNewRecord && (
          <span className="px-2 py-1 bg-primary text-white text-xs font-bold rounded-full animate-pulse">
            NEW RECORD! 🎉
          </span>
        )}
      </div>

      <div className="flex items-end gap-4">
        {/* Current Streak */}
        <div className="flex-1">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold" style={{ color }}>
              {animatedCurrent}
            </span>
            <span className="text-sm text-gray-500">{unit}</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">Current streak</p>
        </div>

        {/* Best Streak */}
        <div className="text-right">
          <div className="flex items-baseline gap-1 justify-end">
            <span className="text-xl font-semibold text-gray-600">{best}</span>
            <span className="text-xs text-gray-400">{unit}</span>
          </div>
          <p className="text-xs text-gray-500">Personal best</p>
        </div>
      </div>

      {/* Progress Bar to Best */}
      {current > 0 && current < best && (
        <div className="mt-3">
          <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000 ease-out"
              style={{
                width: `${(current / best) * 100}%`,
                backgroundColor: color,
              }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1 text-center">
            {best - current} more to beat your record!
          </p>
        </div>
      )}
    </div>
  );
}

function getMotivationalMessage(days: number): string {
  if (days >= 100) return "You're an absolute legend! 👑";
  if (days >= 30) return "You're on fire! Keep it going! 🔥";
  if (days >= 14) return "Two weeks strong! You're crushing it! 💪";
  if (days >= 7) return "One week down! You're building a solid habit! ⭐";
  if (days >= 3) return "Three days in a row! You're getting the hang of it! 🎯";
  return "Great start! Keep logging to build your streak! 🚀";
}
