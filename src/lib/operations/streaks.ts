// ============================================
// BADGER - Streaks Operations
// ============================================

import db from '../db';
import { parseISO, differenceInDays, startOfWeek, endOfWeek, format } from 'date-fns';
import type { Streaks } from '@/types';
import { getSettings } from './settings';

export function getStreaks(): Streaks {
  const row = db.prepare('SELECT * FROM streaks WHERE id = ?').get('default') as any;

  if (!row) {
    // Initialize default
    db.prepare(`INSERT INTO streaks (id) VALUES ('default')`).run();
    return getStreaks();
  }

  return {
    id: row.id,
    currentLogStreak: row.currentLogStreak,
    longestLogStreak: row.longestLogStreak,
    lastLogDate: row.lastLogDate,
    currentUnnecessaryStreak: row.currentUnnecessaryStreak,
    longestUnnecessaryStreak: row.longestUnnecessaryStreak,
    lastUnnecessaryStreakDate: row.lastUnnecessaryStreakDate,
    updatedAt: row.updatedAt,
  };
}

export function updateLogStreak(date: string): void {
  const streaks = getStreaks();
  const today = parseISO(date);

  let newLogStreak = 1;

  if (streaks.lastLogDate) {
    const lastLog = parseISO(streaks.lastLogDate);
    const daysDiff = differenceInDays(today, lastLog);

    if (daysDiff === 1) {
      // Consecutive day
      newLogStreak = streaks.currentLogStreak + 1;
    } else if (daysDiff === 0) {
      // Same day, no change
      return;
    }
    // else: streak broken, starts at 1
  }

  const newLongest = Math.max(streaks.longestLogStreak, newLogStreak);

  db.prepare(`
    UPDATE streaks
    SET currentLogStreak = ?,
        longestLogStreak = ?,
        lastLogDate = ?,
        updatedAt = datetime('now')
    WHERE id = ?
  `).run(newLogStreak, newLongest, date, 'default');
}

export function checkUnnecessaryStreak(): void {
  const settings = getSettings();
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
  const endMonth = month === 11 ? 0 : month + 1;
  const endYear = month === 11 ? year + 1 : year;
  const endDate = `${endYear}-${String(endMonth + 1).padStart(2, '0')}-01`;

  const totals = db.prepare(`
    SELECT
      COALESCE(SUM(e.amount), 0) as total,
      COALESCE(SUM(CASE WHEN e.necessity = 'unnecessary' THEN e.amount ELSE 0 END), 0) as unnecessary
    FROM entries e
    JOIN expenses exp ON e.expenseId = exp.id
    WHERE exp.date >= ? AND exp.date < ? AND e.type = 'expense'
  `).get(startDate, endDate) as any;

  const isUnderLimit = totals.unnecessary <= settings.monthlyUnnecessaryLimit;
  const streaks = getStreaks();
  const weekStartDate = format(
    startOfWeek(today, { weekStartsOn: settings.weekStartDay === 'monday' ? 1 : 0 }),
    'yyyy-MM-dd'
  );

  if (isUnderLimit) {
    let newStreak = 1;

    if (streaks.lastUnnecessaryStreakDate) {
      const lastWeek = parseISO(streaks.lastUnnecessaryStreakDate);
      const weeksDiff = Math.floor(differenceInDays(today, lastWeek) / 7);

      if (weeksDiff === 1) {
        newStreak = streaks.currentUnnecessaryStreak + 1;
      }
    }

    const newLongest = Math.max(streaks.longestUnnecessaryStreak, newStreak);

    db.prepare(`
      UPDATE streaks
      SET currentUnnecessaryStreak = ?,
          longestUnnecessaryStreak = ?,
          lastUnnecessaryStreakDate = ?,
          updatedAt = datetime('now')
      WHERE id = ?
    `).run(newStreak, newLongest, weekStartDate, 'default');
  } else {
    // Streak broken
    db.prepare(`
      UPDATE streaks
      SET currentUnnecessaryStreak = 0,
          updatedAt = datetime('now')
      WHERE id = ?
    `).run('default');
  }
}
