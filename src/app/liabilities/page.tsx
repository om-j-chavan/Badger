'use client';

import React, { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { AppShell } from '@/components/layout/AppShell';
import { Card, Badge, EmptyState, Button, ConfirmDialog } from '@/components/ui';
import type { EntryWithRelations, Mode, Settings } from '@/types';

// ============================================
// BADGER - Liabilities Page
// ============================================

export default function LiabilitiesPage() {
  const [entries, setEntries] = useState<(EntryWithRelations & { expenseDate?: string })[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [modes, setModes] = useState<Mode[]>([]);
  const [loading, setLoading] = useState(true);
  const [closingEntryId, setClosingEntryId] = useState<string | null>(null);

  // Fetch liabilities
  const fetchData = async () => {
    setLoading(true);
    try {
      const [liabilitiesRes, settingsRes, modesRes] = await Promise.all([
        fetch('/api/liabilities'),
        fetch('/api/settings'),
        fetch('/api/modes'),
      ]);

      const [liabilitiesData, settingsData, modesData] = await Promise.all([
        liabilitiesRes.json(),
        settingsRes.json(),
        modesRes.json(),
      ]);

      setEntries(liabilitiesData);
      setSettings(settingsData);
      setModes(modesData);
    } catch (error) {
      console.error('Error fetching liabilities:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Close an entry (mark as paid)
  const handleCloseEntry = async () => {
    if (!closingEntryId) return;

    try {
      await fetch(`/api/entries/${closingEntryId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'closed' }),
      });
      setClosingEntryId(null);
      fetchData();
    } catch (error) {
      console.error('Error closing entry:', error);
    }
  };

  // Group entries by mode
  const groupedByMode = modes.reduce((acc, mode) => {
    const modeEntries = entries.filter((e) => e.modeId === mode.id);
    if (modeEntries.length > 0) {
      acc[mode.id] = {
        mode,
        entries: modeEntries,
        total: modeEntries.reduce((sum, e) => sum + e.amount, 0),
      };
    }
    return acc;
  }, {} as Record<string, { mode: Mode; entries: typeof entries; total: number }>);

  const currency = settings?.currency || '₹';
  const totalLiabilities = entries.reduce((sum, e) => sum + e.amount, 0);
  const creditLiabilities = entries
    .filter((e) => e.mode?.isCredit)
    .reduce((sum, e) => sum + e.amount, 0);

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
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">Liabilities</h1>
          <p className="text-text-secondary mt-1">Open entries that need to be closed</p>
        </div>

        {/* Summary */}
        {entries.length > 0 && (
          <div className="grid grid-cols-2 gap-4">
            <Card padding="sm" className="text-center">
              <p className="text-sm text-text-secondary">Total Open</p>
              <p className="text-2xl font-semibold text-error">
                {currency}{totalLiabilities.toLocaleString()}
              </p>
            </Card>
            <Card padding="sm" className="text-center">
              <p className="text-sm text-text-secondary">Credit Card</p>
              <p className="text-2xl font-semibold text-warning">
                {currency}{creditLiabilities.toLocaleString()}
              </p>
            </Card>
          </div>
        )}

        {/* Content */}
        {entries.length === 0 ? (
          <EmptyState
            icon="🎉"
            title="No open liabilities!"
            description="All your expenses are paid. Keep up the good work!"
          />
        ) : (
          <div className="space-y-6">
            {Object.values(groupedByMode).map(({ mode, entries: modeEntries, total }) => (
              <div key={mode.id}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold text-text-primary">{mode.name}</h2>
                    {mode.isCredit && (
                      <Badge variant="warning" size="sm">Credit</Badge>
                    )}
                  </div>
                  <span className="font-medium text-error">
                    {currency}{total.toLocaleString()}
                  </span>
                </div>

                <div className="space-y-2">
                  {modeEntries.map((entry) => (
                    <Card key={entry.id} padding="sm" className="hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{entry.category?.icon || '📦'}</span>
                            <h3 className="font-medium text-text-primary truncate">
                              {entry.name}
                            </h3>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-text-secondary mt-1">
                            <span>{entry.category?.name}</span>
                            {entry.expectedClosure && (
                              <>
                                <span className="text-divider">•</span>
                                <span className="text-warning">
                                  Due: {format(parseISO(entry.expectedClosure), 'MMM d')}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-text-primary">
                            {currency}{entry.amount.toLocaleString()}
                          </span>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => setClosingEntryId(entry.id)}
                          >
                            Close
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Close Confirmation */}
      <ConfirmDialog
        isOpen={!!closingEntryId}
        onClose={() => setClosingEntryId(null)}
        onConfirm={handleCloseEntry}
        title="Mark as Paid"
        message="Are you sure you want to mark this entry as closed/paid?"
        confirmText="Mark as Paid"
        variant="primary"
      />
    </AppShell>
  );
}
