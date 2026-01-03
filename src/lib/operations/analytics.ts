// ============================================
// BADGER - Analytics Operations
// ============================================

import db from '../db';
import type {
  CategorySpend,
  WeeklySummary,
  MonthlySummary,
  Warning,
  VibeScore,
  InvestmentSummary,
} from '@/types';
import { getAllCategories } from './categories';
import { getSettings } from './settings';
import {
  getMonthlyTotals,
  getCreditTotals,
  getEntriesByCategory,
} from './expenses';
import { getMonthlyIncomeTotal } from './income';
import {
  startOfWeek,
  endOfWeek,
  subWeeks,
  format,
  startOfMonth,
  endOfMonth,
  subMonths,
} from 'date-fns';

// Get category spend breakdown for a date range
export function getCategorySpendBreakdown(
  startDate: string,
  endDate: string
): CategorySpend[] {
  const categories = getAllCategories();
  const categoryTotals = getEntriesByCategory(startDate, endDate);

  const totalSpend = categoryTotals.reduce((sum, c) => sum + c.total, 0);

  return categories
    .map((cat) => {
      const found = categoryTotals.find((c) => c.categoryId === cat.id);
      const amount = found?.total ?? 0;
      return {
        categoryId: cat.id,
        categoryName: cat.name,
        categoryColor: cat.color,
        amount,
        percentage: totalSpend > 0 ? (amount / totalSpend) * 100 : 0,
      };
    })
    .filter((c) => c.amount > 0)
    .sort((a, b) => b.amount - a.amount);
}

// Get weekly summary
export function getWeeklySummary(date: Date = new Date()): WeeklySummary {
  const settings = getSettings();
  const weekStart = startOfWeek(date, {
    weekStartsOn: settings.weekStartDay === 'monday' ? 1 : 0,
  });
  const weekEnd = endOfWeek(date, {
    weekStartsOn: settings.weekStartDay === 'monday' ? 1 : 0,
  });

  const startDate = format(weekStart, 'yyyy-MM-dd');
  const endDate = format(weekEnd, 'yyyy-MM-dd');

  // Get this week's data
  const thisWeekResult = db
    .prepare(`
      SELECT
        COALESCE(SUM(e.amount), 0) as total,
        COALESCE(SUM(CASE WHEN e.necessity = 'unnecessary' THEN e.amount ELSE 0 END), 0) as unnecessary
      FROM entries e
      JOIN expenses exp ON e.expenseId = exp.id
      WHERE exp.date >= ? AND exp.date <= ? AND e.type = 'expense'
    `)
    .get(startDate, endDate) as { total: number; unnecessary: number };

  // Get last week's data for comparison
  const lastWeekStart = subWeeks(weekStart, 1);
  const lastWeekEnd = subWeeks(weekEnd, 1);
  const lastStartDate = format(lastWeekStart, 'yyyy-MM-dd');
  const lastEndDate = format(lastWeekEnd, 'yyyy-MM-dd');

  const lastWeekResult = db
    .prepare(`
      SELECT COALESCE(SUM(e.amount), 0) as total
      FROM entries e
      JOIN expenses exp ON e.expenseId = exp.id
      WHERE exp.date >= ? AND exp.date <= ? AND e.type = 'expense'
    `)
    .get(lastStartDate, lastEndDate) as { total: number };

  // Calculate change vs last week
  const changeVsLastWeek =
    lastWeekResult.total > 0
      ? ((thisWeekResult.total - lastWeekResult.total) / lastWeekResult.total) *
        100
      : 0;

  // Get biggest leak (category)
  const categoryBreakdown = getCategorySpendBreakdown(startDate, endDate);
  const biggestLeak =
    categoryBreakdown.length > 0
      ? {
          category: categoryBreakdown[0].categoryName,
          amount: categoryBreakdown[0].amount,
        }
      : null;

  // Get biggest impulse (single unnecessary purchase)
  const biggestImpulseRow = db
    .prepare(`
      SELECT e.name, e.amount
      FROM entries e
      JOIN expenses exp ON e.expenseId = exp.id
      WHERE exp.date >= ? AND exp.date <= ? AND e.necessity = 'unnecessary' AND e.type = 'expense'
      ORDER BY e.amount DESC
      LIMIT 1
    `)
    .get(startDate, endDate) as { name: string; amount: number } | undefined;

  const biggestImpulse = biggestImpulseRow
    ? { name: biggestImpulseRow.name, amount: biggestImpulseRow.amount }
    : null;

  return {
    totalSpent: thisWeekResult.total,
    unnecessaryPercentage:
      thisWeekResult.total > 0
        ? (thisWeekResult.unnecessary / thisWeekResult.total) * 100
        : 0,
    biggestLeak,
    biggestImpulse,
    changeVsLastWeek,
  };
}

