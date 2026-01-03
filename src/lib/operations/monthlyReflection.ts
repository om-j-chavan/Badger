// ============================================
// BADGER - Monthly Reflection Operations
// ============================================

import db from '../db';
import { v4 as uuidv4 } from 'uuid';
import type { MonthlyReflection } from '@/types';

// Get monthly reflection
export function getMonthlyReflection(year: number, month: number): MonthlyReflection | null {
  const row = db.prepare('SELECT * FROM monthly_reflection WHERE year = ? AND month = ?').get(year, month) as any;
  if (!row) return null;

  return {
    id: row.id,
    month: row.month,
    year: row.year,
    reflection: row.reflection,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

// Save monthly reflection
export function saveMonthlyReflection(year: number, month: number, reflection: string): MonthlyReflection {
  const existing = getMonthlyReflection(year, month);

  if (existing) {
    // Update existing
    db.prepare(`
      UPDATE monthly_reflection
      SET reflection = ?,
          updatedAt = datetime('now')
      WHERE year = ? AND month = ?
    `).run(reflection, year, month);
  } else {
    // Create new
    const id = uuidv4();
    db.prepare(`
      INSERT INTO monthly_reflection (id, month, year, reflection)
      VALUES (?, ?, ?, ?)
    `).run(id, month, year, reflection);
  }

  return getMonthlyReflection(year, month)!;
}

// Get previous month's reflection (for display)
export function getPreviousMonthReflection(): MonthlyReflection | null {
  const now = new Date();
  const prevMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
  const prevYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();

  return getMonthlyReflection(prevYear, prevMonth);
}

// Check if current month reflection exists
export function hasCurrentMonthReflection(): boolean {
  const now = new Date();
  const reflection = getMonthlyReflection(now.getFullYear(), now.getMonth());
  return reflection !== null && reflection.reflection !== null && reflection.reflection.trim() !== '';
}

// Get all reflections
export function getAllReflections(): MonthlyReflection[] {
  const rows = db.prepare('SELECT * FROM monthly_reflection ORDER BY year DESC, month DESC').all();

  return rows.map((row: any) => ({
    id: row.id,
    month: row.month,
    year: row.year,
    reflection: row.reflection,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }));
}
