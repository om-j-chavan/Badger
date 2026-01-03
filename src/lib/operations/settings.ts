// ============================================
// BADGER - Settings Operations
// ============================================

import db from '../db';
import type { Settings, WeekStartDay, AppMode, Theme, Language } from '@/types';

// Get settings (singleton)
export function getSettings(): Settings {
  const row = db.prepare('SELECT * FROM settings WHERE id = ?').get('default') as any;

  if (!row) {
    // Create default settings if not exists
    db.prepare(`
      INSERT INTO settings (id, monthlySpendLimit, monthlyUnnecessaryLimit, monthlyCreditLimit, stupidSpendThreshold, currency, weekStartDay)
      VALUES (?, 50000, 10000, 20000, 2000, '₹', 'monday')
    `).run('default');

    return getSettings();
  }

  return {
    id: row.id,
    monthlySpendLimit: row.monthlySpendLimit,
    monthlyUnnecessaryLimit: row.monthlyUnnecessaryLimit,
    monthlyCreditLimit: row.monthlyCreditLimit,
    stupidSpendThreshold: row.stupidSpendThreshold,
    currency: row.currency,
    weekStartDay: row.weekStartDay as WeekStartDay,
    enableMoodTracking: Boolean(row.enableMoodTracking),
    enableRegretTracking: Boolean(row.enableRegretTracking),
    lastBackupDate: row.lastBackupDate || null,
    appMode: (row.appMode || 'advanced') as AppMode,
    theme: (row.theme || 'light') as Theme,
    language: (row.language || 'en') as Language,
    enableImpulseTimer: row.enableImpulseTimer !== undefined ? Boolean(row.enableImpulseTimer) : true,
    enableAutoBackupReminder: row.enableAutoBackupReminder !== undefined ? Boolean(row.enableAutoBackupReminder) : true,
    updatedAt: row.updatedAt,
  };
}

// Update settings
export function updateSettings(
  data: Partial<{
    monthlySpendLimit: number;
    monthlyUnnecessaryLimit: number;
    monthlyCreditLimit: number;
    stupidSpendThreshold: number;
    currency: string;
    weekStartDay: WeekStartDay;
    enableMoodTracking: boolean;
    enableRegretTracking: boolean;
    appMode: AppMode;
    theme: Theme;
    language: Language;
    enableImpulseTimer: boolean;
    enableAutoBackupReminder: boolean;
  }>
): Settings {
  const updates: string[] = [];
  const values: any[] = [];

  if (data.monthlySpendLimit !== undefined) {
    updates.push('monthlySpendLimit = ?');
    values.push(data.monthlySpendLimit);
  }
  if (data.monthlyUnnecessaryLimit !== undefined) {
    updates.push('monthlyUnnecessaryLimit = ?');
    values.push(data.monthlyUnnecessaryLimit);
  }
  if (data.monthlyCreditLimit !== undefined) {
    updates.push('monthlyCreditLimit = ?');
    values.push(data.monthlyCreditLimit);
  }
  if (data.stupidSpendThreshold !== undefined) {
    updates.push('stupidSpendThreshold = ?');
    values.push(data.stupidSpendThreshold);
  }
  if (data.currency !== undefined) {
    updates.push('currency = ?');
    values.push(data.currency);
  }
  if (data.weekStartDay !== undefined) {
    updates.push('weekStartDay = ?');
    values.push(data.weekStartDay);
  }
  if (data.enableMoodTracking !== undefined) {
    updates.push('enableMoodTracking = ?');
    values.push(data.enableMoodTracking ? 1 : 0);
  }
  if (data.enableRegretTracking !== undefined) {
    updates.push('enableRegretTracking = ?');
    values.push(data.enableRegretTracking ? 1 : 0);
  }
  if (data.appMode !== undefined) {
    updates.push('appMode = ?');
    values.push(data.appMode);
  }
  if (data.theme !== undefined) {
    updates.push('theme = ?');
    values.push(data.theme);
  }
  if (data.language !== undefined) {
    updates.push('language = ?');
    values.push(data.language);
  }
  if (data.enableImpulseTimer !== undefined) {
    updates.push('enableImpulseTimer = ?');
    values.push(data.enableImpulseTimer ? 1 : 0);
  }
  if (data.enableAutoBackupReminder !== undefined) {
    updates.push('enableAutoBackupReminder = ?');
    values.push(data.enableAutoBackupReminder ? 1 : 0);
  }

  if (updates.length > 0) {
    updates.push("updatedAt = datetime('now')");
    values.push('default');
    db.prepare(`UPDATE settings SET ${updates.join(', ')} WHERE id = ?`).run(
      ...values
    );
  }

  return getSettings();
}
