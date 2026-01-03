// ============================================
// BADGER - Tag Operations
// ============================================

import db from '../db';
import { v4 as uuidv4 } from 'uuid';
import type { Tag } from '@/types';

// Get all tags
export function getAllTags(includeInactive = false): Tag[] {
  const query = includeInactive
    ? 'SELECT * FROM tags ORDER BY name ASC'
    : 'SELECT * FROM tags WHERE isActive = 1 ORDER BY name ASC';

  const rows = db.prepare(query).all() as any[];

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    color: row.color,
    isActive: row.isActive === 1,
    createdAt: row.createdAt,
  }));
}

// Get tag by ID
export function getTagById(id: string): Tag | null {
  const row = db.prepare('SELECT * FROM tags WHERE id = ?').get(id) as any;

  if (!row) return null;

  return {
    id: row.id,
    name: row.name,
    color: row.color,
    isActive: row.isActive === 1,
    createdAt: row.createdAt,
  };
}

// Get multiple tags by IDs
export function getTagsByIds(ids: string[]): Tag[] {
  if (ids.length === 0) return [];

  const placeholders = ids.map(() => '?').join(',');
  const rows = db
    .prepare(`SELECT * FROM tags WHERE id IN (${placeholders})`)
    .all(...ids) as any[];

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    color: row.color,
    isActive: row.isActive === 1,
    createdAt: row.createdAt,
  }));
}

// Create tag
export function createTag(data: { name: string; color?: string }): Tag {
  const id = uuidv4();

  db.prepare(`
    INSERT INTO tags (id, name, color)
    VALUES (?, ?, ?)
  `).run(id, data.name, data.color || '#A3D9D3');

  return getTagById(id)!;
}

// Update tag
export function updateTag(
  id: string,
  data: Partial<{
    name: string;
    color: string;
    isActive: boolean;
  }>
): Tag | null {
  const existing = getTagById(id);
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
  if (data.isActive !== undefined) {
    updates.push('isActive = ?');
    values.push(data.isActive ? 1 : 0);
  }

  if (updates.length > 0) {
    values.push(id);
    db.prepare(`UPDATE tags SET ${updates.join(', ')} WHERE id = ?`).run(...values);
  }

  return getTagById(id);
}

// Delete tag (soft delete)
export function deleteTag(id: string): boolean {
  const result = db.prepare('UPDATE tags SET isActive = 0 WHERE id = ?').run(id);
  return result.changes > 0;
}

// Find or create tag by name
export function findOrCreateTag(name: string): Tag {
  const existing = db
    .prepare('SELECT * FROM tags WHERE LOWER(name) = ? AND isActive = 1')
    .get(name.toLowerCase()) as any;

  if (existing) {
    return {
      id: existing.id,
      name: existing.name,
      color: existing.color,
      isActive: existing.isActive === 1,
      createdAt: existing.createdAt,
    };
  }

  return createTag({ name });
}