// Get monthly summaries for the last N months
export function getMonthlySummaries(months: number = 6): MonthlySummary[] {
  const summaries: MonthlySummary[] = [];
  const today = new Date();

  for (let i = 0; i < months; i++) {
    const date = subMonths(today, i);
    const year = date.getFullYear();
    const month = date.getMonth();

    const totals = getMonthlyTotals(year, month);
    const income = getMonthlyIncomeTotal(year, month);

    summaries.push({
      month: format(date, 'MMM yyyy'),
      totalIncome: income,
      totalExpense: totals.total,
      unnecessaryExpense: totals.unnecessary,
      balance: income - totals.total,
    });
  }

  return summaries.reverse();
}

// Get warnings based on current month's spending
export function getWarnings(): Warning[] {
  const settings = getSettings();
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  const totals = getMonthlyTotals(year, month);
  const creditTotal = getCreditTotals(year, month);

  const warnings: Warning[] = [];

  // Check monthly spend limit
  if (totals.total > settings.monthlySpendLimit) {
    warnings.push({
      type: 'spend_limit',
      message: `You've exceeded your monthly spending limit!`,
      severity: 'error',
      currentValue: totals.total,
      limitValue: settings.monthlySpendLimit,
    });
  } else if (totals.total > settings.monthlySpendLimit * 0.8) {
    warnings.push({
      type: 'spend_limit',
      message: `You're at ${Math.round(
        (totals.total / settings.monthlySpendLimit) * 100
      )}% of your monthly limit`,
      severity: 'warning',
      currentValue: totals.total,
      limitValue: settings.monthlySpendLimit,
    });
  }

  // Check unnecessary spending limit
  if (totals.unnecessary > settings.monthlyUnnecessaryLimit) {
    warnings.push({
      type: 'unnecessary_limit',
      message: `Unnecessary spending has exceeded your limit!`,
      severity: 'error',
      currentValue: totals.unnecessary,
      limitValue: settings.monthlyUnnecessaryLimit,
    });
  } else if (totals.unnecessary > settings.monthlyUnnecessaryLimit * 0.8) {
    warnings.push({
      type: 'unnecessary_limit',
      message: `Unnecessary spending at ${Math.round(
        (totals.unnecessary / settings.monthlyUnnecessaryLimit) * 100
      )}% of limit`,
      severity: 'warning',
      currentValue: totals.unnecessary,
      limitValue: settings.monthlyUnnecessaryLimit,
    });
  }

  // Check credit limit
  if (creditTotal > settings.monthlyCreditLimit) {
    warnings.push({
      type: 'credit_limit',
      message: `Open credit has exceeded your limit!`,
      severity: 'error',
      currentValue: creditTotal,
      limitValue: settings.monthlyCreditLimit,
    });
  } else if (creditTotal > settings.monthlyCreditLimit * 0.8) {
    warnings.push({
      type: 'credit_limit',
      message: `Open credit at ${Math.round(
        (creditTotal / settings.monthlyCreditLimit) * 100
      )}% of limit`,
      severity: 'warning',
      currentValue: creditTotal,
      limitValue: settings.monthlyCreditLimit,
    });
  }

  return warnings;
}

// Check if an entry is a "stupid spend"
export function isStupidSpend(amount: number, necessity: string): boolean {
  const settings = getSettings();
  return necessity === 'unnecessary' && amount > settings.stupidSpendThreshold;
}

// Get daily spending for a month (for charts)
export function getDailySpending(
  year: number,
  month: number
): { date: string; amount: number }[] {
  const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
  const endMonth = month === 11 ? 0 : month + 1;
  const endYear = month === 11 ? year + 1 : year;
  const endDate = `${endYear}-${String(endMonth + 1).padStart(2, '0')}-01`;

  const rows = db
    .prepare(`
      SELECT exp.date, COALESCE(SUM(e.amount), 0) as amount
      FROM expenses exp
      LEFT JOIN entries e ON e.expenseId = exp.id AND e.type = 'expense'
      WHERE exp.date >= ? AND exp.date < ?
      GROUP BY exp.date
      ORDER BY exp.date ASC
    `)
    .all(startDate, endDate) as { date: string; amount: number }[];

  return rows;
}

