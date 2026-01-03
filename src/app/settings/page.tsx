'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { Card, Button, Input, Select, Modal, ConfirmDialog, Badge } from '@/components/ui';
import type { Settings, Category, Mode, Account, Tag, Template, WeekStartDay } from '@/types';

// ============================================
// BADGER - Settings Page
// ============================================

type SettingsTab = 'limits' | 'preferences' | 'data' | 'credit-cards' | 'categories' | 'modes' | 'accounts' | 'tags' | 'templates';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('limits');
  const [settings, setSettings] = useState<Settings | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [modes, setModes] = useState<Mode[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch all data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [settingsRes, categoriesRes, modesRes, accountsRes, tagsRes, templatesRes] =
        await Promise.all([
          fetch('/api/settings'),
          fetch('/api/categories?includeInactive=true'),
          fetch('/api/modes?includeInactive=true'),
          fetch('/api/accounts?includeInactive=true'),
          fetch('/api/tags?includeInactive=true'),
          fetch('/api/templates?includeInactive=true'),
        ]);

      const [settingsData, categoriesData, modesData, accountsData, tagsData, templatesData] =
        await Promise.all([
          settingsRes.json(),
          categoriesRes.json(),
          modesRes.json(),
          accountsRes.json(),
          tagsRes.json(),
          templatesRes.json(),
        ]);

      setSettings(settingsData);
      setCategories(categoriesData);
      setModes(modesData);
      setAccounts(accountsData);
      setTags(tagsData);
      setTemplates(templatesData);
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Save settings
  const saveSettings = async (updates: Partial<Settings>) => {
    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      setSettings(data);
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'limits' as const, label: 'Limits & Thresholds', icon: '⚙️' },
    { id: 'preferences' as const, label: 'Preferences', icon: '🎨' },
    { id: 'data' as const, label: 'Data Safety', icon: '💾' },
    { id: 'credit-cards' as const, label: 'Credit Cards', icon: '💳' },
    { id: 'categories' as const, label: 'Categories', icon: '📁' },
    { id: 'modes' as const, label: 'Payment Modes', icon: '💰' },
    { id: 'accounts' as const, label: 'Accounts', icon: '🏦' },
    { id: 'tags' as const, label: 'Tags', icon: '🏷️' },
    { id: 'templates' as const, label: 'Templates', icon: '📋' },
  ];

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
          <h1 className="text-2xl font-semibold text-text-primary">Settings</h1>
          <p className="text-text-secondary mt-1">Configure your Badger experience</p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all
                ${
                  activeTab === tab.id
                    ? 'bg-primary text-text-primary'
                    : 'bg-card text-text-secondary hover:bg-divider'
                }
              `}
            >
              <span>{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'limits' && settings && (
            <LimitsSettings settings={settings} onSave={saveSettings} saving={saving} />
          )}
          {activeTab === 'preferences' && settings && (
            <PreferencesSettings settings={settings} onSave={saveSettings} saving={saving} />
          )}
          {activeTab === 'data' && settings && (
            <DataSafetySettings settings={settings} />
          )}
          {activeTab === 'credit-cards' && (
            <CreditCardsSettings onRefresh={fetchData} />
          )}
          {activeTab === 'categories' && (
            <CategoriesSettings categories={categories} onRefresh={fetchData} />
          )}
          {activeTab === 'modes' && (
            <ModesSettings modes={modes} onRefresh={fetchData} />
          )}
          {activeTab === 'accounts' && (
            <AccountsSettings accounts={accounts} onRefresh={fetchData} />
          )}
          {activeTab === 'tags' && (
            <TagsSettings tags={tags} onRefresh={fetchData} />
          )}
          {activeTab === 'templates' && (
            <TemplatesSettings
              templates={templates}
              categories={categories}
              modes={modes}
              accounts={accounts}
              onRefresh={fetchData}
            />
          )}
        </div>
      </div>
    </AppShell>
  );
}

// ============================================
// Limits Settings Component
// ============================================

function LimitsSettings({
  settings,
  onSave,
  saving,
}: {
  settings: Settings;
  onSave: (updates: Partial<Settings>) => Promise<void>;
  saving: boolean;
}) {
  const [formData, setFormData] = useState({
    monthlySpendLimit: settings.monthlySpendLimit,
    monthlyUnnecessaryLimit: settings.monthlyUnnecessaryLimit,
    monthlyCreditLimit: settings.monthlyCreditLimit,
    stupidSpendThreshold: settings.stupidSpendThreshold,
    currency: settings.currency,
    weekStartDay: settings.weekStartDay,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
  };

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-6">
        <h3 className="text-lg font-semibold text-text-primary">Spending Limits</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Monthly Spend Limit"
            type="number"
            min="0"
            value={formData.monthlySpendLimit}
            onChange={(e) =>
              setFormData({ ...formData, monthlySpendLimit: parseFloat(e.target.value) || 0 })
            }
            hint="Total spending limit per month"
          />
          <Input
            label="Monthly Unnecessary Limit"
            type="number"
            min="0"
            value={formData.monthlyUnnecessaryLimit}
            onChange={(e) =>
              setFormData({ ...formData, monthlyUnnecessaryLimit: parseFloat(e.target.value) || 0 })
            }
            hint="Limit for unnecessary spending"
          />
          <Input
            label="Monthly Credit Limit"
            type="number"
            min="0"
            value={formData.monthlyCreditLimit}
            onChange={(e) =>
              setFormData({ ...formData, monthlyCreditLimit: parseFloat(e.target.value) || 0 })
            }
            hint="Limit for open credit"
          />
          <Input
            label="Stupid Spend Threshold"
            type="number"
            min="0"
            value={formData.stupidSpendThreshold}
            onChange={(e) =>
              setFormData({ ...formData, stupidSpendThreshold: parseFloat(e.target.value) || 0 })
            }
            hint="Flag unnecessary spends above this"
          />
        </div>

        <div className="border-t border-divider pt-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Preferences</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Currency Symbol"
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              hint="e.g., ₹, $, €"
            />
            <Select
              label="Week Starts On"
              options={[
                { value: 'monday', label: 'Monday' },
                { value: 'sunday', label: 'Sunday' },
              ]}
              value={formData.weekStartDay}
              onChange={(e) =>
                setFormData({ ...formData, weekStartDay: e.target.value as WeekStartDay })
              }
            />
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button type="submit" loading={saving}>
            Save Changes
          </Button>
        </div>
      </form>
    </Card>
  );
}

// ============================================
// Categories Settings Component
// ============================================

function CategoriesSettings({
  categories,
  onRefresh,
}: {
  categories: Category[];
  onRefresh: () => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ name: '', color: '#ADEBB3', icon: '📁' });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingItem) {
        await fetch(`/api/categories/${editingItem.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      } else {
        await fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      }
      setShowForm(false);
      setEditingItem(null);
      setFormData({ name: '', color: '#ADEBB3', icon: '📁' });
      onRefresh();
    } catch (error) {
      console.error('Error saving category:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (category: Category) => {
    await fetch(`/api/categories/${category.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !category.isActive }),
    });
    onRefresh();
  };

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-text-primary">Categories</h3>
        <Button size="sm" onClick={() => setShowForm(true)}>
          Add Category
        </Button>
      </div>

      <div className="space-y-2">
        {categories.map((category) => (
          <div
            key={category.id}
            className={`flex items-center justify-between p-3 rounded-xl border ${
              category.isActive ? 'border-divider' : 'border-divider bg-divider/30 opacity-60'
            }`}
          >
            <div className="flex items-center gap-3">
              <span
                className="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
                style={{ backgroundColor: category.color + '30' }}
              >
                {category.icon}
              </span>
              <span className="font-medium text-text-primary">{category.name}</span>
              {!category.isActive && <Badge size="sm">Inactive</Badge>}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setEditingItem(category);
                  setFormData({ name: category.name, color: category.color, icon: category.icon });
                  setShowForm(true);
                }}
                className="p-2 rounded-lg hover:bg-divider text-text-secondary"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                onClick={() => handleToggleActive(category)}
                className="p-2 rounded-lg hover:bg-divider text-text-secondary"
              >
                {category.isActive ? '🔒' : '🔓'}
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingItem(null);
          setFormData({ name: '', color: '#ADEBB3', icon: '📁' });
        }}
        title={editingItem ? 'Edit Category' : 'Add Category'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <Input
            label="Icon (emoji)"
            value={formData.icon}
            onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
          />
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Color</label>
            <input
              type="color"
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              className="w-full h-10 rounded-xl cursor-pointer"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              {editingItem ? 'Save' : 'Add'}
            </Button>
          </div>
        </form>
      </Modal>
    </Card>
  );
}

// ============================================
// Modes Settings Component
// ============================================

function ModesSettings({ modes, onRefresh }: { modes: Mode[]; onRefresh: () => void }) {
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<Mode | null>(null);
  const [formData, setFormData] = useState({ name: '', isCredit: false });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingItem) {
        await fetch(`/api/modes/${editingItem.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      } else {
        await fetch('/api/modes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      }
      setShowForm(false);
      setEditingItem(null);
      setFormData({ name: '', isCredit: false });
      onRefresh();
    } catch (error) {
      console.error('Error saving mode:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (mode: Mode) => {
    await fetch(`/api/modes/${mode.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !mode.isActive }),
    });
    onRefresh();
  };

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-text-primary">Payment Modes</h3>
        <Button size="sm" onClick={() => setShowForm(true)}>
          Add Mode
        </Button>
      </div>

      <div className="space-y-2">
        {modes.map((mode) => (
          <div
            key={mode.id}
            className={`flex items-center justify-between p-3 rounded-xl border ${
              mode.isActive ? 'border-divider' : 'border-divider bg-divider/30 opacity-60'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="font-medium text-text-primary">{mode.name}</span>
              {mode.isCredit && <Badge variant="warning" size="sm">Credit</Badge>}
              {!mode.isActive && <Badge size="sm">Inactive</Badge>}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setEditingItem(mode);
                  setFormData({ name: mode.name, isCredit: mode.isCredit });
                  setShowForm(true);
                }}
                className="p-2 rounded-lg hover:bg-divider text-text-secondary"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                onClick={() => handleToggleActive(mode)}
                className="p-2 rounded-lg hover:bg-divider text-text-secondary"
              >
                {mode.isActive ? '🔒' : '🔓'}
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingItem(null);
          setFormData({ name: '', isCredit: false });
        }}
        title={editingItem ? 'Edit Mode' : 'Add Mode'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isCredit"
              checked={formData.isCredit}
              onChange={(e) => setFormData({ ...formData, isCredit: e.target.checked })}
              className="w-5 h-5 rounded border-divider text-primary"
            />
            <label htmlFor="isCredit" className="text-text-primary">
              This is a credit payment method
            </label>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              {editingItem ? 'Save' : 'Add'}
            </Button>
          </div>
        </form>
      </Modal>
    </Card>
  );
}

// ============================================
// Accounts Settings Component
// ============================================

function AccountsSettings({ accounts, onRefresh }: { accounts: Account[]; onRefresh: () => void }) {
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<Account | null>(null);
  const [formData, setFormData] = useState({ name: '', openingBalance: 0 });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingItem) {
        await fetch(`/api/accounts/${editingItem.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      } else {
        await fetch('/api/accounts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      }
      setShowForm(false);
      setEditingItem(null);
      setFormData({ name: '', openingBalance: 0 });
      onRefresh();
    } catch (error) {
      console.error('Error saving account:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (account: Account) => {
    await fetch(`/api/accounts/${account.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !account.isActive }),
    });
    onRefresh();
  };

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-text-primary">Accounts</h3>
        <Button size="sm" onClick={() => setShowForm(true)}>
          Add Account
        </Button>
      </div>

      <div className="space-y-2">
        {accounts.map((account) => (
          <div
            key={account.id}
            className={`flex items-center justify-between p-3 rounded-xl border ${
              account.isActive ? 'border-divider' : 'border-divider bg-divider/30 opacity-60'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="font-medium text-text-primary">{account.name}</span>
              <span className="text-text-secondary text-sm">
                (Opening: ₹{account.openingBalance.toLocaleString()})
              </span>
              {!account.isActive && <Badge size="sm">Inactive</Badge>}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setEditingItem(account);
                  setFormData({ name: account.name, openingBalance: account.openingBalance });
                  setShowForm(true);
                }}
                className="p-2 rounded-lg hover:bg-divider text-text-secondary"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                onClick={() => handleToggleActive(account)}
                className="p-2 rounded-lg hover:bg-divider text-text-secondary"
              >
                {account.isActive ? '🔒' : '🔓'}
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingItem(null);
          setFormData({ name: '', openingBalance: 0 });
        }}
        title={editingItem ? 'Edit Account' : 'Add Account'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <Input
            label="Opening Balance"
            type="number"
            value={formData.openingBalance}
            onChange={(e) =>
              setFormData({ ...formData, openingBalance: parseFloat(e.target.value) || 0 })
            }
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              {editingItem ? 'Save' : 'Add'}
            </Button>
          </div>
        </form>
      </Modal>
    </Card>
  );
}

// ============================================
// Tags Settings Component
// ============================================

function TagsSettings({ tags, onRefresh }: { tags: Tag[]; onRefresh: () => void }) {
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<Tag | null>(null);
  const [formData, setFormData] = useState({ name: '', color: '#A3D9D3' });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingItem) {
        await fetch(`/api/tags/${editingItem.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      } else {
        await fetch('/api/tags', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      }
      setShowForm(false);
      setEditingItem(null);
      setFormData({ name: '', color: '#A3D9D3' });
      onRefresh();
    } catch (error) {
      console.error('Error saving tag:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (tag: Tag) => {
    await fetch(`/api/tags/${tag.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !tag.isActive }),
    });
    onRefresh();
  };

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-text-primary">Tags</h3>
        <Button size="sm" onClick={() => setShowForm(true)}>
          Add Tag
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <div
            key={tag.id}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${
              tag.isActive ? 'border-divider' : 'border-divider bg-divider/30 opacity-60'
            }`}
          >
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: tag.color }}
            />
            <span className="font-medium text-text-primary">{tag.name}</span>
            <button
              onClick={() => {
                setEditingItem(tag);
                setFormData({ name: tag.name, color: tag.color });
                setShowForm(true);
              }}
              className="p-1 rounded hover:bg-divider text-text-secondary"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={() => handleToggleActive(tag)}
              className="p-1 rounded hover:bg-divider text-text-secondary text-xs"
            >
              {tag.isActive ? '×' : '+'}
            </button>
          </div>
        ))}
      </div>

      <Modal
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingItem(null);
          setFormData({ name: '', color: '#A3D9D3' });
        }}
        title={editingItem ? 'Edit Tag' : 'Add Tag'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Color</label>
            <input
              type="color"
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              className="w-full h-10 rounded-xl cursor-pointer"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              {editingItem ? 'Save' : 'Add'}
            </Button>
          </div>
        </form>
      </Modal>
    </Card>
  );
}

