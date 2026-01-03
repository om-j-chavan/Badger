// ============================================
// BADGER - Mode Operations
// ============================================

import db from '../db';
import { v4 as uuidv4 } from 'uuid';
import type { Mode } from '@/types';

// Get all modes
export function getAllModes(includeInactive = false): Mode[] {
  const query = includeInactive
    ? 'SELECT * FROM modes ORDER BY "order" ASC'
    : 'SELECT * FROM modes WHERE isActive = 1 ORDER BY "order" ASC';

  const rows = db.prepare(query).all() as any[];

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    isCredit: row.isCredit === 1,
    creditCardId: row.creditCardId || null,
    isActive: row.isActive === 1,
    order: row.order,
    createdAt: row.createdAt,
  }));
}

// Get mode by ID
export function getModeById(id: string): Mode | null {
  const row = db.prepare('SELECT * FROM modes WHERE id = ?').get(id) as any;

  if (!row) return null;

  return {
    id: row.id,
    name: row.name,
    isCredit: row.isCredit === 1,
    creditCardId: row.creditCardId || null,
    isActive: row.isActive === 1,
    order: row.order,
    createdAt: row.createdAt,
  };
}

// Create mode
export function createMode(data: {
  name: string;
  isCredit?: boolean;
  order?: number;
}): Mode {
  const id = uuidv4();
  const maxOrder = db
    .prepare('SELECT MAX("order") as maxOrder FROM modes')
    .get() as { maxOrder: number | null };

  const order = data.order ?? (maxOrder.maxOrder ?? 0) + 1;

  db.prepare(`
    INSERT INTO modes (id, name, isCredit, "order")
    VALUES (?, ?, ?, ?)
  `).run(id, data.name, data.isCredit ? 1 : 0, order);

  return getModeById(id)!;
}

// Update mode
export function updateMode(
  id: string,
  data: Partial<{
    name: string;
    isCredit: boolean;
    creditCardId: string | null;
    isActive: boolean;
    order: number;
  }>
): Mode | null {
  const existing = getModeById(id);
  if (!existing) return null;

  const updates: string[] = [];
  const values: any[] = [];

  if (data.name !== undefined) {
    updates.push('name = ?');
    values.push(data.name);
  }
  if (data.isCredit !== undefined) {
    updates.push('isCredit = ?');
    values.push(data.isCredit ? 1 : 0);
  }
  if (data.creditCardId !== undefined) {
    updates.push('creditCardId = ?');
    values.push(data.creditCardId);
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
    db.prepare(`UPDATE modes SET ${updates.join(', ')} WHERE id = ?`).run(...values);
  }

  return getModeById(id);
}

// Delete mode (soft delete)
export function deleteMode(id: string): boolean {
  const result = db.prepare('UPDATE modes SET isActive = 0 WHERE id = ?').run(id);
  return result.changes > 0;
}

// Find mode by name (case-insensitive)
export function findModeByName(name: string): Mode | null {
  const row = db
    .prepare('SELECT * FROM modes WHERE LOWER(name) LIKE ? AND isActive = 1')
    .get(`%${name.toLowerCase()}%`) as any;

  if (!row) return null;

  return {
    id: row.id,
    name: row.name,
    isCredit: row.isCredit === 1,
    creditCardId: row.creditCardId || null,
    isActive: row.isActive === 1,
    order: row.order,
    createdAt: row.createdAt,
  };
}

// Get all credit modes
export function getCreditModes(): Mode[] {
  const rows = db
    .prepare('SELECT * FROM modes WHERE isCredit = 1 AND isActive = 1 ORDER BY "order" ASC')
    .all() as any[];

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    isCredit: true,
    creditCardId: row.creditCardId || null,
    isActive: row.isActive === 1,
    order: row.order,
    createdAt: row.createdAt,
  }));
}
