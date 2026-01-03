// ============================================
// BADGER - Data Management Operations
// ============================================

import db from '../db';
import { v4 as uuidv4 } from 'uuid';
import type {
  AppExport,
  Settings,
  Account,
  Category,
  Mode,
  Tag,
  Template,
  CreditCard,
  Entry,
  Expense,
  CreditCardStatement,
  Income,
  Streaks,
  MonthClose,
  MonthlyReflection
} from '@/types';

const APP_VERSION = '1.0.0';
const SCHEMA_VERSION = '4';

// Export all app data as JSON
export function exportData(): AppExport {
  const settings = db.prepare('SELECT * FROM settings WHERE id = ?').get('default') as Settings;
  const accounts = db.prepare('SELECT * FROM accounts ORDER BY "order"').all() as Account[];
  const categories = db.prepare('SELECT * FROM categories ORDER BY "order"').all() as Category[];
  const modes = db.prepare('SELECT * FROM modes ORDER BY "order"').all() as Mode[];
  const tags = db.prepare('SELECT * FROM tags ORDER BY name').all() as Tag[];
  const templates = db.prepare('SELECT * FROM templates ORDER BY name').all() as Template[];
  const creditCards = db.prepare('SELECT * FROM credit_cards ORDER BY "order"').all() as CreditCard[];
  const entries = db.prepare('SELECT * FROM entries ORDER BY createdAt').all() as Entry[];
  const expenses = db.prepare('SELECT * FROM expenses ORDER BY date').all() as Expense[];
  const creditCardStatements = db.prepare('SELECT * FROM credit_card_statements ORDER BY periodStart').all() as CreditCardStatement[];
  const incomes = db.prepare('SELECT * FROM incomes ORDER BY date').all() as Income[];
  const streaks = db.prepare('SELECT * FROM streaks WHERE id = ?').get('default') as Streaks;
  const monthClose = db.prepare('SELECT * FROM month_close ORDER BY year, month').all() as MonthClose[];
  const monthlyReflection = db.prepare('SELECT * FROM monthly_reflection ORDER BY year, month').all() as MonthlyReflection[];

  return {
    version: APP_VERSION,
    exportDate: new Date().toISOString(),
    data: {
      settings,
      accounts,
      categories,
      modes,
      tags,
      templates,
      creditCards,
      entries,
      expenses,
      creditCardStatements,
      incomes,
      streaks,
      monthClose,
      monthlyReflection,
    },
  };
}

