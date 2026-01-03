// ============================================
// BADGER - Silent Wins Operations
// ============================================

import db from '../db';
import { getSettings } from './settings';
import { getStreaks } from './streaks';
import { getMonthlySavingsSummary } from './analytics';
import type { SilentWin } from '@/types';

export function checkForSilentWins(): SilentWin[] {
  const wins: SilentWin[] = [];
  const settings = getSettings();
  const streaks = getStreaks();
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
  const endMonth = month === 11 ? 0 : month + 1;
  const endYear = month === 11 ? year + 1 : year;
  const endDate = `${endYear}-${String(endMonth + 1).padStart(2, '0')}-01`;

  // Check if under unnecessary limit (less than 70% is great!)
  const totals = db.prepare(`
    SELECT
      COALESCE(SUM(e.amount), 0) as total,
      COALESCE(SUM(CASE WHEN e.necessity = 'unnecessary' THEN e.amount ELSE 0 END), 0) as unnecessary
    FROM entries e
    JOIN expenses exp ON e.expenseId = exp.id
    WHERE exp.date >= ? AND exp.date < ? AND e.type = 'expense'
  `).get(startDate, endDate) as any;

  if (totals.unnecessary < settings.monthlyUnnecessaryLimit * 0.7) {
    wins.push({
      type: 'under_limit',
      message: "You're crushing it! Way under your unnecessary limit 🎯",
      icon: '🎯',
    });
  }

  // Check for streak milestones
  if (streaks.currentLogStreak === 7) {
    wins.push({
      type: 'streak_milestone',
      message: '7 days logged in a row! Keep it up! 🔥',
      icon: '🔥',
    });
  } else if (streaks.currentLogStreak === 30) {
    wins.push({
      type: 'streak_milestone',
      message: '30 days! You are a tracking legend! 🏆',
      icon: '🏆',
    });
  } else if (streaks.currentLogStreak === 100) {
    wins.push({
      type: 'streak_milestone',
      message: '100 days! Absolutely incredible! 👑',
      icon: '👑',
    });
  }

  // Check for low regret rate
  const regretCount = db.prepare(`
    SELECT COUNT(*) as count
    FROM entries e
    JOIN expenses exp ON e.expenseId = exp.id
    WHERE exp.date >= ? AND exp.date < ? AND e.regret = 1
  `).get(startDate, endDate) as any;

  const totalEntries = db.prepare(`
    SELECT COUNT(*) as count
    FROM entries e
    JOIN expenses exp ON e.expenseId = exp.id
    WHERE exp.date >= ? AND exp.date < ? AND e.type = 'expense'
  `).get(startDate, endDate) as any;

  if (totalEntries.count > 10 && regretCount.count / totalEntries.count < 0.1) {
    wins.push({
      type: 'low_regret',
      message: 'Almost no regrets this month! Wise spending! 🧠',
      icon: '🧠',
    });
  }

  // Check for positive savings
  const savingsSummary = getMonthlySavingsSummary(year, month + 1);
  if (savingsSummary.savings > 0) {
    const savingsRate = savingsSummary.incomeTotal > 0
      ? (savingsSummary.savings / savingsSummary.incomeTotal) * 100
      : 0;

    if (savingsRate >= 20) {
      wins.push({
        type: 'positive_savings',
        message: `Saving ${Math.round(savingsRate)}% this month! Financial goals unlocked! 💰`,
        icon: '💰',
      });
    } else if (savingsRate >= 10) {
      wins.push({
        type: 'positive_savings',
        message: `You're saving ${Math.round(savingsRate)}% this month! Keep it going! 📈`,
        icon: '📈',
      });
    }
  }

  return wins;
}
