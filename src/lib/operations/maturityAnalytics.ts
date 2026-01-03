// ============================================
// BADGER - Maturity Analytics Operations
// ============================================

import db from '../db';
import { getSettings } from './settings';
import { format, addDays, subMonths, parseISO } from 'date-fns';
import type { BillForecast, ForecastItem, SubscriptionAlert, TrendStability, BudgetAdherence, CutAnalysis } from '@/types';

// Bill Forecasting - next 30 days
export function getBillForecast(): BillForecast {
  const today = new Date();
  const endDate = addDays(today, 30);
  const todayStr = format(today, 'yyyy-MM-dd');
  const endDateStr = format(endDate, 'yyyy-MM-dd');

  let totalExpected = 0;
  const breakdown = { creditCards: 0, subscriptions: 0, fixedExpenses: 0 };
  const items: ForecastItem[] = [];

  // Credit card statements due in next 30 days
  const statements = db.prepare(`
    SELECT ccs.*, cc.name as cardName, cc.dueDay
    FROM credit_card_statements ccs
    JOIN credit_cards cc ON ccs.creditCardId = cc.id
    WHERE ccs.paid = 0
  `).all() as any[];

  statements.forEach(stmt => {
    const periodEnd = new Date(stmt.periodEnd);
    const dueDate = new Date(periodEnd);
    dueDate.setDate(stmt.dueDay);
    const dueDateStr = format(dueDate, 'yyyy-MM-dd');

    if (dueDateStr >= todayStr && dueDateStr <= endDateStr) {
      const amount = stmt.totalAmount || 0;
      breakdown.creditCards += amount;
      totalExpected += amount;
      items.push({
        name: `${stmt.cardName} Statement`,
        amount,
        dueDate: dueDateStr,
        type: 'credit_card',
        source: stmt.cardName,
      });
    }
  });

  // Open entries with expected closure in next 30 days
  const openEntries = db.prepare(`
    SELECT e.*, c.name as categoryName, exp.date
    FROM entries e
    JOIN categories c ON e.categoryId = c.id
    JOIN expenses exp ON e.expenseId = exp.id
    WHERE e.status = 'open'
      AND e.expectedClosure IS NOT NULL
      AND e.expectedClosure >= ?
      AND e.expectedClosure <= ?
  `).all(todayStr, endDateStr) as any[];

  openEntries.forEach(entry => {
    const isSubscription = entry.name.toLowerCase().includes('subscription') ||
                          entry.categoryName.toLowerCase().includes('subscription');
    const type = isSubscription ? 'subscription' : 'fixed';

    if (isSubscription) breakdown.subscriptions += entry.amount;
    else breakdown.fixedExpenses += entry.amount;

    totalExpected += entry.amount;
    items.push({
      name: entry.name,
      amount: entry.amount,
      dueDate: entry.expectedClosure,
      type: type as 'subscription' | 'fixed',
    });
  });

  return { totalExpected, breakdown, items: items.sort((a, b) => a.dueDate.localeCompare(b.dueDate)) };
}

// Subscription Intelligence - detect unused subscriptions
export function getSubscriptionAlerts(): SubscriptionAlert[] {
  const alerts: SubscriptionAlert[] = [];
  const threeMonthsAgo = format(subMonths(new Date(), 3), 'yyyy-MM-dd');

  // Find recurring payments (subscriptions)
  const subscriptions = db.prepare(`
    SELECT
      e.name,
      COUNT(*) as paymentCount,
      SUM(e.amount) as totalSpent,
      MAX(exp.date) as lastPayment
    FROM entries e
    JOIN expenses exp ON e.expenseId = exp.id
    WHERE exp.date >= ?
      AND (e.name LIKE '%subscription%' OR e.name LIKE '%Netflix%' OR e.name LIKE '%Spotify%' OR e.name LIKE '%Prime%')
    GROUP BY LOWER(e.name)
    HAVING paymentCount >= 2
  `).all(threeMonthsAgo) as any[];

  subscriptions.forEach(sub => {
    const lastPaymentDate = new Date(sub.lastPayment);
    const daysSincePayment = Math.floor((new Date().getTime() - lastPaymentDate.getTime()) / (1000 * 60 * 60 * 24));
    const avgMonthlyPayment = sub.totalSpent / sub.paymentCount;

    if (daysSincePayment < 45) { // Active subscription
      alerts.push({
        name: sub.name,
        amount: avgMonthlyPayment,
        lastUsed: null,
        monthlyPayments: sub.paymentCount,
        totalSpent: sub.totalSpent,
        suggestion: `Review if you're using ${sub.name} regularly`,
      });
    }
  });

  return alerts;
}

