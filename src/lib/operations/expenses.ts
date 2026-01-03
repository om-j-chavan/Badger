// ============================================
// BADGER - Expense & Entry Operations
// ============================================

import db from '../db';
import { v4 as uuidv4 } from 'uuid';
import type {
  Expense,
  ExpenseWithEntries,
  Entry,
  EntryWithRelations,
  EntryFormData,
  Necessity,
  EntryStatus,
} from '@/types';
import { getCategoryById } from './categories';
import { getModeById } from './modes';
import { getAccountById } from './accounts';
import { getTagsByIds } from './tags';

// ============================================
// Expense Operations
// ============================================

// Get or create expense for a date
export function getOrCreateExpense(date: string): Expense {
  // Try to find existing expense
  const existing = db
    .prepare('SELECT * FROM expenses WHERE date = ?')
    .get(date) as any;

  if (existing) {
    return {
      id: existing.id,
      date: existing.date,
      createdAt: existing.createdAt,
    };
  }

  // Create new expense
  const id = uuidv4();
  db.prepare('INSERT INTO expenses (id, date) VALUES (?, ?)').run(id, date);

  return {
    id,
    date,
    createdAt: new Date().toISOString(),
  };
}

// Get expense by date
export function getExpenseByDate(date: string): Expense | null {
  const row = db
    .prepare('SELECT * FROM expenses WHERE date = ?')
    .get(date) as any;

  if (!row) return null;

  return {
    id: row.id,
    date: row.date,
    createdAt: row.createdAt,
  };
}

// Get expense with entries
export function getExpenseWithEntries(date: string): ExpenseWithEntries | null {
  const expense = getExpenseByDate(date);
  if (!expense) return null;

  const entries = getEntriesByExpenseId(expense.id);

  const totalAmount = entries.reduce((sum, e) => sum + e.amount, 0);
  const unnecessaryAmount = entries
    .filter((e) => e.necessity === 'unnecessary')
    .reduce((sum, e) => sum + e.amount, 0);
  const openAmount = entries
    .filter((e) => e.status === 'open')
    .reduce((sum, e) => sum + e.amount, 0);

  return {
    ...expense,
    entries,
    totalAmount,
    unnecessaryAmount,
    openAmount,
  };
}

// Get expenses for a month
export function getExpensesForMonth(
  year: number,
  month: number
): ExpenseWithEntries[] {
  const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
  const endMonth = month === 11 ? 0 : month + 1;
  const endYear = month === 11 ? year + 1 : year;
  const endDate = `${endYear}-${String(endMonth + 1).padStart(2, '0')}-01`;

  const rows = db
    .prepare('SELECT * FROM expenses WHERE date >= ? AND date < ? ORDER BY date ASC')
    .all(startDate, endDate) as any[];

  return rows.map((row) => {
    const entries = getEntriesByExpenseId(row.id);
    const totalAmount = entries.reduce((sum, e) => sum + e.amount, 0);
    const unnecessaryAmount = entries
      .filter((e) => e.necessity === 'unnecessary')
      .reduce((sum, e) => sum + e.amount, 0);
    const openAmount = entries
      .filter((e) => e.status === 'open')
      .reduce((sum, e) => sum + e.amount, 0);

    return {
      id: row.id,
      date: row.date,
      createdAt: row.createdAt,
      entries,
      totalAmount,
      unnecessaryAmount,
      openAmount,
    };
  });
}

// ============================================
// Entry Operations
// ============================================

// Map database row to Entry
function mapRowToEntry(row: any): Entry {
  return {
    id: row.id,
    expenseId: row.expenseId,
    name: row.name,
    amount: row.amount,
    modeId: row.modeId,
    categoryId: row.categoryId,
    necessity: row.necessity as Necessity,
    status: row.status as EntryStatus,
    expectedClosure: row.expectedClosure,
    accountId: row.accountId,
    tags: JSON.parse(row.tags || '[]'),
    type: row.type || 'expense',
    mood: row.mood || null,
    regret: Boolean(row.regret),
    creditCardStatementId: row.creditCardStatementId || null,
    createdAt: row.createdAt,
  };
}

