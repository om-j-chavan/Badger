// ============================================
// BADGER - Month Close Operations
// ============================================

import db from '../db';
import { v4 as uuidv4 } from 'uuid';
import type { MonthClose } from '@/types';

// Get month close status
export function getMonthClose(year: number, month: number): MonthClose | null {
  const row = db.prepare('SELECT * FROM month_close WHERE year = ? AND month = ?').get(year, month) as any;
  if (!row) return null;

  return {
    id: row.id,
    month: row.month,
    year: row.year,
    isClosed: Boolean(row.isClosed),
    closedAt: row.closedAt,
    closedBy: row.closedBy,
    createdAt: row.createdAt,
  };
}

// Check if month is closed
export function isMonthClosed(year: number, month: number): boolean {
  const monthClose = getMonthClose(year, month);
  return monthClose?.isClosed || false;
}

// Close a month
export function closeMonth(year: number, month: number): MonthClose {
  const existing = getMonthClose(year, month);

  if (existing) {
    // Update existing record
    db.prepare(`
      UPDATE month_close
      SET isClosed = 1,
          closedAt = datetime('now')
      WHERE year = ? AND month = ?
    `).run(year, month);
  } else {
    // Create new record
    const id = uuidv4();
    db.prepare(`
      INSERT INTO month_close (id, month, year, isClosed, closedAt)
      VALUES (?, ?, ?, 1, datetime('now'))
    `).run(id, month, year);
  }

  return getMonthClose(year, month)!;
}

// Reopen a month
export function reopenMonth(year: number, month: number): MonthClose {
  const existing = getMonthClose(year, month);

  if (existing) {
    db.prepare(`
      UPDATE month_close
      SET isClosed = 0,
          closedAt = NULL
      WHERE year = ? AND month = ?
    `).run(year, month);
  } else {
    // Create record as open
    const id = uuidv4();
    db.prepare(`
      INSERT INTO month_close (id, month, year, isClosed, closedAt)
      VALUES (?, ?, ?, 0, NULL)
    `).run(id, month, year);
  }

  return getMonthClose(year, month)!;
}

// Get all closed months
export function getAllClosedMonths(): MonthClose[] {
  const rows = db.prepare('SELECT * FROM month_close WHERE isClosed = 1 ORDER BY year DESC, month DESC').all();

  return rows.map((row: any) => ({
    id: row.id,
    month: row.month,
    year: row.year,
    isClosed: Boolean(row.isClosed),
    closedAt: row.closedAt,
    closedBy: row.closedBy,
    createdAt: row.createdAt,
  }));
}
