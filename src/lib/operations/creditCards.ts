// ============================================
// BADGER - Credit Card Operations
// ============================================

import db from '../db';
import { v4 as uuidv4 } from 'uuid';
import { format, parseISO } from 'date-fns';
import type {
  CreditCard,
  CreditCardStatement,
  CreditCardStatementWithRelations,
  CreditCardWithStatements,
  EntryWithRelations,
} from '@/types';
import { getEntryById } from './expenses';

// ============================================
// Credit Card CRUD Operations
// ============================================

export function getAllCreditCards(includeInactive = false): CreditCard[] {
  const query = includeInactive
    ? 'SELECT * FROM credit_cards ORDER BY "order", name'
    : 'SELECT * FROM credit_cards WHERE isActive = 1 ORDER BY "order", name';

  const rows = db.prepare(query).all() as any[];

  return rows.map(row => ({
    id: row.id,
    name: row.name,
    closingDay: row.closingDay,
    dueDay: row.dueDay,
    isActive: Boolean(row.isActive),
    order: row.order,
    createdAt: row.createdAt,
  }));
}

export function getCreditCardById(id: string): CreditCard | null {
  const row = db.prepare('SELECT * FROM credit_cards WHERE id = ?').get(id) as any;

  if (!row) return null;

  return {
    id: row.id,
    name: row.name,
    closingDay: row.closingDay,
    dueDay: row.dueDay,
    isActive: Boolean(row.isActive),
    order: row.order,
    createdAt: row.createdAt,
  };
}

export function createCreditCard(data: {
  name: string;
  closingDay: number;
  dueDay: number;
}): CreditCard {
  const id = uuidv4();

  // Get next order number
  const maxOrder = db.prepare('SELECT MAX("order") as max FROM credit_cards').get() as { max: number | null };
  const order = (maxOrder.max || 0) + 1;

  db.prepare(`
    INSERT INTO credit_cards (id, name, closingDay, dueDay, "order")
    VALUES (?, ?, ?, ?, ?)
  `).run(id, data.name, data.closingDay, data.dueDay, order);

  return getCreditCardById(id)!;
}

export function updateCreditCard(id: string, data: Partial<{
  name: string;
  closingDay: number;
  dueDay: number;
}>): CreditCard | null {
  const existing = getCreditCardById(id);
  if (!existing) return null;

  const updates: string[] = [];
  const values: any[] = [];

  if (data.name !== undefined) {
    updates.push('name = ?');
    values.push(data.name);
  }
  if (data.closingDay !== undefined) {
    updates.push('closingDay = ?');
    values.push(data.closingDay);
  }
  if (data.dueDay !== undefined) {
    updates.push('dueDay = ?');
    values.push(data.dueDay);
  }

  if (updates.length === 0) return existing;

  values.push(id);
  db.prepare(`UPDATE credit_cards SET ${updates.join(', ')} WHERE id = ?`).run(...values);

  return getCreditCardById(id);
}

export function deleteCreditCard(id: string): boolean {
  // Check for unpaid statements
  const unpaidStatements = db.prepare(`
    SELECT COUNT(*) as count FROM credit_card_statements
    WHERE creditCardId = ? AND paid = 0
  `).get(id) as { count: number };

  if (unpaidStatements.count > 0) {
    throw new Error('Cannot delete credit card with unpaid statements');
  }

  // Soft delete
  db.prepare('UPDATE credit_cards SET isActive = 0 WHERE id = ?').run(id);
  return true;
}

// ============================================
// Statement Operations
// ============================================

export function calculateStatementPeriod(closingDay: number, transactionDate: string): {
  periodStart: string;
  periodEnd: string;
} {
  const txDate = parseISO(transactionDate);
  const txDay = txDate.getDate();
  const txMonth = txDate.getMonth();
  const txYear = txDate.getFullYear();

  let periodEnd: Date;

  // Transaction ON or before closing day belongs to period ending on that day
  if (txDay <= closingDay) {
    periodEnd = new Date(txYear, txMonth, closingDay);
  } else {
    // Transaction after closing day belongs to next period
    periodEnd = new Date(txYear, txMonth + 1, closingDay);
  }

  // Handle months without the closing day (e.g., Feb 30)
  const lastDayOfMonth = new Date(periodEnd.getFullYear(), periodEnd.getMonth() + 1, 0).getDate();
  if (closingDay > lastDayOfMonth) {
    periodEnd.setDate(lastDayOfMonth);
  }

  // Period starts day after previous closing
  const periodStart = new Date(periodEnd);
  periodStart.setMonth(periodStart.getMonth() - 1);
  periodStart.setDate(periodStart.getDate() + 1);

  return {
    periodStart: format(periodStart, 'yyyy-MM-dd'),
    periodEnd: format(periodEnd, 'yyyy-MM-dd'),
  };
}