// Get entries by expense ID
export function getEntriesByExpenseId(expenseId: string): EntryWithRelations[] {
  const rows = db
    .prepare('SELECT * FROM entries WHERE expenseId = ? ORDER BY createdAt DESC')
    .all(expenseId) as any[];

  return rows.map((row) => {
    const entry = mapRowToEntry(row);
    return {
      ...entry,
      mode: getModeById(entry.modeId) || undefined,
      category: getCategoryById(entry.categoryId) || undefined,
      account: getAccountById(entry.accountId) || undefined,
      tagObjects: getTagsByIds(entry.tags),
    };
  });
}

// Get entry by ID
export function getEntryById(id: string): EntryWithRelations | null {
  const row = db.prepare('SELECT * FROM entries WHERE id = ?').get(id) as any;

  if (!row) return null;

  const entry = mapRowToEntry(row);
  return {
    ...entry,
    mode: getModeById(entry.modeId) || undefined,
    category: getCategoryById(entry.categoryId) || undefined,
    account: getAccountById(entry.accountId) || undefined,
    tagObjects: getTagsByIds(entry.tags),
  };
}

// Create entry
export function createEntry(
  date: string,
  data: EntryFormData
): EntryWithRelations {
  const expense = getOrCreateExpense(date);
  const id = uuidv4();

  // Get mode to check if it's a credit card
  const mode = getModeById(data.modeId);

  // Auto-assign credit entries to statements
  let creditCardStatementId = data.creditCardStatementId || null;
  let status = data.status;

  if (mode?.isCredit && mode.creditCardId) {
    const { getOrCreateCurrentStatement } = require('./creditCards');
    const statement = getOrCreateCurrentStatement(mode.creditCardId, date);
    creditCardStatementId = statement.id;
    status = 'open'; // Force credit entries to open
  }

  db.prepare(`
    INSERT INTO entries (
      id, expenseId, name, amount, modeId, categoryId, necessity, status,
      expectedClosure, accountId, tags, type, mood, regret, creditCardStatementId
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    expense.id,
    data.name,
    data.amount,
    data.modeId,
    data.categoryId,
    data.necessity,
    status,
    data.expectedClosure,
    data.accountId,
    JSON.stringify(data.tags),
    data.type || 'expense',
    data.mood || null,
    data.regret ? 1 : 0,
    creditCardStatementId
  );

  return getEntryById(id)!;
}

// Update entry
export function updateEntry(
  id: string,
  data: Partial<EntryFormData>
): EntryWithRelations | null {
  const existing = getEntryById(id);
  if (!existing) return null;

  // Prevent manual closure of credit entries
  const mode = getModeById(existing.modeId);
  if (mode?.isCredit && data.status === 'closed') {
    throw new Error('Credit card entries cannot be manually closed. Pay the statement instead.');
  }

  const updates: string[] = [];
  const values: any[] = [];

  if (data.name !== undefined) {
    updates.push('name = ?');
    values.push(data.name);
  }
  if (data.amount !== undefined) {
    updates.push('amount = ?');
    values.push(data.amount);
  }
  if (data.modeId !== undefined) {
    updates.push('modeId = ?');
    values.push(data.modeId);
  }
  if (data.categoryId !== undefined) {
    updates.push('categoryId = ?');
    values.push(data.categoryId);
  }
  if (data.necessity !== undefined) {
    updates.push('necessity = ?');
    values.push(data.necessity);
  }
  if (data.status !== undefined) {
    updates.push('status = ?');
    values.push(data.status);
  }
  if (data.expectedClosure !== undefined) {
    updates.push('expectedClosure = ?');
    values.push(data.expectedClosure);
  }
  if (data.accountId !== undefined) {
    updates.push('accountId = ?');
    values.push(data.accountId);
  }
  if (data.tags !== undefined) {
    updates.push('tags = ?');
    values.push(JSON.stringify(data.tags));
  }
  if (data.type !== undefined) {
    updates.push('type = ?');
    values.push(data.type);
  }
  if (data.mood !== undefined) {
    updates.push('mood = ?');
    values.push(data.mood);
  }
  if (data.regret !== undefined) {
    updates.push('regret = ?');
    values.push(data.regret ? 1 : 0);
  }

  if (updates.length > 0) {
    values.push(id);
    db.prepare(`UPDATE entries SET ${updates.join(', ')} WHERE id = ?`).run(
      ...values
    );
  }

  return getEntryById(id);
}

// Delete entry
export function deleteEntry(id: string): boolean {
  const result = db.prepare('DELETE FROM entries WHERE id = ?').run(id);
  return result.changes > 0;
}

// Duplicate entry (copies all fields except id and createdAt)
export function duplicateEntry(id: string): EntryWithRelations | null {
  const existing = getEntryById(id);
  if (!existing) return null;

  const newId = uuidv4();

  db.prepare(`
    INSERT INTO entries (
      id, expenseId, name, amount, modeId, categoryId, necessity, status,
      expectedClosure, accountId, tags, type, mood, regret, creditCardStatementId
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    newId,
    existing.expenseId,
    existing.name,
    existing.amount,
    existing.modeId,
    existing.categoryId,
    existing.necessity,
    existing.status,
    existing.expectedClosure,
    existing.accountId,
    JSON.stringify(existing.tags),
    existing.type,
    existing.mood,
    existing.regret ? 1 : 0,
    existing.creditCardStatementId
  );

  return getEntryById(newId);
}

// Get all open entries (liabilities)
export function getOpenEntries(): EntryWithRelations[] {
  const rows = db
    .prepare(`
      SELECT e.*, exp.date as expenseDate
      FROM entries e
      JOIN expenses exp ON e.expenseId = exp.id
      WHERE e.status = 'open'
      ORDER BY exp.date DESC, e.createdAt DESC
    `)
    .all() as any[];

  return rows.map((row) => {
    const entry = mapRowToEntry(row);
    return {
      ...entry,
      mode: getModeById(entry.modeId) || undefined,
      category: getCategoryById(entry.categoryId) || undefined,
      account: getAccountById(entry.accountId) || undefined,
      tagObjects: getTagsByIds(entry.tags),
    };
  });
}

// Get entries by category for analytics
export function getEntriesByCategory(
  startDate: string,
  endDate: string
): { categoryId: string; total: number }[] {
  const rows = db
    .prepare(`
      SELECT e.categoryId, SUM(e.amount) as total
      FROM entries e
      JOIN expenses exp ON e.expenseId = exp.id
      WHERE exp.date >= ? AND exp.date <= ? AND e.type = 'expense'
      GROUP BY e.categoryId
    `)
    .all(startDate, endDate) as any[];

  return rows.map((row) => ({
    categoryId: row.categoryId,
    total: row.total,
  }));
}

// Get monthly totals
export function getMonthlyTotals(
  year: number,
  month: number
): { total: number; unnecessary: number; open: number } {
  const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
  const endMonth = month === 11 ? 0 : month + 1;
  const endYear = month === 11 ? year + 1 : year;
  const endDate = `${endYear}-${String(endMonth + 1).padStart(2, '0')}-01`;

  const result = db
    .prepare(`
      SELECT
        COALESCE(SUM(e.amount), 0) as total,
        COALESCE(SUM(CASE WHEN e.necessity = 'unnecessary' THEN e.amount ELSE 0 END), 0) as unnecessary,
        COALESCE(SUM(CASE WHEN e.status = 'open' THEN e.amount ELSE 0 END), 0) as open
      FROM entries e
      JOIN expenses exp ON e.expenseId = exp.id
      WHERE exp.date >= ? AND exp.date < ? AND e.type = 'expense'
    `)
    .get(startDate, endDate) as any;

  return {
    total: result.total,
    unnecessary: result.unnecessary,
    open: result.open,
  };
}

// Get credit totals (open entries paid by credit)
export function getCreditTotals(year: number, month: number): number {
  const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
  const endMonth = month === 11 ? 0 : month + 1;
  const endYear = month === 11 ? year + 1 : year;
  const endDate = `${endYear}-${String(endMonth + 1).padStart(2, '0')}-01`;

  const result = db
    .prepare(`
      SELECT COALESCE(SUM(e.amount), 0) as total
      FROM entries e
      JOIN expenses exp ON e.expenseId = exp.id
      JOIN modes m ON e.modeId = m.id
      WHERE exp.date >= ? AND exp.date < ? AND e.status = 'open' AND m.isCredit = 1
    `)
    .get(startDate, endDate) as any;

  return result.total;
}
