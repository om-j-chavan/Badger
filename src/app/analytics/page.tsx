'use client';

import React, { useState, useEffect } from 'react';
import { format, subMonths } from 'date-fns';
import { AppShell } from '@/components/layout/AppShell';
import { Card, StatCard, Button } from '@/components/ui';
import { CategoryChart } from '@/components/analytics/CategoryChart';
import { MonthlyChart } from '@/components/analytics/MonthlyChart';
import { DailySpendingChart } from '@/components/analytics/DailySpendingChart';
import { WeeklySummaryCard } from '@/components/analytics/WeeklySummaryCard';
import { AccountBalanceChart } from '@/components/analytics/AccountBalanceChart';
import VibeScoreCard from '@/components/analytics/VibeScoreCard';
import StreakCard from '@/components/analytics/StreakCard';
import InvestmentChart from '@/components/analytics/InvestmentChart';
import MonthlySavingsCard from '@/components/analytics/MonthlySavingsCard';
import SavingsTrendChart from '@/components/analytics/SavingsTrendChart';
import type {
  CategorySpend,
  MonthlySummary,
  WeeklySummary,
  AccountBalance,
  Settings,
  BillForecast,
  SubscriptionAlert,
  TrendStability,
  BudgetAdherence,
  CutAnalysis,
  MonthlySavingsSummary,
} from '@/types';

// ============================================
// BADGER - Analytics Page
// ============================================