export function getOrCreateCurrentStatement(creditCardId: string, transactionDate: string): CreditCardStatement {
  const card = getCreditCardById(creditCardId);
  if (!card) throw new Error('Credit card not found');

  const period = calculateStatementPeriod(card.closingDay, transactionDate);

  // Check if statement exists
  let statement = db.prepare(`
    SELECT * FROM credit_card_statements
    WHERE creditCardId = ? AND periodStart = ? AND periodEnd = ?
  `).get(creditCardId, period.periodStart, period.periodEnd) as any;

  if (!statement) {
    // Create new statement
    const id = uuidv4();
    db.prepare(`
      INSERT INTO credit_card_statements (id, creditCardId, periodStart, periodEnd)
      VALUES (?, ?, ?, ?)
    `).run(id, creditCardId, period.periodStart, period.periodEnd);

    statement = db.prepare('SELECT * FROM credit_card_statements WHERE id = ?').get(id) as any;
  }

  // Calculate total amount
  const total = db.prepare(`
    SELECT COALESCE(SUM(amount), 0) as total
    FROM entries
    WHERE creditCardStatementId = ?
  `).get(statement.id) as { total: number };

  return {
    id: statement.id,
    creditCardId: statement.creditCardId,
    periodStart: statement.periodStart,
    periodEnd: statement.periodEnd,
    totalAmount: total.total,
    paid: Boolean(statement.paid),
    paidDate: statement.paidDate,
    createdAt: statement.createdAt,
  };
}

export function getStatementById(id: string): CreditCardStatementWithRelations | null {
  const row = db.prepare('SELECT * FROM credit_card_statements WHERE id = ?').get(id) as any;
  if (!row) return null;

  const card = getCreditCardById(row.creditCardId);

  // Get entries for this statement
  const entryRows = db.prepare(`
    SELECT e.*, exp.date
    FROM entries e
    JOIN expenses exp ON e.expenseId = exp.id
    WHERE e.creditCardStatementId = ?
    ORDER BY exp.date DESC
  `).all(id) as any[];

  const entries: EntryWithRelations[] = entryRows.map(e => getEntryById(e.id)!);

  const totalAmount = entries.reduce((sum, e) => sum + e.amount, 0);

  return {
    id: row.id,
    creditCardId: row.creditCardId,
    periodStart: row.periodStart,
    periodEnd: row.periodEnd,
    totalAmount,
    paid: Boolean(row.paid),
    paidDate: row.paidDate,
    createdAt: row.createdAt,
    creditCard: card || undefined,
    entries,
  };
}

export function getCreditCardStatements(creditCardId: string): CreditCardStatementWithRelations[] {
  const rows = db.prepare(`
    SELECT * FROM credit_card_statements
    WHERE creditCardId = ?
    ORDER BY periodEnd DESC
  `).all(creditCardId) as any[];

  return rows.map(row => getStatementById(row.id)!).filter(Boolean);
}

export function getUnpaidStatements(creditCardId?: string): CreditCardStatementWithRelations[] {
  const query = creditCardId
    ? 'SELECT * FROM credit_card_statements WHERE creditCardId = ? AND paid = 0 ORDER BY periodEnd'
    : 'SELECT * FROM credit_card_statements WHERE paid = 0 ORDER BY periodEnd';

  const rows = creditCardId
    ? db.prepare(query).all(creditCardId) as any[]
    : db.prepare(query).all() as any[];

  return rows.map(row => getStatementById(row.id)!).filter(Boolean);
}

export function markStatementPaid(statementId: string, paidDate: string, accountId: string): boolean {
  const statement = getStatementById(statementId);
  if (!statement) return false;

  // Start transaction
  const transaction = db.transaction(() => {
    // Mark statement as paid
    db.prepare(`
      UPDATE credit_card_statements
      SET paid = 1, paidDate = ?
      WHERE id = ?
    `).run(paidDate, statementId);

    // Close all linked entries
    db.prepare(`
      UPDATE entries
      SET status = 'closed'
      WHERE creditCardStatementId = ?
    `).run(statementId);

    // Create a payment entry to deduct from account
    // This represents the actual cash outflow when paying the credit card bill
    const { v4: uuidv4 } = require('uuid');
    const { getOrCreateExpense } = require('./expenses');

    const expense = getOrCreateExpense(paidDate);
    const paymentId = uuidv4();

    // Get the first non-credit mode (preferably cash/bank transfer)
    const paymentMode = db.prepare(`
      SELECT id FROM modes
      WHERE isCredit = 0 AND isActive = 1
      ORDER BY "order"
      LIMIT 1
    `).get() as any;

    // Get a generic category for payments (use first category as fallback)
    const category = db.prepare(`
      SELECT id FROM categories WHERE isActive = 1 ORDER BY "order" LIMIT 1
    `).get() as any;

    db.prepare(`
      INSERT INTO entries (
        id, expenseId, name, amount, modeId, categoryId,
        necessity, type, status, accountId, tags
      )
      VALUES (?, ?, ?, ?, ?, ?, 'necessary', 'expense', 'closed', ?, '[]')
    `).run(
      paymentId,
      expense.id,
      `Credit Card Payment - ${statement.creditCard?.name || 'Card'}`,
      statement.totalAmount,
      paymentMode.id,
      category.id,
      accountId
    );
  });

  transaction();
  return true;
}

export function getCreditCardSummary(creditCardId: string): CreditCardWithStatements | null {
  const card = getCreditCardById(creditCardId);
  if (!card) return null;

  const statements = getCreditCardStatements(creditCardId);
  const unpaidStatements = statements.filter(s => !s.paid);

  const totalOutstanding = unpaidStatements.reduce((sum, s) => sum + s.totalAmount, 0);

  // Get current statement
  const today = format(new Date(), 'yyyy-MM-dd');
  const currentStatement = getOrCreateCurrentStatement(creditCardId, today);

  return {
    ...card,
    statements,
    totalOutstanding,
    currentStatementTotal: currentStatement.totalAmount,
  };
}

export function getAllCreditCardsSummary(): CreditCardWithStatements[] {
  const cards = getAllCreditCards();
  return cards.map(card => getCreditCardSummary(card.id)!).filter(Boolean);
}
