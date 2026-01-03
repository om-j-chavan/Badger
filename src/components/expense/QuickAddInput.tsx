'use client';

import React, { useState, useEffect } from 'react';
import { Button, Input } from '@/components/ui';
import { parseQuickAdd } from '@/lib/quickAdd';
import type { Category, Mode, Account } from '@/types';

// ============================================
// BADGER - Quick Add Input Component
// ============================================

interface QuickAddInputProps {
  date: string;
  onEntryAdded: () => void;
}

export function QuickAddInput({ date, onEntryAdded }: QuickAddInputProps) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [modes, setModes] = useState<Mode[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);

  // Fetch options
  useEffect(() => {
    async function fetchOptions() {
      try {
        const [categoriesRes, modesRes, accountsRes] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/modes'),
          fetch('/api/accounts'),
        ]);

        const [categoriesData, modesData, accountsData] = await Promise.all([
          categoriesRes.json(),
          modesRes.json(),
          accountsRes.json(),
        ]);

        setCategories(categoriesData);
        setModes(modesData);
        setAccounts(accountsData);
      } catch (error) {
        console.error('Error fetching options:', error);
      }
    }

    fetchOptions();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim()) return;

    const parsed = parseQuickAdd(input);

    // Find matching category
    let categoryId = categories[0]?.id || '';
    if (parsed.category) {
      const matched = categories.find((c) =>
        c.name.toLowerCase().includes(parsed.category!.toLowerCase())
      );
      if (matched) categoryId = matched.id;
    }

    // Find matching mode
    let modeId = modes[0]?.id || '';
    if (parsed.mode) {
      const matched = modes.find((m) =>
        m.name.toLowerCase().includes(parsed.mode!.toLowerCase())
      );
      if (matched) modeId = matched.id;
    }

    // Use first account
    const accountId = accounts[0]?.id || '';

    if (!parsed.amount || !parsed.name) {
      // If parsing failed, show a hint
      return;
    }

    setLoading(true);
    try {
      await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date,
          entry: {
            name: parsed.name,
            amount: parsed.amount,
            modeId,
            categoryId,
            necessity: parsed.necessity || 'necessary',
            status: 'closed',
            accountId,
            tags: [],
          },
        }),
      });
      setInput('');
      onEntryAdded();
    } catch (error) {
      console.error('Error adding entry:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-3">
      <div className="flex-1">
        <Input
          placeholder='Quick add: "250 lunch food upi unnecessary"'
          value={input}
          onChange={(e) => setInput(e.target.value)}
          hint="Format: amount name category mode necessity"
        />
      </div>
      <Button type="submit" loading={loading} disabled={!input.trim()}>
        Add
      </Button>
    </form>
  );
}