// Import data from JSON export
export function importData(importData: AppExport): { success: boolean; error?: string } {
  try {
    // Validate schema version
    if (!importData.version || !importData.data) {
      return { success: false, error: 'Invalid import file format' };
    }

    // Start transaction
    const transaction = db.transaction(() => {
      // Clear existing data (except settings schema fields)
      db.prepare('DELETE FROM entries').run();
      db.prepare('DELETE FROM expenses').run();
      db.prepare('DELETE FROM credit_card_statements').run();
      db.prepare('DELETE FROM incomes').run();
      db.prepare('DELETE FROM credit_cards').run();
      db.prepare('DELETE FROM templates').run();
      db.prepare('DELETE FROM tags').run();
      db.prepare('DELETE FROM modes').run();
      db.prepare('DELETE FROM categories').run();
      db.prepare('DELETE FROM accounts').run();
      db.prepare('DELETE FROM month_close').run();
      db.prepare('DELETE FROM monthly_reflection').run();

      // Import settings (update existing)
      if (importData.data.settings) {
        const s = importData.data.settings;
        db.prepare(`
          UPDATE settings SET
            monthlySpendLimit = ?,
            monthlyUnnecessaryLimit = ?,
            monthlyCreditLimit = ?,
            stupidSpendThreshold = ?,
            currency = ?,
            weekStartDay = ?,
            enableMoodTracking = ?,
            enableRegretTracking = ?,
            lastBackupDate = ?,
            updatedAt = datetime('now')
          WHERE id = 'default'
        `).run(
          s.monthlySpendLimit,
          s.monthlyUnnecessaryLimit,
          s.monthlyCreditLimit,
          s.stupidSpendThreshold,
          s.currency,
          s.weekStartDay,
          s.enableMoodTracking ? 1 : 0,
          s.enableRegretTracking ? 1 : 0,
          s.lastBackupDate
        );
      }

      // Import streaks (update existing)
      if (importData.data.streaks) {
        const s = importData.data.streaks;
        db.prepare(`
          UPDATE streaks SET
            currentLogStreak = ?,
            longestLogStreak = ?,
            lastLogDate = ?,
            currentUnnecessaryStreak = ?,
            longestUnnecessaryStreak = ?,
            lastUnnecessaryStreakDate = ?,
            updatedAt = datetime('now')
          WHERE id = 'default'
        `).run(
          s.currentLogStreak,
          s.longestLogStreak,
          s.lastLogDate,
          s.currentUnnecessaryStreak,
          s.longestUnnecessaryStreak,
          s.lastUnnecessaryStreakDate
        );
      }

      // Import accounts
      const accountStmt = db.prepare(`
        INSERT INTO accounts (id, name, openingBalance, isActive, "order", createdAt)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      importData.data.accounts?.forEach((a: any) => {
        accountStmt.run(a.id, a.name, a.openingBalance, a.isActive, a.order, a.createdAt);
      });

      // Import categories
      const categoryStmt = db.prepare(`
        INSERT INTO categories (id, name, isActive, "order", createdAt)
        VALUES (?, ?, ?, ?, ?)
      `);
      importData.data.categories?.forEach((c: any) => {
        categoryStmt.run(c.id, c.name, c.isActive, c.order, c.createdAt);
      });

      // Import modes
      const modeStmt = db.prepare(`
        INSERT INTO modes (id, name, isCredit, creditCardId, isActive, "order", createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      importData.data.modes?.forEach((m: any) => {
        modeStmt.run(m.id, m.name, m.isCredit, m.creditCardId, m.isActive, m.order, m.createdAt);
      });

      // Import tags
      const tagStmt = db.prepare(`
        INSERT INTO tags (id, name, createdAt)
        VALUES (?, ?, ?)
      `);
      importData.data.tags?.forEach((t: any) => {
        tagStmt.run(t.id, t.name, t.createdAt);
      });

      // Import templates
      const templateStmt = db.prepare(`
        INSERT INTO templates (id, name, modeId, categoryId, necessity, accountId, tags, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      importData.data.templates?.forEach((t: any) => {
        templateStmt.run(t.id, t.name, t.modeId, t.categoryId, t.necessity, t.accountId, t.tags, t.createdAt);
      });

      // Import credit cards
      const creditCardStmt = db.prepare(`
        INSERT INTO credit_cards (id, name, closingDay, dueDay, isActive, "order", createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      importData.data.creditCards?.forEach((c: any) => {
        creditCardStmt.run(c.id, c.name, c.closingDay, c.dueDay, c.isActive, c.order, c.createdAt);
      });

      // Import expenses
      const expenseStmt = db.prepare(`
        INSERT INTO expenses (id, date, createdAt)
        VALUES (?, ?, ?)
      `);
      importData.data.expenses?.forEach((e: any) => {
        expenseStmt.run(e.id, e.date, e.createdAt);
      });

      // Import credit card statements
      const statementStmt = db.prepare(`
        INSERT INTO credit_card_statements (id, creditCardId, periodStart, periodEnd, totalAmount, paid, paidDate, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      importData.data.creditCardStatements?.forEach((s: any) => {
        statementStmt.run(s.id, s.creditCardId, s.periodStart, s.periodEnd, s.totalAmount || 0, s.paid, s.paidDate, s.createdAt);
      });

      // Import entries
      const entryStmt = db.prepare(`
        INSERT INTO entries (
          id, expenseId, name, amount, modeId, categoryId, necessity, status,
          expectedClosure, accountId, tags, type, mood, regret, creditCardStatementId, createdAt
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      importData.data.entries?.forEach((e: any) => {
        entryStmt.run(
          e.id, e.expenseId, e.name, e.amount, e.modeId, e.categoryId, e.necessity, e.status,
          e.expectedClosure, e.accountId, e.tags, e.type || 'expense', e.mood, e.regret ? 1 : 0, e.creditCardStatementId, e.createdAt
        );
      });

      // Import incomes
      const incomeStmt = db.prepare(`
        INSERT INTO incomes (id, date, source, amount, accountId, createdAt)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      importData.data.incomes?.forEach((i: any) => {
        incomeStmt.run(i.id, i.date, i.source, i.amount, i.accountId, i.createdAt);
      });

      // Import month close
      const monthCloseStmt = db.prepare(`
        INSERT INTO month_close (id, month, year, isClosed, closedAt, closedBy, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      importData.data.monthClose?.forEach((m: any) => {
        monthCloseStmt.run(m.id, m.month, m.year, m.isClosed, m.closedAt, m.closedBy, m.createdAt);
      });

      // Import monthly reflection
      const reflectionStmt = db.prepare(`
        INSERT INTO monthly_reflection (id, month, year, reflection, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      importData.data.monthlyReflection?.forEach((r: any) => {
        reflectionStmt.run(r.id, r.month, r.year, r.reflection, r.createdAt, r.updatedAt);
      });
    });

    // Execute transaction
    transaction();

    return { success: true };
  } catch (error) {
    console.error('Import error:', error);
    return { success: false, error: 'Failed to import data: ' + (error as Error).message };
  }
}

// Update last backup date
export function updateLastBackupDate(): void {
  db.prepare(`
    UPDATE settings
    SET lastBackupDate = datetime('now'),
        updatedAt = datetime('now')
    WHERE id = 'default'
  `).run();
}

// Get last backup date
export function getLastBackupDate(): string | null {
  const result = db.prepare('SELECT lastBackupDate FROM settings WHERE id = ?').get('default') as any;
  return result?.lastBackupDate || null;
}

// Check if backup reminder is needed (monthly)
export function shouldShowBackupReminder(): boolean {
  const lastBackup = getLastBackupDate();
  if (!lastBackup) return true;

  const lastBackupDate = new Date(lastBackup);
  const now = new Date();
  const daysSinceBackup = Math.floor((now.getTime() - lastBackupDate.getTime()) / (1000 * 60 * 60 * 24));

  return daysSinceBackup >= 30; // Show reminder monthly
}
