'use client';

// ============================================
// BADGER - Credit Card Statements Page
// ============================================

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { Card, Button } from '@/components/ui';
import type { CreditCardStatementWithRelations, Account } from '@/types';
import { format, parseISO } from 'date-fns';

export default function CreditCardStatementsPage() {
  const router = useRouter();
  const params = useParams();
  const creditCardId = params.id as string;

  const [statements, setStatements] = useState<CreditCardStatementWithRelations[]>([]);
  const [creditCard, setCreditCard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unpaid' | 'paid'>('all');
  const [expandedStatementId, setExpandedStatementId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [creditCardId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch credit card details
      const cardRes = await fetch(`/api/credit-cards/${creditCardId}`);
      const cardData = await cardRes.json();
      if (cardData.success) {
        setCreditCard(cardData.data);
      }

      // Fetch statements
      const statementsRes = await fetch(`/api/credit-cards/${creditCardId}/statements`);
      const statementsData = await statementsRes.json();
      if (statementsData.success) {
        setStatements(statementsData.data);
      }
    } catch (error) {
      console.error('Error fetching statements:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredStatements = statements.filter((stmt) => {
    if (filter === 'unpaid') return !stmt.paid;
    if (filter === 'paid') return stmt.paid;
    return true;
  });

  const unpaidStatements = statements.filter((s) => !s.paid);
  const totalOutstanding = unpaidStatements.reduce((sum, stmt) => sum + stmt.totalAmount, 0);

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
            <button
              onClick={() => router.push('/liabilities/credit-cards')}
              className="text-text-secondary hover:text-text-primary mb-2 flex items-center gap-2"
            >
              ← Back to Credit Cards
            </button>
            <h1 className="text-2xl font-semibold text-text-primary">
              {creditCard?.name || 'Credit Card'} Statements
            </h1>
            <p className="text-text-secondary mt-1">
              Closing: Day {creditCard?.closingDay} • Due: Day {creditCard?.dueDay}
            </p>
          </div>
        </div>

        {/* Total Outstanding */}
        {totalOutstanding > 0 && (
          <Card className="bg-gradient-to-br from-error/10 to-error/5 border-error/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Total Outstanding</p>
                <h2 className="text-3xl font-bold text-error mt-1">
                  ₹{totalOutstanding.toLocaleString()}
                </h2>
                <p className="text-xs text-text-secondary mt-2">
                  {unpaidStatements.length} unpaid statement{unpaidStatements.length !== 1 ? 's' : ''}
                </p>
              </div>
              <span className="text-6xl">💳</span>
            </div>
          </Card>
        )}

        {/* Filter Tabs */}
        <div className="flex gap-2 border-b border-gray-200">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 font-medium transition-colors ${
              filter === 'all'
                ? 'text-primary border-b-2 border-primary'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            All ({statements.length})
          </button>
          <button
            onClick={() => setFilter('unpaid')}
            className={`px-4 py-2 font-medium transition-colors ${
              filter === 'unpaid'
                ? 'text-primary border-b-2 border-primary'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Unpaid ({unpaidStatements.length})
          </button>
          <button
            onClick={() => setFilter('paid')}
            className={`px-4 py-2 font-medium transition-colors ${
              filter === 'paid'
                ? 'text-primary border-b-2 border-primary'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Paid ({statements.filter((s) => s.paid).length})
          </button>
        </div>

        {/* Statements List */}
        {filteredStatements.length === 0 ? (
          <Card>
            <div className="empty-state">
              <span className="text-6xl mb-4">📄</span>
              <p className="font-medium">No statements found</p>
              <p className="text-sm mt-2">
                {filter === 'unpaid'
                  ? 'All statements have been paid'
                  : filter === 'paid'
                  ? 'No paid statements yet'
                  : 'No statements have been generated yet'}
              </p>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredStatements.map((statement) => (
              <StatementCard
                key={statement.id}
                statement={statement}
                creditCard={creditCard}
                isExpanded={expandedStatementId === statement.id}
                onToggleExpand={() =>
                  setExpandedStatementId(expandedStatementId === statement.id ? null : statement.id)
                }
                onPaymentSuccess={fetchData}
              />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}

function StatementCard({
  statement,
  creditCard,
  isExpanded,
  onToggleExpand,
  onPaymentSuccess,
}: {
  statement: CreditCardStatementWithRelations;
  creditCard: any;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onPaymentSuccess: () => void;
}) {
  const [showPayModal, setShowPayModal] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [paymentDate, setPaymentDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    if (showPayModal) {
      fetchAccounts();
    }
  }, [showPayModal]);

  const fetchAccounts = async () => {
    try {
      const res = await fetch('/api/accounts');
      const data = await res.json();
      if (data.success) {
        setAccounts(data.data);
        if (data.data.length > 0) {
          setSelectedAccountId(data.data[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching accounts:', error);
    }
  };

  const handlePayStatement = async () => {
    if (!selectedAccountId) {
      alert('Please select an account');
      return;
    }

    setPaying(true);
    try {
      const res = await fetch(`/api/statements/${statement.id}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paidDate: paymentDate,
          accountId: selectedAccountId,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setShowPayModal(false);
        onPaymentSuccess();
      } else {
        alert(data.error || 'Failed to mark statement as paid');
      }
    } catch (error) {
      console.error('Error paying statement:', error);
      alert('Failed to mark statement as paid');
    } finally {
      setPaying(false);
    }
  };

  const periodStart = parseISO(statement.periodStart);
  const periodEnd = parseISO(statement.periodEnd);
  const dueDate = new Date(periodEnd);
  dueDate.setDate(creditCard?.dueDay || 15);

  const isOverdue = !statement.paid && dueDate < new Date();
  const entriesCount = statement.entries?.length || 0;

  return (
    <>
      <Card className={`transition-all duration-300 ${isOverdue ? 'border-error/50' : ''}`}>
        <div className="space-y-4">
          {/* Statement Header */}
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h3 className="font-semibold text-text-primary">
                  {format(periodStart, 'MMM dd')} - {format(periodEnd, 'MMM dd, yyyy')}
                </h3>
                {statement.paid ? (
                  <span className="px-2 py-1 bg-primary/20 text-primary text-xs font-bold rounded-full">
                    PAID
                  </span>
                ) : isOverdue ? (
                  <span className="px-2 py-1 bg-error/20 text-error text-xs font-bold rounded-full animate-pulse">
                    OVERDUE
                  </span>
                ) : (
                  <span className="px-2 py-1 bg-accent/20 text-accent text-xs font-bold rounded-full">
                    UNPAID
                  </span>
                )}
              </div>
              <p className="text-sm text-text-secondary mt-1">
                Due: {format(dueDate, 'MMM dd, yyyy')}
                {statement.paid && statement.paidDate && (
                  <> • Paid on {format(parseISO(statement.paidDate), 'MMM dd, yyyy')}</>
                )}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-error">₹{statement.totalAmount.toLocaleString()}</p>
              <p className="text-xs text-text-secondary mt-1">{entriesCount} transaction{entriesCount !== 1 ? 's' : ''}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            {!statement.paid && (
              <Button onClick={() => setShowPayModal(true)} variant="primary" className="flex-1">
                Mark as Paid
              </Button>
            )}
            <Button onClick={onToggleExpand} variant="secondary" className="flex-1">
              {isExpanded ? 'Hide' : 'View'} Transactions
            </Button>
          </div>

          {/* Expanded Entries */}
          {isExpanded && statement.entries && statement.entries.length > 0 && (
            <div className="pt-4 border-t border-gray-100 space-y-2">
              <h4 className="text-sm font-medium text-text-secondary uppercase tracking-wide">
                Transactions
              </h4>
              <div className="space-y-2">
                {statement.entries.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between p-3 bg-background rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-text-primary">{entry.name}</p>
                      <p className="text-xs text-text-secondary mt-1">
                        {entry.category?.name || 'Uncategorized'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-text-primary">₹{entry.amount.toLocaleString()}</p>
                      {entry.status === 'closed' && (
                        <span className="text-xs text-primary">Closed</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Pay Statement Modal */}
      {showPayModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-xl font-semibold text-text-primary">Pay Statement</h3>

            <div className="space-y-4">
              {/* Amount Display */}
              <div className="p-4 bg-gradient-to-br from-error/10 to-error/5 rounded-xl border border-error/20">
                <p className="text-sm text-text-secondary">Amount to Pay</p>
                <p className="text-2xl font-bold text-error">₹{statement.totalAmount.toLocaleString()}</p>
              </div>

              {/* Payment Date */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Payment Date
                </label>
                <input
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Account Selector */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Pay From Account
                </label>
                <select
                  value={selectedAccountId}
                  onChange={(e) => setSelectedAccountId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {accounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Warning */}
              <div className="p-3 bg-accent/10 rounded-lg border border-accent/20">
                <p className="text-xs text-text-secondary">
                  This will close all transactions in this statement and deduct ₹
                  {statement.totalAmount.toLocaleString()} from the selected account.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-4">
              <Button
                onClick={() => setShowPayModal(false)}
                variant="secondary"
                className="flex-1"
                disabled={paying}
              >
                Cancel
              </Button>
              <Button
                onClick={handlePayStatement}
                variant="primary"
                className="flex-1"
                disabled={paying}
              >
                {paying ? 'Processing...' : 'Confirm Payment'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