// Get expense trends (comparison with previous periods)
export function getExpenseTrends(): {
  thisMonth: number;
  lastMonth: number;
  monthChange: number;
  thisWeek: number;
  lastWeek: number;
  weekChange: number;
} {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  // This month
  const thisMonthTotals = getMonthlyTotals(year, month);

  // Last month
  const lastMonthDate = subMonths(today, 1);
  const lastMonthTotals = getMonthlyTotals(
    lastMonthDate.getFullYear(),
    lastMonthDate.getMonth()
  );

  // This week
  const settings = getSettings();
  const weekStart = startOfWeek(today, {
    weekStartsOn: settings.weekStartDay === 'monday' ? 1 : 0,
  });
  const weekEnd = endOfWeek(today, {
    weekStartsOn: settings.weekStartDay === 'monday' ? 1 : 0,
  });

  const thisWeekResult = db
    .prepare(`
      SELECT COALESCE(SUM(e.amount), 0) as total
      FROM entries e
      JOIN expenses exp ON e.expenseId = exp.id
      WHERE exp.date >= ? AND exp.date <= ? AND e.type = 'expense'
    `)
    .get(format(weekStart, 'yyyy-MM-dd'), format(weekEnd, 'yyyy-MM-dd')) as {
    total: number;
  };

  // Last week
  const lastWeekStart = subWeeks(weekStart, 1);
  const lastWeekEnd = subWeeks(weekEnd, 1);

  const lastWeekResult = db
    .prepare(`
      SELECT COALESCE(SUM(e.amount), 0) as total
      FROM entries e
      JOIN expenses exp ON e.expenseId = exp.id
      WHERE exp.date >= ? AND exp.date <= ? AND e.type = 'expense'
    `)
    .get(
      format(lastWeekStart, 'yyyy-MM-dd'),
      format(lastWeekEnd, 'yyyy-MM-dd')
    ) as { total: number };

  const monthChange =
    lastMonthTotals.total > 0
      ? ((thisMonthTotals.total - lastMonthTotals.total) /
          lastMonthTotals.total) *
        100
      : 0;

  const weekChange =
    lastWeekResult.total > 0
      ? ((thisWeekResult.total - lastWeekResult.total) / lastWeekResult.total) *
        100
      : 0;

  return {
    thisMonth: thisMonthTotals.total,
    lastMonth: lastMonthTotals.total,
    monthChange,
    thisWeek: thisWeekResult.total,
    lastWeek: lastWeekResult.total,
    weekChange,
  };
}

// Get investment summaries for the last N months
export function getInvestmentSummaries(months: number = 6): InvestmentSummary[] {
  const summaries: InvestmentSummary[] = [];
  const today = new Date();

  for (let i = 0; i < months; i++) {
    const date = subMonths(today, i);
    const year = date.getFullYear();
    const month = date.getMonth();

    const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
    const endMonth = month === 11 ? 0 : month + 1;
    const endYear = month === 11 ? year + 1 : year;
    const endDate = `${endYear}-${String(endMonth + 1).padStart(2, '0')}-01`;

    const result = db.prepare(`
      SELECT COALESCE(SUM(e.amount), 0) as total
      FROM entries e
      JOIN expenses exp ON e.expenseId = exp.id
      WHERE exp.date >= ? AND exp.date < ? AND e.type = 'investment'
    `).get(startDate, endDate) as any;

    summaries.push({
      month: format(date, 'MMM yyyy'),
      totalInvested: result.total,
    });
  }

  return summaries.reverse();
}

// Calculate Vibe Score (0-100, higher is better)
export function calculateVibeScore(date: Date = new Date()): VibeScore {
  const settings = getSettings();
  const weekStart = startOfWeek(date, {
    weekStartsOn: settings.weekStartDay === 'monday' ? 1 : 0,
  });
  const weekEnd = endOfWeek(date, {
    weekStartsOn: settings.weekStartDay === 'monday' ? 1 : 0,
  });

  const startDate = format(weekStart, 'yyyy-MM-dd');
  const endDate = format(weekEnd, 'yyyy-MM-dd');

  const totals = db.prepare(`
    SELECT
      COALESCE(SUM(e.amount), 0) as total,
      COALESCE(SUM(CASE WHEN e.necessity = 'unnecessary' THEN e.amount ELSE 0 END), 0) as unnecessary,
      COALESCE(SUM(CASE WHEN e.status = 'open' THEN e.amount ELSE 0 END), 0) as open
    FROM entries e
    JOIN expenses exp ON e.expenseId = exp.id
    WHERE exp.date >= ? AND exp.date <= ? AND e.type = 'expense'
  `).get(startDate, endDate) as any;

  const creditTotal = db.prepare(`
    SELECT COALESCE(SUM(e.amount), 0) as total
    FROM entries e
    JOIN expenses exp ON e.expenseId = exp.id
    JOIN modes m ON e.modeId = m.id
    WHERE exp.date >= ? AND exp.date <= ? AND m.isCredit = 1 AND e.type = 'expense'
  `).get(startDate, endDate) as any;

  const unnecessaryPercentage = totals.total > 0 ? (totals.unnecessary / totals.total) * 100 : 0;
  const creditPercentage = totals.total > 0 ? (creditTotal.total / totals.total) * 100 : 0;
  const weeklyLimit = settings.monthlySpendLimit / 4;
  const overspendPercentage = weeklyLimit > 0 ? Math.max(0, ((totals.total - weeklyLimit) / weeklyLimit) * 100) : 0;
  const openLiabilitiesPercentage = settings.monthlyCreditLimit > 0 ? (totals.open / settings.monthlyCreditLimit) * 100 : 0;

  let score = 100;
  score -= Math.min(40, unnecessaryPercentage * 0.8);
  score -= Math.min(25, creditPercentage * 0.5);
  score -= Math.min(25, overspendPercentage * 0.5);
  score -= Math.min(10, openLiabilitiesPercentage * 0.2);
  score = Math.max(0, Math.round(score));

  return {
    score,
    unnecessaryPercentage,
    creditPercentage,
    overspendPercentage,
    openLiabilitiesPercentage,
  };
}
