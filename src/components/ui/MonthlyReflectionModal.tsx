'use client';

import React, { useState, useEffect } from 'react';
import { Modal, Button } from '@/components/ui';

// ============================================
// BADGER - Monthly Reflection Modal
// ============================================

interface MonthlyReflectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  month: number; // 0-11
  year: number;
  previousReflection?: string | null;
}

export function MonthlyReflectionModal({
  isOpen,
  onClose,
  month,
  year,
  previousReflection,
}: MonthlyReflectionModalProps) {
  const [reflection, setReflection] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Fetch existing reflection for this month
      async function fetchReflection() {
        try {
          const res = await fetch(`/api/monthly-reflection?year=${year}&month=${month}`);
          const data = await res.json();
          if (data && data.reflection) {
            setReflection(data.reflection);
          }
        } catch (error) {
          console.error('Error fetching reflection:', error);
        }
      }
      fetchReflection();
    }
  }, [isOpen, year, month]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch('/api/monthly-reflection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ year, month, reflection }),
      });
      onClose();
    } catch (error) {
      console.error('Error saving reflection:', error);
      alert('Failed to save reflection');
    } finally {
      setSaving(false);
    }
  };

  const monthName = new Date(year, month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Monthly Reflection - ${monthName}`}>
      <div className="space-y-4">
        {previousReflection && (
          <div className="p-4 bg-background rounded-xl">
            <h4 className="font-medium text-sm mb-2">Last Month's Reflection</h4>
            <p className="text-sm text-text-secondary italic">{previousReflection}</p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-2">
            Anything you regret this month?
          </label>
          <textarea
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            placeholder="Reflect on your spending this month..."
            className="w-full h-32 px-4 py-3 rounded-xl border border-divider focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none resize-none"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-divider">
          <Button type="button" variant="ghost" onClick={onClose}>
            Skip
          </Button>
          <Button onClick={handleSave} loading={saving}>
            Save Reflection
          </Button>
        </div>
      </div>
    </Modal>
  );
}
