'use client';

import React, { useState, useEffect } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isToday,
} from 'date-fns';
import { Button, ConfirmDialog } from '@/components/ui';
import type { ExpenseWithEntries, Settings, MonthClose } from '@/types';

// ============================================
// BADGER - Calendar Component
// ============================================

interface CalendarProps {
  onDateSelect: (date: string) => void;
  selectedDate: string | null;
}

// Export isClosed state for ExpenseView to use
export { type MonthClose };

export function Calendar({ onDateSelect, selectedDate }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [expenses, setExpenses] = useState<ExpenseWithEntries[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [monthClose, setMonthClose] = useState<MonthClose | null>(null);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [showReopenConfirm, setShowReopenConfirm] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch expenses for the current month
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();

        const [expensesRes, settingsRes, monthCloseRes] = await Promise.all([
          fetch(`/api/expenses?year=${year}&month=${month}`),
          fetch('/api/settings'),
          fetch(`/api/month-close?year=${year}&month=${month}`),
        ]);

        const expensesData = await expensesRes.json();
        const settingsData = await settingsRes.json();
        const monthCloseData = await monthCloseRes.json();

        setExpenses(expensesData);
        setSettings(settingsData);
        setMonthClose(monthCloseData);
      } catch (error) {
        console.error('Error fetching calendar data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [currentMonth]);

  // Get expense for a specific date
  const getExpenseForDate = (date: Date): ExpenseWithEntries | undefined => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return expenses.find((e) => e.date === dateStr);
  };

  // Check if date has warning
  const hasWarning = (expense: ExpenseWithEntries | undefined): boolean => {
    if (!expense || !settings) return false;
    return expense.unnecessaryAmount > 0 && expense.entries.some(
      (e) => e.necessity === 'unnecessary' && e.amount > settings.stupidSpendThreshold
    );
  };

  // Navigation handlers
  const previousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const goToToday = () => setCurrentMonth(new Date());

  // Month close handlers
  const handleCloseMonth = async () => {
    try {
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth();

      const res = await fetch('/api/month-close', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ year, month, action: 'close' }),
      });

      if (res.ok) {
        const data = await res.json();
        setMonthClose(data);
        setShowCloseConfirm(false);
      }
    } catch (error) {
      console.error('Error closing month:', error);
      alert('Failed to close month');
    }
  };

  const handleReopenMonth = async () => {
    try {
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth();

      const res = await fetch('/api/month-close', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ year, month, action: 'reopen' }),
      });

      if (res.ok) {
        const data = await res.json();
        setMonthClose(data);
        setShowReopenConfirm(false);
      }
    } catch (error) {
      console.error('Error reopening month:', error);
      alert('Failed to reopen month');
    }
  };

  const isClosed = monthClose?.isClosed || false;
  const isCurrentOrFutureMonth = currentMonth >= new Date(new Date().getFullYear(), new Date().getMonth(), 1);

  // Generate calendar days
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days: Date[] = [];
  let day = calendarStart;
  while (day <= calendarEnd) {
    days.push(day);
    day = addDays(day, 1);
  }

  // Calculate monthly totals
  const monthlyTotal = expenses.reduce((sum, e) => sum + e.totalAmount, 0);
  const monthlyUnnecessary = expenses.reduce((sum, e) => sum + e.unnecessaryAmount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-semibold text-text-primary">
              {format(currentMonth, 'MMMM yyyy')}
            </h2>
            {isClosed && (
              <span className="px-3 py-1 bg-accent/10 text-accent text-xs font-medium rounded-full">
                🔒 Closed
              </span>
            )}
          </div>
          <p className="text-sm text-text-secondary mt-1">
            {settings?.currency || '₹'}{monthlyTotal.toLocaleString()} spent
            {monthlyUnnecessary > 0 && (
              <span className="text-warning ml-2">
                ({settings?.currency || '₹'}{monthlyUnnecessary.toLocaleString()} unnecessary)
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!isCurrentOrFutureMonth && (
            isClosed ? (
              <Button variant="secondary" size="sm" onClick={() => setShowReopenConfirm(true)}>
                🔓 Reopen
              </Button>
            ) : (
              <Button variant="primary" size="sm" onClick={() => setShowCloseConfirm(true)}>
                🔒 Close Month
              </Button>
            )
          )}
          <Button variant="ghost" size="sm" onClick={previousMonth}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Button>
          <Button variant="secondary" size="sm" onClick={goToToday}>
            Today
          </Button>
          <Button variant="ghost" size="sm" onClick={nextMonth}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Button>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="bg-card rounded-2xl shadow-soft overflow-hidden">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 border-b border-divider">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
            <div
              key={day}
              className="py-3 text-center text-sm font-medium text-text-secondary"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7">
          {days.map((date, index) => {
            const dateStr = format(date, 'yyyy-MM-dd');
            const expense = getExpenseForDate(date);
            const isCurrentMonth = isSameMonth(date, currentMonth);
            const isSelected = selectedDate === dateStr;
            const hasExpense = expense && expense.totalAmount > 0;
            const warning = hasWarning(expense);

            return (
              <button
                key={index}
                onClick={() => onDateSelect(dateStr)}
                className={`
                  aspect-square p-2 border-b border-r border-divider
                  flex flex-col items-center justify-start
                  transition-all duration-200 hover:bg-primary/10
                  ${!isCurrentMonth ? 'opacity-40' : ''}
                  ${isSelected ? 'bg-primary/20' : ''}
                  ${isToday(date) ? 'ring-2 ring-inset ring-accent' : ''}
                  ${warning ? 'bg-warning/10' : hasExpense ? 'bg-primary/5' : ''}
                `}
              >
                <span
                  className={`
                    text-sm font-medium
                    ${isToday(date) ? 'text-accent' : 'text-text-primary'}
                  `}
                >
                  {format(date, 'd')}
                </span>
                {hasExpense && (
                  <span className="text-xs text-text-secondary mt-1 truncate w-full text-center">
                    {settings?.currency || '₹'}{expense.totalAmount.toLocaleString()}
                  </span>
                )}
                {warning && (
                  <span className="text-warning text-xs">⚠</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {loading && (
        <div className="flex justify-center py-4">
          <span className="loading-spinner" />
        </div>
      )}

      {/* Month Close Confirmation */}
      <ConfirmDialog
        isOpen={showCloseConfirm}
        onClose={() => setShowCloseConfirm(false)}
        onConfirm={handleCloseMonth}
        title="Close Month"
        message={`Are you sure you want to close ${format(currentMonth, 'MMMM yyyy')}? This will make the month read-only and prevent any edits.`}
        confirmText="Close Month"
        cancelText="Cancel"
      />

      {/* Month Reopen Confirmation */}
      <ConfirmDialog
        isOpen={showReopenConfirm}
        onClose={() => setShowReopenConfirm(false)}
        onConfirm={handleReopenMonth}
        title="Reopen Month"
        message={`Are you sure you want to reopen ${format(currentMonth, 'MMMM yyyy')}? This will allow edits again.`}
        confirmText="Reopen Month"
        cancelText="Cancel"
      />
    </div>
  );
}
