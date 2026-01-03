'use client';

import React, { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { AppShell } from '@/components/layout/AppShell';
import { Card, Button, EmptyState, Modal, Input, Select, ConfirmDialog } from '@/components/ui';
import type { IncomeWithRelations, Account, Settings, IncomeFormData } from '@/types';

// ============================================
// BADGER - Income Page
// ============================================

export default function IncomePage() {
  const [incomes, setIncomes] = useState<IncomeWithRelations[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingIncome, setEditingIncome] = useState<IncomeWithRelations | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<IncomeFormData>({
    date: format(new Date(), 'yyyy-MM-dd'),
    source: '',
    amount: 0,
    accountId: '',
  });
  const [formLoading, setFormLoading] = useState(false);

  // Fetch data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [incomeRes, accountsRes, settingsRes] = await Promise.all([
        fetch('/api/income'),
        fetch('/api/accounts'),
        fetch('/api/settings'),
      ]);

      const [incomeData, accountsData, settingsData] = await Promise.all([
        incomeRes.json(),
        accountsRes.json(),
        settingsRes.json(),
      ]);

      setIncomes(incomeData);
      setAccounts(accountsData);
      setSettings(settingsData);

      // Set default account
      if (accountsData.length > 0 && !formData.accountId) {
        setFormData((prev) => ({ ...prev, accountId: accountsData[0].id }));
      }
    } catch (error) {
      console.error('Error fetching income:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.source || !formData.amount || !formData.accountId) return;

    setFormLoading(true);
    try {
      if (editingIncome) {
        await fetch(`/api/income/${editingIncome.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      } else {
        await fetch('/api/income', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      }

      setShowForm(false);
      setEditingIncome(null);
      setFormData({
        date: format(new Date(), 'yyyy-MM-dd'),
        source: '',
        amount: 0,
        accountId: accounts[0]?.id || '',
      });
      fetchData();
    } catch (error) {
      console.error('Error saving income:', error);
    } finally {
      setFormLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!deletingId) return;

    try {
      await fetch(`/api/income/${deletingId}`, {
        method: 'DELETE',
      });
      setDeletingId(null);
      fetchData();
    } catch (error) {
      console.error('Error deleting income:', error);
    }
  };

  // Open edit form
  const handleEdit = (income: IncomeWithRelations) => {
    setEditingIncome(income);
    setFormData({
      date: income.date,
      source: income.source,
      amount: income.amount,
      accountId: income.accountId,
    });
    setShowForm(true);
  };

  const currency = settings?.currency || '₹';
  const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);

  // Group by month
  const groupedByMonth = incomes.reduce((acc, income) => {
    const month = format(parseISO(income.date), 'MMMM yyyy');
    if (!acc[month]) {
      acc[month] = { incomes: [], total: 0 };
    }
    acc[month].incomes.push(income);
    acc[month].total += income.amount;
    return acc;
  }, {} as Record<string, { incomes: IncomeWithRelations[]; total: number }>);

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
          <div>
            <h1 className="text-2xl font-semibold text-text-primary">Income</h1>
            <p className="text-text-secondary mt-1">
              Total: {currency}{totalIncome.toLocaleString()}
            </p>
          </div>
          <Button onClick={() => setShowForm(true)}>
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Income
          </Button>
        </div>

        {/* Content */}
        {incomes.length === 0 ? (
          <EmptyState
            icon="💰"
            title="No income recorded"
            description="Start tracking your income by adding an entry"
            action={{
              label: 'Add Income',
              onClick: () => setShowForm(true),
            }}
          />
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedByMonth).map(([month, { incomes: monthIncomes, total }]) => (
              <div key={month}>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-semibold text-text-primary">{month}</h2>
                  <span className="font-medium text-success">
                    {currency}{total.toLocaleString()}
                  </span>
                </div>

                <div className="space-y-2">
                  {monthIncomes.map((income) => (
                    <Card key={income.id} padding="sm" className="hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-text-primary">{income.source}</h3>
                          <div className="flex items-center gap-2 text-sm text-text-secondary mt-1">
                            <span>{format(parseISO(income.date), 'MMM d, yyyy')}</span>
                            <span className="text-divider">•</span>
                            <span>{income.account?.name}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-success">
                            +{currency}{income.amount.toLocaleString()}
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleEdit(income)}
                              className="p-1.5 rounded-lg hover:bg-divider text-text-secondary"
                              title="Edit"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => setDeletingId(income.id)}
                              className="p-1.5 rounded-lg hover:bg-error/10 text-error"
                              title="Delete"
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
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Income Form Modal */}
      <Modal
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingIncome(null);
          setFormData({
            date: format(new Date(), 'yyyy-MM-dd'),
            source: '',
            amount: 0,
            accountId: accounts[0]?.id || '',
          });
        }}
        title={editingIncome ? 'Edit Income' : 'Add Income'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          />
          <Input
            label="Source"
            placeholder="e.g., Salary, Freelance"
            value={formData.source}
            onChange={(e) => setFormData({ ...formData, source: e.target.value })}
          />
          <Input
            label="Amount"
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={formData.amount || ''}
            onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
          />
          <Select
            label="Account"
            options={accounts.map((a) => ({ value: a.id, label: a.name }))}
            value={formData.accountId}
            onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setShowForm(false);
                setEditingIncome(null);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" loading={formLoading}>
              {editingIncome ? 'Save Changes' : 'Add Income'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="Delete Income"
        message="Are you sure you want to delete this income entry? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
      />
    </AppShell>
  );
}