// ============================================
// Templates Settings Component
// ============================================

function TemplatesSettings({
  templates,
  categories,
  modes,
  accounts,
  onRefresh,
}: {
  templates: Template[];
  categories: Category[];
  modes: Mode[];
  accounts: Account[];
  onRefresh: () => void;
}) {
  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-text-primary">Templates</h3>
        <Button size="sm" disabled>
          Add Template
        </Button>
      </div>

      <p className="text-text-secondary text-center py-8">
        Templates feature coming soon. Templates will allow you to quickly add common expenses.
      </p>
    </Card>
  );
}

// ============================================
// Preferences Settings Component
// ============================================

function PreferencesSettings({
  settings,
  onSave,
  saving,
}: {
  settings: Settings;
  onSave: (updates: Partial<Settings>) => Promise<void>;
  saving: boolean;
}) {
  const [localSettings, setLocalSettings] = useState(settings);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleSave = () => {
    onSave({
      enableMoodTracking: localSettings.enableMoodTracking,
      enableRegretTracking: localSettings.enableRegretTracking,
    });
  };

  return (
    <Card>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-text-primary">Gen-Z Features</h3>
          <p className="text-sm text-text-secondary mt-1">Enable or disable mood and regret tracking</p>
        </div>
        <Button onClick={handleSave} loading={saving}>
          Save Changes
        </Button>
      </div>

      <div className="space-y-6">
        {/* Mood Tracking */}
        <div className="flex items-center justify-between p-4 bg-background rounded-xl">
          <div className="flex items-center gap-3">
            <span className="text-2xl">😊</span>
            <div>
              <h4 className="font-medium text-text-primary">Mood Tracking</h4>
              <p className="text-sm text-text-secondary">Track how you feel about each expense</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={localSettings.enableMoodTracking}
              onChange={(e) =>
                setLocalSettings({ ...localSettings, enableMoodTracking: e.target.checked })
              }
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>

        {/* Regret Tracking */}
        <div className="flex items-center justify-between p-4 bg-background rounded-xl">
          <div className="flex items-center gap-3">
            <span className="text-2xl">😬</span>
            <div>
              <h4 className="font-medium text-text-primary">Regret Tracking</h4>
              <p className="text-sm text-text-secondary">Mark purchases you regret</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={localSettings.enableRegretTracking}
              onChange={(e) =>
                setLocalSettings({ ...localSettings, enableRegretTracking: e.target.checked })
              }
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>
      </div>
    </Card>
  );
}