// Trend Stability - 3-month rolling average
export function getTrendStability(): TrendStability {
  const months: any[] = [];
  let totalSpend = 0;
  let totalUnnecessary = 0;
  let totalCredit = 0;

  for (let i = 0; i < 3; i++) {
    const date = subMonths(new Date(), i);
    const year = date.getFullYear();
    const month = date.getMonth();
    const monthStr = format(date, 'MMM yyyy');

    const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
    const endMonth = month === 11 ? 0 : month + 1;
    const endYear = month === 11 ? year + 1 : year;
    const endDate = `${endYear}-${String(endMonth + 1).padStart(2, '0')}-01`;

    const result = db.prepare(`
      SELECT
        COALESCE(SUM(e.amount), 0) as total,
        COALESCE(SUM(CASE WHEN e.necessity = 'unnecessary' THEN e.amount ELSE 0 END), 0) as unnecessary,
        COALESCE(SUM(CASE WHEN m.isCredit = 1 THEN e.amount ELSE 0 END), 0) as credit
      FROM entries e
      JOIN expenses exp ON e.expenseId = exp.id
      JOIN modes m ON e.modeId = m.id
      WHERE exp.date >= ? AND exp.date < ? AND e.type = 'expense'
    `).get(startDate, endDate) as any;

    const spend = result.total;
    const unnecessaryPercent = spend > 0 ? (result.unnecessary / spend) * 100 : 0;
    const creditPercent = spend > 0 ? (result.credit / spend) * 100 : 0;

    months.unshift({ month: monthStr, spend, unnecessaryPercent, creditPercent });
    totalSpend += spend;
    totalUnnecessary += unnecessaryPercent;
    totalCredit += creditPercent;
  }

  const avgSpend = totalSpend / 3;
  const avgUnnecessaryPercent = totalUnnecessary / 3;
  const avgCreditPercent = totalCredit / 3;

  // Determine trend
  const recentUnnecessary = months[2]?.unnecessaryPercent || 0;
  const oldestUnnecessary = months[0]?.unnecessaryPercent || 0;
  let trend: 'improving' | 'stable' | 'worsening' = 'stable';

  if (recentUnnecessary < oldestUnnecessary - 5) trend = 'improving';
  else if (recentUnnecessary > oldestUnnecessary + 5) trend = 'worsening';

  const isStabilizing = Math.abs(recentUnnecessary - oldestUnnecessary) < 10;

  return { avgSpend, avgUnnecessaryPercent, avgCreditPercent, isStabilizing, trend, months };
}

// Budget Adherence - % of months under limits
export function getBudgetAdherence(): BudgetAdherence {
  const settings = getSettings();
  const recentMonths: any[] = [];
  let monthsUnderLimit = 0;

  for (let i = 0; i < 6; i++) {
    const date = subMonths(new Date(), i);
    const year = date.getFullYear();
    const month = date.getMonth();
    const monthStr = format(date, 'MMM yyyy');

    const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
    const endMonth = month === 11 ? 0 : month + 1;
    const endYear = month === 11 ? year + 1 : year;
    const endDate = `${endYear}-${String(endMonth + 1).padStart(2, '0')}-01`;

    const result = db.prepare(`
      SELECT COALESCE(SUM(e.amount), 0) as total
      FROM entries e
      JOIN expenses exp ON e.expenseId = exp.id
      WHERE exp.date >= ? AND exp.date < ? AND e.type = 'expense'
    `).get(startDate, endDate) as any;

    const spend = result.total;
    const underLimit = spend <= settings.monthlySpendLimit;
    const spendPercent = (spend / settings.monthlySpendLimit) * 100;

    if (underLimit) monthsUnderLimit++;
    recentMonths.unshift({ month: monthStr, underLimit, spendPercent });
  }

  const adherenceRate = (monthsUnderLimit / 6) * 100;

  return { totalMonths: 6, monthsUnderLimit, adherenceRate, recentMonths };
}

// Cut Analysis - where can user save money
export function getCutAnalysis(): CutAnalysis {
  const threeMonthsAgo = format(subMonths(new Date(), 3), 'yyyy-MM-dd');

  // Top unnecessary categories
  const categories = db.prepare(`
    SELECT
      c.name as categoryName,
      SUM(e.amount) as amount,
      COUNT(*) as count
    FROM entries e
    JOIN categories c ON e.categoryId = c.id
    JOIN expenses exp ON e.expenseId = exp.id
    WHERE exp.date >= ?
      AND e.necessity = 'unnecessary'
      AND e.type = 'expense'
    GROUP BY e.categoryId
    ORDER BY amount DESC
    LIMIT 5
  `).all(threeMonthsAgo) as any[];

  // Top unnecessary merchants (by name)
  const merchants = db.prepare(`
    SELECT
      e.name as merchantName,
      SUM(e.amount) as amount,
      COUNT(*) as count
    FROM entries e
    JOIN expenses exp ON e.expenseId = exp.id
    WHERE exp.date >= ?
      AND e.necessity = 'unnecessary'
      AND e.type = 'expense'
    GROUP BY LOWER(e.name)
    ORDER BY amount DESC
    LIMIT 5
  `).all(threeMonthsAgo) as any[];

  const totalResult = db.prepare(`
    SELECT
      COALESCE(SUM(CASE WHEN e.type = 'expense' THEN e.amount ELSE 0 END), 0) as totalSpend,
      COALESCE(SUM(CASE WHEN e.necessity = 'unnecessary' AND e.type = 'expense' THEN e.amount ELSE 0 END), 0) as totalAvoidable
    FROM entries e
    JOIN expenses exp ON e.expenseId = exp.id
    WHERE exp.date >= ?
  `).get(threeMonthsAgo) as any;

  const totalAvoidable = totalResult.totalAvoidable;
  const avoidablePercent = totalResult.totalSpend > 0 ? (totalAvoidable / totalResult.totalSpend) * 100 : 0;

  return { totalAvoidable, avoidablePercent, topCategories: categories, topMerchants: merchants };
}