export default function AnalyticsPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [categoryBreakdown, setCategoryBreakdown] = useState<CategorySpend[]>([]);
  const [monthlySummaries, setMonthlySummaries] = useState<MonthlySummary[]>([]);
  const [weeklySummary, setWeeklySummary] = useState<WeeklySummary | null>(null);
  const [dailySpending, setDailySpending] = useState<{ date: string; amount: number }[]>([]);
  const [accountBalances, setAccountBalances] = useState<AccountBalance[]>([]);
  const [trends, setTrends] = useState<{
    thisMonth: number;
    lastMonth: number;
    monthChange: number;
    thisWeek: number;
    lastWeek: number;
    weekChange: number;
  } | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [billForecast, setBillForecast] = useState<BillForecast | null>(null);
  const [subscriptionAlerts, setSubscriptionAlerts] = useState<SubscriptionAlert[]>([]);
  const [trendStability, setTrendStability] = useState<TrendStability | null>(null);
  const [budgetAdherence, setBudgetAdherence] = useState<BudgetAdherence | null>(null);
  const [cutAnalysis, setCutAnalysis] = useState<CutAnalysis | null>(null);
  const [currentSavings, setCurrentSavings] = useState<MonthlySavingsSummary | null>(null);
  const [savingsTrend, setSavingsTrend] = useState<MonthlySavingsSummary[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch analytics data
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();

        const [
          categoryRes,
          monthlyRes,
          weeklyRes,
          dailyRes,
          accountsRes,
          trendsRes,
          settingsRes,
          billForecastRes,
          subscriptionAlertsRes,
          trendStabilityRes,
          budgetAdherenceRes,
          cutAnalysisRes,
          currentSavingsRes,
          savingsTrendRes,
        ] = await Promise.all([
          fetch(`/api/analytics?type=category-breakdown&year=${year}&month=${month}`),
          fetch('/api/analytics?type=monthly-summaries&months=6'),
          fetch('/api/analytics?type=weekly-summary'),
          fetch(`/api/analytics?type=daily-spending&year=${year}&month=${month}`),
          fetch('/api/accounts?withBalances=true'),
          fetch('/api/analytics?type=trends'),
          fetch('/api/settings'),
          fetch('/api/analytics/bill-forecast'),
          fetch('/api/analytics/subscription-alerts'),
          fetch('/api/analytics/trend-stability'),
          fetch('/api/analytics/budget-adherence'),
          fetch('/api/analytics/cut-analysis'),
          fetch(`/api/savings?year=${year}&month=${month + 1}`),
          fetch('/api/savings?type=trend&months=6'),
        ]);

        const [
          categoryData,
          monthlyData,
          weeklyData,
          dailyData,
          accountsData,
          trendsData,
          settingsData,
          billForecastData,
          subscriptionAlertsData,
          trendStabilityData,
          budgetAdherenceData,
          cutAnalysisData,
          currentSavingsData,
          savingsTrendData,
        ] = await Promise.all([
          categoryRes.json(),
          monthlyRes.json(),
          weeklyRes.json(),
          dailyRes.json(),
          accountsRes.json(),
          trendsRes.json(),
          settingsRes.json(),
          billForecastRes.json(),
          subscriptionAlertsRes.json(),
          trendStabilityRes.json(),
          budgetAdherenceRes.json(),
          cutAnalysisRes.json(),
          currentSavingsRes.json(),
          savingsTrendRes.json(),
        ]);

        setCategoryBreakdown(categoryData);
        setMonthlySummaries(monthlyData);
        setWeeklySummary(weeklyData);
        setDailySpending(dailyData);
        setAccountBalances(accountsData);
        setTrends(trendsData);
        setSettings(settingsData);
        setBillForecast(billForecastData);
        setSubscriptionAlerts(subscriptionAlertsData);
        setTrendStability(trendStabilityData);
        setBudgetAdherence(budgetAdherenceData);
        setCutAnalysis(cutAnalysisData);
        setCurrentSavings(currentSavingsData.success ? currentSavingsData.data : null);
        setSavingsTrend(savingsTrendData.success ? savingsTrendData.data : []);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [currentMonth]);

  const currency = settings?.currency || '₹';

  // Navigation
  const previousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => {
    const next = new Date(currentMonth);
    next.setMonth(next.getMonth() + 1);
    if (next <= new Date()) {
      setCurrentMonth(next);
    }
  };

  if (loading) {
    return (
      <AppShell>
        <div className="flex justify-center py-12">
          <span className="loading-spinner" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-text-primary">Analytics</h1>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={previousMonth}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Button>
            <span className="text-text-primary font-medium px-2">
              {format(currentMonth, 'MMMM yyyy')}
            </span>
            <Button variant="ghost" size="sm" onClick={nextMonth}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Button>
          </div>
        </div>

        {/* Trend Stats */}
        {trends && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              label="This Month"
              value={`${currency}${trends.thisMonth.toLocaleString()}`}
              trend={{
                value: trends.monthChange,
                label: 'vs last month',
              }}
            />
            <StatCard
              label="Last Month"
              value={`${currency}${trends.lastMonth.toLocaleString()}`}
            />
            <StatCard
              label="This Week"
              value={`${currency}${trends.thisWeek.toLocaleString()}`}
              trend={{
                value: trends.weekChange,
                label: 'vs last week',
              }}
            />
            <StatCard
              label="Last Week"
              value={`${currency}${trends.lastWeek.toLocaleString()}`}
            />
          </div>
        )}

        {/* Gen-Z Analytics - Prominent placement */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <VibeScoreCard />
          <StreakCard />
        </div>

        {/* Monthly Savings Summary */}
        {currentSavings && (
          <MonthlySavingsCard summary={currentSavings} currency={currency} />
        )}

        {/* Weekly Summary */}
        {weeklySummary && (
          <WeeklySummaryCard summary={weeklySummary} currency={currency} />
        )}

        {/* Investment Tracking */}
        <InvestmentChart />

        {/* Savings Trend */}
        {savingsTrend.length > 0 && (
          <SavingsTrendChart data={savingsTrend} />
        )}

        {/* Maturity Analytics - Bill Forecast */}
        {billForecast && billForecast.totalExpected > 0 && (
          <Card>
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              Bill Forecast (Next 30 Days)
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 bg-background rounded-xl">
                  <p className="text-sm text-text-secondary mb-1">Total Expected</p>
                  <p className="text-xl font-semibold">{currency}{billForecast.totalExpected.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-background rounded-xl">
                  <p className="text-sm text-text-secondary mb-1">Credit Cards</p>
                  <p className="text-xl font-semibold">{currency}{billForecast.breakdown.creditCards.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-background rounded-xl">
                  <p className="text-sm text-text-secondary mb-1">Subscriptions</p>
                  <p className="text-xl font-semibold">{currency}{billForecast.breakdown.subscriptions.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-background rounded-xl">
                  <p className="text-sm text-text-secondary mb-1">Fixed Expenses</p>
                  <p className="text-xl font-semibold">{currency}{billForecast.breakdown.fixedExpenses.toLocaleString()}</p>
                </div>
              </div>
              <div className="space-y-2">
                {billForecast.items.slice(0, 5).map((item, i) => (
                  <div key={i} className="flex justify-between items-center p-3 bg-background rounded-lg">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-xs text-text-secondary">{new Date(item.dueDate).toLocaleDateString()}</p>
                    </div>
                    <p className="font-semibold">{currency}{item.amount.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* Trend Stability */}
        {trendStability && (
          <Card>
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              Trend Stability (3-Month Average)
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-background rounded-xl">
                  <p className="text-sm text-text-secondary mb-1">Avg Spend</p>
                  <p className="text-xl font-semibold">{currency}{Math.round(trendStability.avgSpend).toLocaleString()}</p>
                </div>
                <div className="p-4 bg-background rounded-xl">
                  <p className="text-sm text-text-secondary mb-1">Avg Unnecessary</p>
                  <p className="text-xl font-semibold">{trendStability.avgUnnecessaryPercent.toFixed(1)}%</p>
                </div>
                <div className="p-4 bg-background rounded-xl">
                  <p className="text-sm text-text-secondary mb-1">Avg Credit</p>
                  <p className="text-xl font-semibold">{trendStability.avgCreditPercent.toFixed(1)}%</p>
                </div>
              </div>
              <div className="p-4 bg-background rounded-xl">
                <p className="text-sm text-text-secondary mb-2">Behavior Status</p>
                <div className="flex items-center gap-2">
                  <span className="text-lg">
                    {trendStability.trend === 'improving' ? '📈' : trendStability.trend === 'worsening' ? '📉' : '➡️'}
                  </span>
                  <span className="font-medium capitalize">{trendStability.trend}</span>
                  <span className="text-text-secondary">
                    {trendStability.isStabilizing ? '• Stabilizing' : ''}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Budget Adherence */}
        {budgetAdherence && (
          <Card>
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              Budget Adherence (Last 6 Months)
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-background rounded-xl text-center">
                <p className="text-sm text-text-secondary mb-1">Adherence Rate</p>
                <p className="text-3xl font-semibold">{budgetAdherence.adherenceRate.toFixed(0)}%</p>
                <p className="text-xs text-text-secondary mt-1">
                  {budgetAdherence.monthsUnderLimit} of {budgetAdherence.totalMonths} months under limit
                </p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {budgetAdherence.recentMonths.map((m, i) => (
                  <div key={i} className={`p-3 rounded-lg ${m.underLimit ? 'bg-primary/10' : 'bg-accent/10'}`}>
                    <p className="text-xs text-text-secondary mb-1">{m.month}</p>
                    <p className="text-sm font-semibold">{m.spendPercent.toFixed(0)}%</p>
                    <p className="text-xs">{m.underLimit ? '✓ Under' : '✗ Over'}</p>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* Subscription Intelligence */}
        {subscriptionAlerts.length > 0 && (
          <Card>
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              Subscription Intelligence
            </h3>
            <div className="space-y-3">
              {subscriptionAlerts.map((sub, i) => (
                <div key={i} className="p-4 bg-background rounded-xl">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium">{sub.name}</p>
                      <p className="text-xs text-text-secondary">{sub.monthlyPayments} payments • {currency}{sub.totalSpent.toLocaleString()} total</p>
                    </div>
                    <p className="font-semibold">{currency}{sub.amount.toLocaleString()}/mo</p>
                  </div>
                  <p className="text-sm text-text-secondary italic">{sub.suggestion}</p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Where Can I Cut? */}
        {cutAnalysis && cutAnalysis.totalAvoidable > 0 && (
          <Card>
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              Where Can I Cut? (Last 3 Months)
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-background rounded-xl text-center">
                <p className="text-sm text-text-secondary mb-1">Total Avoidable</p>
                <p className="text-3xl font-semibold">{currency}{cutAnalysis.totalAvoidable.toLocaleString()}</p>
                <p className="text-xs text-text-secondary mt-1">{cutAnalysis.avoidablePercent.toFixed(1)}% of total spending</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-3">Top Unnecessary Categories</h4>
                  <div className="space-y-2">
                    {cutAnalysis.topCategories.map((cat: any, i) => (
                      <div key={i} className="flex justify-between items-center p-2 bg-background rounded">
                        <span className="text-sm">{cat.categoryName}</span>
                        <span className="font-semibold text-sm">{currency}{cat.amount.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Top Unnecessary Merchants</h4>
                  <div className="space-y-2">
                    {cutAnalysis.topMerchants.map((merchant: any, i) => (
                      <div key={i} className="flex justify-between items-center p-2 bg-background rounded">
                        <span className="text-sm">{merchant.merchantName}</span>
                        <span className="font-semibold text-sm">{currency}{merchant.amount.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Breakdown */}
          <Card>
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              Spending by Category
            </h3>
            <CategoryChart data={categoryBreakdown} currency={currency} />
          </Card>

          {/* Daily Spending */}
          <Card>
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              Daily Spending
            </h3>
            <DailySpendingChart data={dailySpending} currency={currency} />
          </Card>
        </div>

        {/* Monthly Comparison */}
        <Card>
          <h3 className="text-lg font-semibold text-text-primary mb-4">
            Income vs Expenses (Last 6 Months)
          </h3>
          <MonthlyChart data={monthlySummaries} currency={currency} />
        </Card>

        {/* Account Balances */}
        <Card>
          <h3 className="text-lg font-semibold text-text-primary mb-4">
            Account Balances
          </h3>
          <AccountBalanceChart data={accountBalances} currency={currency} />
        </Card>
      </div>
    </AppShell>
  );
}