// ============================================
// Credit Cards Settings Component
// ============================================

function CreditCardsSettings({ onRefresh }: { onRefresh: () => void }) {
  const [creditCards, setCreditCards] = useState<any[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCreditCards();
  }, []);

  const fetchCreditCards = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/credit-cards?includeInactive=true');
      const data = await res.json();
      if (data.success) {
        setCreditCards(data.data);
      }
    } catch (error) {
      console.error('Error fetching credit cards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this credit card?')) {
      try {
        const res = await fetch(`/api/credit-cards/${id}`, { method: 'DELETE' });
        if (res.ok) {
          fetchCreditCards();
          onRefresh();
        }
      } catch (error) {
        console.error('Error deleting credit card:', error);
      }
    }
  };

  return (
    <Card>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-text-primary">Credit Cards</h3>
          <p className="text-sm text-text-secondary mt-1">Manage your credit cards and billing cycles</p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)}>
          Add Credit Card
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <span className="loading-spinner" />
        </div>
      ) : creditCards.length === 0 ? (
        <div className="empty-state">
          <span className="text-6xl mb-4">💳</span>
          <p className="font-medium">No credit cards yet</p>
          <p className="text-sm mt-2">Add a credit card to track statements and billing cycles</p>
        </div>
      ) : (
        <div className="space-y-3">
          {creditCards.map((card) => (
            <div
              key={card.id}
              className={`p-4 border-2 rounded-xl transition-all ${
                card.isActive ? 'border-primary/30 bg-primary/5' : 'border-divider bg-background opacity-60'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">💳</span>
                  <div>
                    <h4 className="font-medium text-text-primary">{card.name}</h4>
                    <p className="text-sm text-text-secondary">
                      Closing: Day {card.closingDay} • Due: Day {card.dueDay}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!card.isActive && <Badge variant="default">Inactive</Badge>}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingCard(card)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(card.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {(isAddModalOpen || editingCard) && (
        <CreditCardModal
          card={editingCard}
          onClose={() => {
            setIsAddModalOpen(false);
            setEditingCard(null);
          }}
          onSuccess={() => {
            fetchCreditCards();
            onRefresh();
            setIsAddModalOpen(false);
            setEditingCard(null);
          }}
        />
      )}
    </Card>
  );
}

// ============================================
// Credit Card Modal Component
// ============================================

function CreditCardModal({
  card,
  onClose,
  onSuccess,
}: {
  card: any | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    name: card?.name || '',
    closingDay: card?.closingDay || 1,
    dueDay: card?.dueDay || 15,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Card name is required');
      return;
    }

    setSaving(true);
    try {
      const res = card
        ? await fetch(`/api/credit-cards/${card.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
          })
        : await fetch('/api/credit-cards', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
          });

      const data = await res.json();
      if (data.success) {
        onSuccess();
      } else {
        setError(data.error || 'Failed to save credit card');
      }
    } catch (err) {
      setError('Failed to save credit card');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen onClose={onClose} title={card ? 'Edit Credit Card' : 'Add Credit Card'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="error-banner">{error}</div>}

        <Input
          label="Card Name"
          placeholder="e.g., Visa Platinum"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Closing Day"
            type="number"
            min="1"
            max="31"
            value={formData.closingDay}
            onChange={(e) => setFormData({ ...formData, closingDay: parseInt(e.target.value) })}
            required
          />
          <Input
            label="Due Day"
            type="number"
            min="1"
            max="31"
            value={formData.dueDay}
            onChange={(e) => setFormData({ ...formData, dueDay: parseInt(e.target.value) })}
            required
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-divider">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={saving}>
            {card ? 'Save Changes' : 'Add Card'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

// ============================================
// Data Safety Settings Component
// ============================================

function DataSafetySettings({ settings }: { settings: Settings }) {
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [showImportConfirm, setShowImportConfirm] = useState(false);
  const [backupInfo, setBackupInfo] = useState<{ shouldShow: boolean; lastBackupDate: string | null } | null>(null);

  useEffect(() => {
    fetchBackupInfo();
  }, []);

  const fetchBackupInfo = async () => {
    try {
      const res = await fetch('/api/data/backup-reminder');
      const data = await res.json();
      setBackupInfo(data);
    } catch (error) {
      console.error('Error fetching backup info:', error);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await fetch('/api/data/export');
      const data = await res.json();

      // Download as JSON file
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `badger-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Update last backup date
      await fetch('/api/data/backup-reminder', { method: 'POST' });
      await fetchBackupInfo();
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export data');
    } finally {
      setExporting(false);
    }
  };

  const handleImportClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        setImportFile(file);
        setShowImportConfirm(true);
      }
    };
    input.click();
  };

  const handleImportConfirm = async () => {
    if (!importFile) return;

    setImporting(true);
    setShowImportConfirm(false);

    try {
      const text = await importFile.text();
      const data = JSON.parse(text);

      const res = await fetch('/api/data/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Import failed');
      }

      alert('Data imported successfully! Reloading page...');
      window.location.reload();
    } catch (error) {
      console.error('Import error:', error);
      alert('Failed to import data: ' + (error as Error).message);
    } finally {
      setImporting(false);
      setImportFile(null);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Never';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="text-xl font-semibold mb-4">Data Safety</h2>
        <p className="text-text-secondary mb-6">
          Keep your financial data safe with regular backups. Export your data as JSON and import it later to restore.
        </p>

        {backupInfo && backupInfo.shouldShow && (
          <div className="mb-6 p-4 bg-accent/10 border border-accent rounded-xl">
            <p className="text-sm text-text-secondary">
              ⚠️ Reminder: It's been over 30 days since your last backup. Consider exporting your data.
            </p>
          </div>
        )}

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-background rounded-xl">
            <div>
              <h3 className="font-medium">Last Backup</h3>
              <p className="text-sm text-text-secondary">
                {formatDate(backupInfo?.lastBackupDate || null)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button
              onClick={handleExport}
              loading={exporting}
              variant="primary"
              className="w-full"
            >
              Export Data
            </Button>
            <Button
              onClick={handleImportClick}
              loading={importing}
              variant="secondary"
              className="w-full"
            >
              Import Data
            </Button>
          </div>

          <div className="p-4 bg-background rounded-xl text-sm text-text-secondary space-y-2">
            <p><strong>Export:</strong> Downloads all your data as a JSON file.</p>
            <p><strong>Import:</strong> Replaces all current data with data from a JSON file.</p>
            <p className="text-xs">⚠️ Warning: Importing will overwrite all existing data. Make sure to export current data first!</p>
          </div>
        </div>
      </Card>

      <ConfirmDialog
        isOpen={showImportConfirm}
        onClose={() => {
          setShowImportConfirm(false);
          setImportFile(null);
        }}
        onConfirm={handleImportConfirm}
        title="Import Data"
        message="This will replace ALL existing data with the imported data. Are you sure you want to continue?"
        confirmText="Import"
        cancelText="Cancel"
      />
    </div>
  );
}
