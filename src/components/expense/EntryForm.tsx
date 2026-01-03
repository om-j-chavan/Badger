'use client';

import React, { useState, useEffect } from 'react';
import { Button, Input, Select, Modal } from '@/components/ui';
import MoodPicker from './MoodPicker';
import type {
  EntryFormData,
  Category,
  Mode,
  Account,
  Tag,
  EntryWithRelations,
  Necessity,
  EntryStatus,
  EntryType,
  Mood,
  Settings,
} from '@/types';

// ============================================
// BADGER - Entry Form Component
// ============================================

interface EntryFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: EntryFormData) => void;
  initialData?: EntryWithRelations;
  date: string;
}

export function EntryForm({ isOpen, onClose, onSubmit, initialData, date }: EntryFormProps) {
  const [formData, setFormData] = useState<EntryFormData>({
    name: '',
    amount: 0,
    modeId: '',
    categoryId: '',
    necessity: 'necessary',
    status: 'closed',
    expectedClosure: null,
    accountId: '',
    tags: [],
    type: 'expense',
    mood: null,
    regret: false,
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [modes, setModes] = useState<Mode[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch options
  useEffect(() => {
    async function fetchOptions() {
      try {
        const [categoriesRes, modesRes, accountsRes, tagsRes, settingsRes] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/modes'),
          fetch('/api/accounts'),
          fetch('/api/tags'),
          fetch('/api/settings'),
        ]);

        const [categoriesData, modesData, accountsData, tagsData, settingsData] = await Promise.all([
          categoriesRes.json(),
          modesRes.json(),
          accountsRes.json(),
          tagsRes.json(),
          settingsRes.json(),
        ]);

        setCategories(categoriesData);
        setModes(modesData);
        setAccounts(accountsData);
        setTags(tagsData);
        setSettings(settingsData);

        // Set defaults if creating new entry
        if (!initialData) {
          setFormData((prev) => ({
            ...prev,
            categoryId: categoriesData[0]?.id || '',
            modeId: modesData[0]?.id || '',
            accountId: accountsData[0]?.id || '',
          }));
        }
      } catch (error) {
        console.error('Error fetching options:', error);
      }
    }

    if (isOpen) {
      fetchOptions();
    }
  }, [isOpen, initialData]);

  // Set initial data when editing
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        amount: initialData.amount,
        modeId: initialData.modeId,
        categoryId: initialData.categoryId,
        necessity: initialData.necessity,
        status: initialData.status,
        expectedClosure: initialData.expectedClosure,
        accountId: initialData.accountId,
        tags: initialData.tags,
        type: initialData.type || 'expense',
        mood: initialData.mood || null,
        regret: initialData.regret || false,
      });
    } else {
      setFormData({
        name: '',
        amount: 0,
        modeId: modes[0]?.id || '',
        categoryId: categories[0]?.id || '',
        necessity: 'necessary',
        status: 'closed',
        expectedClosure: null,
        accountId: accounts[0]?.id || '',
        tags: [],
        type: 'expense',
        mood: null,
        regret: false,
      });
    }
  }, [initialData, categories, modes, accounts]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (formData.amount <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }
    if (!formData.categoryId) {
      newErrors.categoryId = 'Category is required';
    }
    if (!formData.modeId) {
      newErrors.modeId = 'Payment mode is required';
    }
    if (!formData.accountId) {
      newErrors.accountId = 'Account is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Error submitting entry:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTagToggle = (tagId: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.includes(tagId)
        ? prev.tags.filter((id) => id !== tagId)
        : [...prev.tags, tagId],
    }));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Entry' : 'Add Entry'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Entry Type Toggle */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Entry Type</label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: 'expense' })}
              className={`flex-1 py-2 px-4 rounded-lg border-2 transition-all ${
                formData.type === 'expense'
                  ? 'border-primary bg-primary/10 text-primary font-medium'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: 'investment' })}
              className={`flex-1 py-2 px-4 rounded-lg border-2 transition-all ${
                formData.type === 'investment'
                  ? 'border-accent bg-accent/10 text-accent font-medium'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              Investment
            </button>
          </div>
        </div>

        {/* Name and Amount row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Name"
            placeholder="e.g., Lunch at restaurant"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            error={errors.name}
          />
          <Input
            label="Amount"
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={formData.amount || ''}
            onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
            error={errors.amount}
          />
        </div>

        {/* Category and Mode row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Category"
            options={categories.map((c) => ({ value: c.id, label: `${c.icon} ${c.name}` }))}
            value={formData.categoryId}
            onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
            error={errors.categoryId}
          />
          <Select
            label="Payment Mode"
            options={modes.map((m) => ({ value: m.id, label: m.name + (m.isCredit ? ' (Credit)' : '') }))}
            value={formData.modeId}
            onChange={(e) => setFormData({ ...formData, modeId: e.target.value })}
            error={errors.modeId}
          />
        </div>

        {/* Account and Necessity row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Account"
            options={accounts.map((a) => ({ value: a.id, label: a.name }))}
            value={formData.accountId}
            onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
            error={errors.accountId}
          />
          {formData.type === 'expense' && (
            <Select
              label="Necessity"
              options={[
                { value: 'necessary', label: 'Necessary' },
                { value: 'unnecessary', label: 'Unnecessary' },
              ]}
              value={formData.necessity}
              onChange={(e) => setFormData({ ...formData, necessity: e.target.value as Necessity })}
            />
          )}
        </div>

        {/* Mood Picker - only for expenses if enabled */}
        {formData.type === 'expense' && settings?.enableMoodTracking && (
          <MoodPicker
            value={formData.mood}
            onChange={(mood) => setFormData({ ...formData, mood })}
          />
        )}

        {/* Regret Checkbox - only for expenses if enabled */}
        {formData.type === 'expense' && settings?.enableRegretTracking && (
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="regret"
              checked={formData.regret}
              onChange={(e) => setFormData({ ...formData, regret: e.target.checked })}
              className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
            />
            <label htmlFor="regret" className="text-sm font-medium text-gray-700">
              I regret this purchase
            </label>
          </div>
        )}

        {/* Status and Expected Closure row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Status"
            options={[
              { value: 'closed', label: 'Closed (Paid)' },
              { value: 'open', label: 'Open (Pending)' },
            ]}
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as EntryStatus })}
          />
          {formData.status === 'open' && (
            <Input
              label="Expected Closure Date"
              type="date"
              value={formData.expectedClosure || ''}
              onChange={(e) => setFormData({ ...formData, expectedClosure: e.target.value || null })}
            />
          )}
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Tags</label>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => handleTagToggle(tag.id)}
                  className={`
                    px-3 py-1.5 rounded-full text-sm font-medium
                    transition-all duration-200
                    ${
                      formData.tags.includes(tag.id)
                        ? 'text-white'
                        : 'bg-divider text-text-secondary hover:bg-divider/80'
                    }
                  `}
                  style={{
                    backgroundColor: formData.tags.includes(tag.id) ? tag.color : undefined,
                  }}
                >
                  {tag.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-divider">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            {initialData ? 'Save Changes' : 'Add Entry'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
