// ============================================
// BADGER - Income Operations
// ============================================

import db from '../db';
import { v4 as uuidv4 } from 'uuid';
import type { Income, IncomeWithRelations, IncomeFormData } from '@/types';
import { getAccountById } from './accounts';

// Get all income records
export function getAllIncome(): IncomeWithRelations[] {
  const rows = db
    .prepare('SELECT * FROM income ORDER BY date DESC, createdAt DESC')
    .all() as any[];

  return rows.map((row) => ({
    id: row.id,
    date: row.date,
    source: row.source,
    amount: row.amount,
    accountId: row.accountId,
    createdAt: row.createdAt,
    account: getAccountById(row.accountId) || undefined,
  }));
}

// Get income by ID
export function getIncomeById(id: string): IncomeWithRelations | null {
  const row = db.prepare('SELECT * FROM income WHERE id = ?').get(id) as any;

  if (!row) return null;

  return {
    id: row.id,
    date: row.date,
    source: row.source,
    amount: row.amount,
    accountId: row.accountId,
    createdAt: row.createdAt,
    account: getAccountById(row.accountId) || undefined,
  };
}

// Get income for a month
export function getIncomeForMonth(
  year: number,
  month: number
): IncomeWithRelations[] {
  const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
  const endMonth = month === 11 ? 0 : month + 1;
  const endYear = month === 11 ? year + 1 : year;
  const endDate = `${endYear}-${String(endMonth + 1).padStart(2, '0')}-01`;

  const rows = db
    .prepare(
      'SELECT * FROM income WHERE date >= ? AND date < ? ORDER BY date DESC'
    )
    .all(startDate, endDate) as any[];

  return rows.map((row) => ({
    id: row.id,
    date: row.date,
    source: row.source,
    amount: row.amount,
    accountId: row.accountId,
    createdAt: row.createdAt,
    account: getAccountById(row.accountId) || undefined,
  }));
}

// Get monthly income total
export function getMonthlyIncomeTotal(year: number, month: number): number {
  const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
  const endMonth = month === 11 ? 0 : month + 1;
  const endYear = month === 11 ? year + 1 : year;
  const endDate = `${endYear}-${String(endMonth + 1).padStart(2, '0')}-01`;

  const result = db
    .prepare(
      'SELECT COALESCE(SUM(amount), 0) as total FROM income WHERE date >= ? AND date < ?'
    )
    .get(startDate, endDate) as { total: number };

  return result.total;
}

// Create income
export function createIncome(data: IncomeFormData): IncomeWithRelations {
  const id = uuidv4();

  db.prepare(`
    INSERT INTO income (id, date, source, amount, accountId)
    VALUES (?, ?, ?, ?, ?)
  `).run(id, data.date, data.source, data.amount, data.accountId);

  return getIncomeById(id)!;
}

// Update income
export function updateIncome(
  id: string,
  data: Partial<IncomeFormData>
): IncomeWithRelations | null {
  const existing = getIncomeById(id);
  if (!existing) return null;

  const updates: string[] = [];
  const values: any[] = [];

  if (data.date !== undefined) {
    updates.push('date = ?');
    values.push(data.date);
  }
  if (data.source !== undefined) {
    updates.push('source = ?');
    values.push(data.source);
  }
  if (data.amount !== undefined) {
    updates.push('amount = ?');
    values.push(data.amount);
  }
  if (data.accountId !== undefined) {
    updates.push('accountId = ?');
    values.push(data.accountId);
  }

  if (updates.length > 0) {
    values.push(id);
    db.prepare(`UPDATE income SET ${updates.join(', ')} WHERE id = ?`).run(
      ...values
    );
  }

  return getIncomeById(id);
}

// Delete income
export function deleteIncome(id: string): boolean {
  const result = db.prepare('DELETE FROM income WHERE id = ?').run(id);
  return result.changes > 0;
}

// Get income by date range
export function getIncomeByDateRange(
  startDate: string,
  endDate: string
): IncomeWithRelations[] {
  const rows = db
    .prepare(
      'SELECT * FROM income WHERE date >= ? AND date <= ? ORDER BY date DESC'
    )
    .all(startDate, endDate) as any[];

  return rows.map((row) => ({
    id: row.id,
    date: row.date,
    source: row.source,
    amount: row.amount,
    accountId: row.accountId,
    createdAt: row.createdAt,
    account: getAccountById(row.accountId) || undefined,
  }));
}
