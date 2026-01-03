// ============================================
// BADGER - Category Operations
// ============================================

import db from '../db';
import { v4 as uuidv4 } from 'uuid';
import type { Category } from '@/types';

// Get all categories
export function getAllCategories(includeInactive = false): Category[] {
  const query = includeInactive
    ? 'SELECT * FROM categories ORDER BY "order" ASC'
    : 'SELECT * FROM categories WHERE isActive = 1 ORDER BY "order" ASC';

  const rows = db.prepare(query).all() as any[];

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    color: row.color,
    icon: row.icon,
    isActive: row.isActive === 1,
    order: row.order,
    createdAt: row.createdAt,
  }));
}

// Get category by ID
export function getCategoryById(id: string): Category | null {
  const row = db.prepare('SELECT * FROM categories WHERE id = ?').get(id) as any;

  if (!row) return null;

  return {
    id: row.id,
    name: row.name,
    color: row.color,
    icon: row.icon,
    isActive: row.isActive === 1,
    order: row.order,
    createdAt: row.createdAt,
  };
}

// Create category
export function createCategory(data: {
  name: string;
  color?: string;
  icon?: string;
  order?: number;
}): Category {
  const id = uuidv4();
  const maxOrder = db
    .prepare('SELECT MAX("order") as maxOrder FROM categories')
    .get() as { maxOrder: number | null };

  const order = data.order ?? (maxOrder.maxOrder ?? 0) + 1;

  db.prepare(`
    INSERT INTO categories (id, name, color, icon, "order")
    VALUES (?, ?, ?, ?, ?)
  `).run(id, data.name, data.color || '#ADEBB3', data.icon || '📁', order);

  return getCategoryById(id)!;
}

// Update category
export function updateCategory(
  id: string,
  data: Partial<{
    name: string;
    color: string;
    icon: string;
    isActive: boolean;
    order: number;
  }>
): Category | null {
  const existing = getCategoryById(id);
  if (!existing) return null;

  const updates: string[] = [];
  const values: any[] = [];

  if (data.name !== undefined) {
    updates.push('name = ?');
    values.push(data.name);
  }
  if (data.color !== undefined) {
    updates.push('color = ?');
    values.push(data.color);
  }
  if (data.icon !== undefined) {
    updates.push('icon = ?');
    values.push(data.icon);
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
    db.prepare(`UPDATE categories SET ${updates.join(', ')} WHERE id = ?`).run(...values);
  }

  return getCategoryById(id);
}

// Delete category (soft delete by setting isActive = false)
export function deleteCategory(id: string): boolean {
  const result = db.prepare('UPDATE categories SET isActive = 0 WHERE id = ?').run(id);
  return result.changes > 0;
}

// Find category by name (case-insensitive)
export function findCategoryByName(name: string): Category | null {
  const row = db
    .prepare('SELECT * FROM categories WHERE LOWER(name) LIKE ? AND isActive = 1')
    .get(`%${name.toLowerCase()}%`) as any;

  if (!row) return null;

  return {
    id: row.id,
    name: row.name,
    color: row.color,
    icon: row.icon,
    isActive: row.isActive === 1,
    order: row.order,
    createdAt: row.createdAt,
  };
}
