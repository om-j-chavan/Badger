'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { format, parseISO } from 'date-fns';
import { Button, Card, Badge, EmptyState, ConfirmDialog } from '@/components/ui';
import { EntryForm } from './EntryForm';
import { QuickAddInput } from './QuickAddInput';
import type { ExpenseWithEntries, EntryWithRelations, EntryFormData, Settings, MonthClose } from '@/types';

// ============================================
// BADGER - Expense View Component
// ============================================

interface ExpenseViewProps {
  date: string;
  onClose: () => void;
}

export function ExpenseView({ date, onClose }: ExpenseViewProps) {
  const [expense, setExpense] = useState<ExpenseWithEntries | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [monthClose, setMonthClose] = useState<MonthClose | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEntryForm, setShowEntryForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<EntryWithRelations | null>(null);
  const [deletingEntryId, setDeletingEntryId] = useState<string | null>(null);

  const fetchExpense = useCallback(async () => {
    setLoading(true);
    try {
      const parsedDate = parseISO(date);
      const year = parsedDate.getFullYear();
      const month = parsedDate.getMonth();

      const [expenseRes, settingsRes, monthCloseRes] = await Promise.all([
        fetch(`/api/expenses?date=${date}`),
        fetch('/api/settings'),
        fetch(`/api/month-close?year=${year}&month=${month}`),
      ]);

      const expenseData = await expenseRes.json();
      const settingsData = await settingsRes.json();
      const monthCloseData = await monthCloseRes.json();

      setExpense(expenseData);
      setSettings(settingsData);
      setMonthClose(monthCloseData);
    } catch (error) {
      console.error('Error fetching expense:', error);
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    fetchExpense();
  }, [fetchExpense]);

  const handleAddEntry = async (data: EntryFormData) => {
    try {
      await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, entry: data }),
      });
      fetchExpense();
    } catch (error) {
      console.error('Error adding entry:', error);
    }
  };

  const handleUpdateEntry = async (data: EntryFormData) => {
    if (!editingEntry) return;

    try {
      await fetch(`/api/entries/${editingEntry.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      setEditingEntry(null);
      fetchExpense();
    } catch (error) {
      console.error('Error updating entry:', error);
    }
  };

  const handleDeleteEntry = async () => {
    if (!deletingEntryId) return;

    try {
      await fetch(`/api/entries/${deletingEntryId}`, {
        method: 'DELETE',
      });
      setDeletingEntryId(null);
      fetchExpense();
    } catch (error) {
      console.error('Error deleting entry:', error);
    }
  };

  const handleDuplicateEntry = async (entryId: string) => {
    try {
      await fetch(`/api/entries/${entryId}/duplicate`, {
        method: 'POST',
      });
      fetchExpense();
    } catch (error) {
      console.error('Error duplicating entry:', error);
    }
  };

  const isStupidSpend = (entry: EntryWithRelations): boolean => {
    if (!settings) return false;
    return entry.necessity === 'unnecessary' && entry.amount > settings.stupidSpendThreshold;
  };

  const formattedDate = format(parseISO(date), 'EEEE, MMMM d, yyyy');
  const currency = settings?.currency || '₹';
  const isClosed = monthClose?.isClosed || false;

  return (
    <div className="space-y-6">
      {/* Month Closed Warning */}
      {isClosed && (
        <div className="p-4 bg-accent/10 border border-accent rounded-xl">
          <p className="text-sm text-text-secondary">
            🔒 This month is closed and read-only. Go to the calendar and reopen the month to make changes.
          </p>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-text-secondary hover:text-text-primary mb-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Calendar
          </button>
          <h2 className="text-2xl font-semibold text-text-primary">{formattedDate}</h2>
        </div>
        <Button onClick={() => setShowEntryForm(true)} disabled={isClosed}>
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Entry
        </Button>
      </div>

      {/* Quick Add */}
      {!isClosed && <QuickAddInput date={date} onEntryAdded={fetchExpense} />}

      {/* Summary */}
      {expense && expense.entries.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <Card padding="sm" className="text-center">
            <p className="text-sm text-text-secondary">Total</p>
            <p className="text-xl font-semibold text-text-primary">
              {currency}{expense.totalAmount.toLocaleString()}
            </p>
          </Card>
          <Card padding="sm" className="text-center">
            <p className="text-sm text-text-secondary">Unnecessary</p>
            <p className="text-xl font-semibold text-warning">
              {currency}{expense.unnecessaryAmount.toLocaleString()}
            </p>
          </Card>
          <Card padding="sm" className="text-center">
            <p className="text-sm text-text-secondary">Open</p>
            <p className="text-xl font-semibold text-error">
              {currency}{expense.openAmount.toLocaleString()}
            </p>
          </Card>
        </div>
      )}

      {/* Entries List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <span className="loading-spinner" />
        </div>
      ) : !expense || expense.entries.length === 0 ? (
        <EmptyState
          icon="📝"
          title="No entries for this day"
          description="Start tracking your expenses by adding an entry"
          action={{
            label: 'Add Entry',
            onClick: () => setShowEntryForm(true),
          }}
        />
      ) : (
        <div className="space-y-3">
          {expense.entries.map((entry) => (
            <Card key={entry.id} padding="sm" className="hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{entry.category?.icon || '📦'}</span>
                    <h3 className="font-medium text-text-primary truncate">{entry.name}</h3>
                    {isStupidSpend(entry) && (
                      <span className="text-warning" title="Stupid spend">⚠️</span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="text-text-secondary">{entry.category?.name}</span>
                    <span className="text-divider">•</span>
                    <span className="text-text-secondary">{entry.mode?.name}</span>
                    <span className="text-divider">•</span>
                    <Badge
                      variant={entry.necessity === 'unnecessary' ? 'warning' : 'success'}
                      size="sm"
                    >
                      {entry.necessity}
                    </Badge>
                    <Badge
                      variant={entry.status === 'open' ? 'error' : 'primary'}
                      size="sm"
                    >
                      {entry.status}
                    </Badge>
                  </div>
                  {entry.tagObjects && entry.tagObjects.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {entry.tagObjects.map((tag) => (
                        <span
                          key={tag.id}
                          className="px-2 py-0.5 rounded text-xs text-white"
                          style={{ backgroundColor: tag.color }}
                        >
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-lg font-semibold text-text-primary">
                    {currency}{entry.amount.toLocaleString()}
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    <button
                      onClick={() => handleDuplicateEntry(entry.id)}
                      className="p-1.5 rounded-lg hover:bg-divider text-text-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Duplicate"
                      disabled={isClosed}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setEditingEntry(entry)}
                      className="p-1.5 rounded-lg hover:bg-divider text-text-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Edit"
                      disabled={isClosed}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setDeletingEntryId(entry.id)}
                      className="p-1.5 rounded-lg hover:bg-error/10 text-error disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Delete"
                      disabled={isClosed}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Entry Form Modal */}
      <EntryForm
        isOpen={showEntryForm || !!editingEntry}
        onClose={() => {
          setShowEntryForm(false);
          setEditingEntry(null);
        }}
        onSubmit={editingEntry ? handleUpdateEntry : handleAddEntry}
        initialData={editingEntry || undefined}
        date={date}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingEntryId}
        onClose={() => setDeletingEntryId(null)}
        onConfirm={handleDeleteEntry}
        title="Delete Entry"
        message="Are you sure you want to delete this entry? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}
