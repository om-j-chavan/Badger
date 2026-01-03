// ============================================
// BADGER - Template Operations
// ============================================

import db from '../db';
import { v4 as uuidv4 } from 'uuid';
import type { Template, TemplateDefaults } from '@/types';

// Get all templates
export function getAllTemplates(includeInactive = false): Template[] {
  const query = includeInactive
    ? 'SELECT * FROM templates ORDER BY name ASC'
    : 'SELECT * FROM templates WHERE isActive = 1 ORDER BY name ASC';

  const rows = db.prepare(query).all() as any[];

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    defaults: JSON.parse(row.defaults) as TemplateDefaults,
    isActive: row.isActive === 1,
    createdAt: row.createdAt,
  }));
}

// Get template by ID
export function getTemplateById(id: string): Template | null {
  const row = db.prepare('SELECT * FROM templates WHERE id = ?').get(id) as any;

  if (!row) return null;

  return {
    id: row.id,
    name: row.name,
    defaults: JSON.parse(row.defaults) as TemplateDefaults,
    isActive: row.isActive === 1,
    createdAt: row.createdAt,
  };
}

// Create template
export function createTemplate(data: {
  name: string;
  defaults: TemplateDefaults;
}): Template {
  const id = uuidv4();

  db.prepare(`
    INSERT INTO templates (id, name, defaults)
    VALUES (?, ?, ?)
  `).run(id, data.name, JSON.stringify(data.defaults));

  return getTemplateById(id)!;
}

// Update template
export function updateTemplate(
  id: string,
  data: Partial<{
    name: string;
    defaults: TemplateDefaults;
    isActive: boolean;
  }>
): Template | null {
  const existing = getTemplateById(id);
  if (!existing) return null;

  const updates: string[] = [];
  const values: any[] = [];

  if (data.name !== undefined) {
    updates.push('name = ?');
    values.push(data.name);
  }
  if (data.defaults !== undefined) {
    updates.push('defaults = ?');
    values.push(JSON.stringify(data.defaults));
  }
  if (data.isActive !== undefined) {
    updates.push('isActive = ?');
    values.push(data.isActive ? 1 : 0);
  }

  if (updates.length > 0) {
    values.push(id);
    db.prepare(`UPDATE templates SET ${updates.join(', ')} WHERE id = ?`).run(...values);
  }

  return getTemplateById(id);
}

// Delete template (soft delete)
export function deleteTemplate(id: string): boolean {
  const result = db.prepare('UPDATE templates SET isActive = 0 WHERE id = ?').run(id);
  return result.changes > 0;
}
