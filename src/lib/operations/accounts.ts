// ============================================
// BADGER - Account Operations
// ============================================

import db from '../db';
import { v4 as uuidv4 } from 'uuid';
import type { Account, AccountBalance } from '@/types';

// Get all accounts
export function getAllAccounts(includeInactive = false): Account[] {
  const query = includeInactive
    ? 'SELECT * FROM accounts ORDER BY "order" ASC'
    : 'SELECT * FROM accounts WHERE isActive = 1 ORDER BY "order" ASC';

  const rows = db.prepare(query).all() as any[];

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    openingBalance: row.openingBalance,
    isActive: row.isActive === 1,
    order: row.order,
    createdAt: row.createdAt,
  }));
}

// Get account by ID
export function getAccountById(id: string): Account | null {
  const row = db.prepare('SELECT * FROM accounts WHERE id = ?').get(id) as any;

  if (!row) return null;

  return {
    id: row.id,
    name: row.name,
    openingBalance: row.openingBalance,
    isActive: row.isActive === 1,
    order: row.order,
    createdAt: row.createdAt,
  };
}

// Create account
export function createAccount(data: {
  name: string;
  openingBalance?: number;
  order?: number;
}): Account {
  const id = uuidv4();
  const maxOrder = db
    .prepare('SELECT MAX("order") as maxOrder FROM accounts')
    .get() as { maxOrder: number | null };

  const order = data.order ?? (maxOrder.maxOrder ?? 0) + 1;

  db.prepare(`
    INSERT INTO accounts (id, name, openingBalance, "order")
    VALUES (?, ?, ?, ?)
  `).run(id, data.name, data.openingBalance ?? 0, order);

  return getAccountById(id)!;
}

// Update account
export function updateAccount(
  id: string,
  data: Partial<{
    name: string;
    openingBalance: number;
    isActive: boolean;
    order: number;
  }>
): Account | null {
  const existing = getAccountById(id);
  if (!existing) return null;

  const updates: string[] = [];
  const values: any[] = [];

  if (data.name !== undefined) {
    updates.push('name = ?');
    values.push(data.name);
  }
  if (data.openingBalance !== undefined) {
    updates.push('openingBalance = ?');
    values.push(data.openingBalance);
  }
  if (data.isActive !== undefined) {
    updates.push('isActive = ?');
    values.push(data.isActive ? 1 : 0);
  }
  if (data.order !== undefined) {
    updates.push('"order" = ?');
    values.push(data.order);
  }

  if (updates.length > 0) {
    values.push(id);
    db.prepare(`UPDATE accounts SET ${updates.join(', ')} WHERE id = ?`).run(...values);
  }

  return getAccountById(id);
}

// Delete account (soft delete)
export function deleteAccount(id: string): boolean {
  const result = db.prepare('UPDATE accounts SET isActive = 0 WHERE id = ?').run(id);
  return result.changes > 0;
}

// Get account balance (derived from transactions)
export function getAccountBalance(accountId: string): AccountBalance | null {
  const account = getAccountById(accountId);
  if (!account) return null;

  // Get total income for this account
  const incomeResult = db
    .prepare('SELECT COALESCE(SUM(amount), 0) as total FROM income WHERE accountId = ?')
    .get(accountId) as { total: number };

  // Get total expenses for this account (only closed entries count as spent)
  const expenseResult = db
    .prepare(`
      SELECT COALESCE(SUM(e.amount), 0) as total
      FROM entries e
      WHERE e.accountId = ? AND e.status = 'closed'
    `)
    .get(accountId) as { total: number };

  const totalIncome = incomeResult.total;
  const totalExpense = expenseResult.total;
  const currentBalance = account.openingBalance + totalIncome - totalExpense;

  return {
    accountId: account.id,
    accountName: account.name,
    openingBalance: account.openingBalance,
    totalIncome,
    totalExpense,
    currentBalance,
  };
}

// Get all account balances
export function getAllAccountBalances(): AccountBalance[] {
  const accounts = getAllAccounts();
  return accounts.map((account) => getAccountBalance(account.id)!).filter(Boolean);
}
