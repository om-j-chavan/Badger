'use client';

import React, { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { AppShell } from '@/components/layout/AppShell';
import { Card, Button, Select } from '@/components/ui';
import { useApp } from '@/contexts/AppContext';
import { t } from '@/lib/translations';
import type { ExpenseWithEntries, Income, Settings } from '@/types';

// ============================================
// BADGER - Diary Export Page
// ============================================

type DiaryEntry = {
  date: string;
  name: string;
  amount: number;
  type: 'income' | 'expense';
  category?: string;
};

export default function DiaryPage() {
  const { language, appMode } = useApp();
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [expenses, setExpenses] = useState<ExpenseWithEntries[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Fetch data
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const start = startOfMonth(selectedMonth);
        const end = endOfMonth(selectedMonth);

        const [expensesRes, incomeRes, settingsRes] = await Promise.all([
          fetch(`/api/expenses?start=${start.toISOString()}&end=${end.toISOString()}`),
          fetch(`/api/income?start=${start.toISOString()}&end=${end.toISOString()}`),
          fetch('/api/settings'),
        ]);

        const [expensesData, incomeData, settingsData] = await Promise.all([
          expensesRes.json(),
          incomeRes.json(),
          settingsRes.json(),
        ]);

        setExpenses(expensesData);
        setIncomes(incomeData);
        setSettings(settingsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [selectedMonth]);

  // Convert to unified diary entries
  const diaryEntries: DiaryEntry[] = [
    ...incomes.map(income => ({
      date: income.date,
      name: income.source,
      amount: income.amount,
      type: 'income' as const,
    })),
    ...expenses.flatMap(expense =>
      expense.entries.map(entry => ({
        date: expense.date,
        name: entry.name,
        amount: entry.amount,
        type: 'expense' as const,
        category: entry.category?.name,
      }))
    ),
  ];

  // Calculate totals
  const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0);

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.totalAmount, 0);

  const netSavings = totalIncome - totalExpenses;

  // Group entries by date
  const entriesByDate = diaryEntries.reduce((acc, entry) => {
    const date = format(new Date(entry.date), 'yyyy-MM-dd');
    if (!acc[date]) acc[date] = [];
    acc[date].push(entry);
    return acc;
  }, {} as Record<string, DiaryEntry[]>);

  // Export as PDF
  const handleExport = async () => {
    setExporting(true);
    try {
      // In a real implementation, you would use a library like jsPDF or react-pdf
      // For now, we'll create a simple print-friendly version
      const printContent = generateDiaryHTML();
      const printWindow = window.open('', '', 'width=800,height=600');
      if (printWindow) {
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.print();
      }
    } catch (error) {
      console.error('Error exporting diary:', error);
    } finally {
      setExporting(false);
    }
  };

  const generateDiaryHTML = () => {
    const monthName = format(selectedMonth, 'MMMM yyyy');
    const days = eachDayOfInterval({
      start: startOfMonth(selectedMonth),
      end: endOfMonth(selectedMonth),
    });

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${t('diaryTitle', language, appMode)} - ${monthName}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Kalam:wght@300;400;700&display=swap');

          body {
            font-family: 'Kalam', cursive;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px;
            background: #f5f3e8;
            color: #2c1810;
          }

          .diary-cover {
            text-align: center;
            padding: 60px 20px;
            border-bottom: 2px solid #8b7355;
            margin-bottom: 40px;
          }

          .diary-title {
            font-size: 42px;
            font-weight: 700;
            margin-bottom: 10px;
          }

          .diary-month {
            font-size: 28px;
            color: #8b7355;
          }

          .summary {
            background: white;
            padding: 30px;
            border-radius: 10px;
            margin-bottom: 30px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }

          .summary h2 {
            font-size: 24px;
            margin-bottom: 20px;
            border-bottom: 2px solid #8b7355;
            padding-bottom: 10px;
          }

          .summary-item {
            display: flex;
            justify-content: space-between;
            margin: 15px 0;
            font-size: 18px;
          }

          .summary-item.savings {
            font-weight: 700;
            font-size: 22px;
            margin-top: 20px;
            padding-top: 20px;
            border-top: 2px solid #8b7355;
          }

          .daily-entry {
            background: white;
            padding: 20px;
            border-radius: 10px;
            margin-bottom: 20px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            page-break-inside: avoid;
          }

          .date-header {
            font-size: 20px;
            font-weight: 700;
            color: #8b7355;
            margin-bottom: 15px;
            border-bottom: 1px solid #d4c5b9;
            padding-bottom: 8px;
          }

          .entry-item {
            margin: 10px 0;
            padding-left: 20px;
            border-left: 3px solid #d4c5b9;
          }

          .entry-type {
            font-size: 14px;
            color: #8b7355;
            text-transform: uppercase;
          }

          .entry-description {
            font-size: 18px;
            margin: 5px 0;
          }

          .entry-amount {
            font-size: 16px;
            font-weight: 700;
          }

          .income {
            color: #2d7a4f;
          }

          .expense {
            color: #a84632;
          }

          @media print {
            body {
              background: white;
            }
          }
        </style>
      </head>
      <body>
        <div class="diary-cover">
          <div class="diary-title">🦡 ${t('diaryTitle', language, appMode)}</div>
          <div class="diary-month">${monthName}</div>
        </div>

        <div class="summary">
          <h2>${t('monthlySummaryTitle', language, appMode)}</h2>
          <div class="summary-item">
            <span>${t('totalIncome', language, appMode)}:</span>
            <span class="income">${settings?.currency || '₹'}${totalIncome.toLocaleString()}</span>
          </div>
          <div class="summary-item">
            <span>${t('totalExpenses', language, appMode)}:</span>
            <span class="expense">${settings?.currency || '₹'}${totalExpenses.toLocaleString()}</span>
          </div>
          <div class="summary-item savings">
            <span>${t('netSavings', language, appMode)}:</span>
            <span class="${netSavings >= 0 ? 'income' : 'expense'}">
              ${settings?.currency || '₹'}${Math.abs(netSavings).toLocaleString()}
            </span>
          </div>
        </div>

        <h2 style="font-size: 28px; margin: 40px 0 20px 0; border-bottom: 2px solid #8b7355; padding-bottom: 10px;">
          ${t('dailyLog', language, appMode)}
        </h2>

        ${days.map(day => {
          const dateKey = format(day, 'yyyy-MM-dd');
          const dayEntries = entriesByDate[dateKey] || [];

          if (dayEntries.length === 0) return '';

          return `
            <div class="daily-entry">
              <div class="date-header">${format(day, 'EEEE, MMMM d, yyyy')}</div>
              ${dayEntries.map(entry => `
                <div class="entry-item">
                  <div class="entry-type">${entry.type}</div>
                  <div class="entry-description">${entry.name || entry.category || 'Entry'}</div>
                  <div class="entry-amount ${entry.type}">
                    ${settings?.currency || '₹'}${entry.amount.toLocaleString()}
                  </div>
                </div>
              `).join('')}
            </div>
          `;
        }).join('')}
      </body>
      </html>
    `;
  };

  // Generate month options (last 12 months)
  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    return {
      value: date.toISOString(),
      label: format(date, 'MMMM yyyy'),
    };
  });

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">
            {t('diaryTitle', language, appMode)}
          </h1>
          <p className="text-text-secondary mt-1">
            {t('diaryDescription', language, appMode)}
          </p>
        </div>

        {/* Month Selector */}
        <Card>
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex-1">
              <label className="block text-sm font-medium text-text-primary mb-2">
                {t('selectMonth', language, appMode)}
              </label>
              <Select
                options={monthOptions}
                value={selectedMonth.toISOString()}
                onChange={(e) => setSelectedMonth(new Date(e.target.value))}
              />
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handleExport}
                disabled={exporting || loading}
                className="bg-primary text-white px-6 py-3"
              >
                {exporting ? t('exportingDiary', language, appMode) : t('exportPDF', language, appMode)}
              </Button>
            </div>
          </div>
        </Card>

        {/* Preview */}
        {loading ? (
          <Card>
            <div className="text-center py-12">
              <span className="loading-spinner" />
            </div>
          </Card>
        ) : (
          <Card>
            <div className="space-y-6">
              {/* Summary */}
              <div>
                <h3 className="text-lg font-semibold text-text-primary mb-4">
                  {t('monthlySummaryTitle', language, appMode)}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-background p-4 rounded-lg">
                    <div className="text-sm text-text-secondary">
                      {t('totalIncome', language, appMode)}
                    </div>
                    <div className="text-2xl font-semibold text-success mt-1">
                      {settings?.currency || '₹'}
                      {totalIncome.toLocaleString()}
                    </div>
                  </div>
                  <div className="bg-background p-4 rounded-lg">
                    <div className="text-sm text-text-secondary">
                      {t('totalExpenses', language, appMode)}
                    </div>
                    <div className="text-2xl font-semibold text-error mt-1">
                      {settings?.currency || '₹'}
                      {totalExpenses.toLocaleString()}
                    </div>
                  </div>
                  <div className="bg-background p-4 rounded-lg">
                    <div className="text-sm text-text-secondary">
                      {t('netSavings', language, appMode)}
                    </div>
                    <div className={`text-2xl font-semibold mt-1 ${netSavings >= 0 ? 'text-success' : 'text-error'}`}>
                      {settings?.currency || '₹'}
                      {Math.abs(netSavings).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Daily Log Preview */}
              <div>
                <h3 className="text-lg font-semibold text-text-primary mb-4">
                  {t('dailyLog', language, appMode)}
                </h3>
                {diaryEntries.length === 0 ? (
                  <p className="text-text-secondary text-center py-8">
                    {t('noExpenses', language, appMode)}
                  </p>
                ) : (
                  <div className="text-sm text-text-secondary">
                    {diaryEntries.length} {diaryEntries.length === 1 ? 'entry' : 'entries'} this month
                  </div>
                )}
              </div>
            </div>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
