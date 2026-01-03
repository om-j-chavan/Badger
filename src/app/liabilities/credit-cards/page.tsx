'use client';

// ============================================
// BADGER - Credit Cards Liabilities Page
// ============================================

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { Card, Button } from '@/components/ui';
import type { CreditCardWithStatements } from '@/types';

export default function CreditCardsPage() {
  const router = useRouter();
  const [creditCards, setCreditCards] = useState<CreditCardWithStatements[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCreditCards();
  }, []);

  const fetchCreditCards = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/credit-cards');
      const data = await res.json();
      if (data.success) {
        // Fetch summaries for each card
        const cardsWithSummaries = await Promise.all(
          data.data.map(async (card: any) => {
            const summaryRes = await fetch(`/api/credit-cards/${card.id}?summary=true`);
            const summaryData = await summaryRes.json();
            return summaryData.success ? summaryData.data : card;
          })
        );
        setCreditCards(cardsWithSummaries);
      }
    } catch (error) {
      console.error('Error fetching credit cards:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalOutstanding = creditCards.reduce((sum, card) => sum + (card.totalOutstanding || 0), 0);

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
            <h1 className="text-2xl font-semibold text-text-primary">Credit Cards</h1>
            <p className="text-text-secondary mt-1">Track your credit card statements and bills</p>
          </div>
          <Button onClick={() => router.push('/settings')}>
            Manage Cards
          </Button>
        </div>

        {/* Total Outstanding */}
        <Card className="bg-gradient-to-br from-error/10 to-error/5 border-error/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">Total Outstanding</p>
              <h2 className="text-3xl font-bold text-error mt-1">
                ₹{totalOutstanding.toLocaleString()}
              </h2>
            </div>
            <span className="text-6xl">💳</span>
          </div>
        </Card>

        {/* Credit Cards List */}
        {creditCards.length === 0 ? (
          <Card>
            <div className="empty-state">
              <span className="text-6xl mb-4">💳</span>
              <p className="font-medium">No credit cards yet</p>
              <p className="text-sm mt-2">Add a credit card in Settings to start tracking statements</p>
              <Button className="mt-4" onClick={() => router.push('/settings')}>
                Add Credit Card
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {creditCards.map((card) => (
              <CreditCardSummaryCard key={card.id} card={card} />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}

function CreditCardSummaryCard({ card }: { card: CreditCardWithStatements }) {
  const router = useRouter();
  const unpaidStatements = card.statements?.filter(s => !s.paid) || [];
  const overdueStatements = unpaidStatements.filter(s => {
    const dueDate = new Date(s.periodEnd);
    dueDate.setDate(card.dueDay);
    return dueDate < new Date();
  });

  return (
    <Card className="hover:shadow-lg transition-all duration-300">
      <div className="space-y-4">
        {/* Card Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">💳</span>
            <div>
              <h3 className="font-semibold text-text-primary">{card.name}</h3>
              <p className="text-sm text-text-secondary">
                Closing: Day {card.closingDay} • Due: Day {card.dueDay}
              </p>
            </div>
          </div>
          {overdueStatements.length > 0 && (
            <span className="px-2 py-1 bg-error/20 text-error text-xs font-bold rounded-full animate-pulse">
              OVERDUE
            </span>
          )}
        </div>

        {/* Outstanding Balance */}
        <div className="p-4 bg-gradient-to-br from-error/5 to-error/10 rounded-xl border border-error/20">
          <p className="text-xs text-text-secondary uppercase tracking-wide">Outstanding Balance</p>
          <p className="text-2xl font-bold text-error mt-1">
            ₹{(card.totalOutstanding || 0).toLocaleString()}
          </p>
        </div>

        {/* Current Statement */}
        <div className="p-4 bg-background rounded-xl">
          <p className="text-xs text-text-secondary uppercase tracking-wide">Current Statement</p>
          <p className="text-xl font-semibold text-text-primary mt-1">
            ₹{(card.currentStatementTotal || 0).toLocaleString()}
          </p>
        </div>

        {/* Unpaid Statements Count */}
        {unpaidStatements.length > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-secondary">
              {unpaidStatements.length} unpaid statement{unpaidStatements.length !== 1 ? 's' : ''}
            </span>
            {overdueStatements.length > 0 && (
              <span className="text-error font-medium">
                {overdueStatements.length} overdue
              </span>
            )}
          </div>
        )}

        {/* View Statements Button */}
        <Button
          className="w-full"
          variant={unpaidStatements.length > 0 ? 'primary' : 'secondary'}
          onClick={() => router.push(`/liabilities/credit-cards/${card.id}/statements`)}
        >
          View Statements
        </Button>
      </div>
    </Card>
  );
}
