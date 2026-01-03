# Badger App Refinements - Implementation Status

## ✅ Completed (Database & Core Operations)

### Phase 1: Database & Types
- ✅ Migration system with user_version pragma tracking
- ✅ Migration 1: Credit card tables (credit_cards, credit_card_statements)
  - ✅ Auto-migration of existing credit entries to "Default Credit Card"
  - ✅ Statement period calculation and historical statement creation
- ✅ Migration 2: Investment type column on entries
- ✅ Migration 3: Gen-Z fields (mood, regret on entries; enableMoodTracking, enableRegretTracking on settings; streaks table)
- ✅ All type definitions updated in `types/index.ts`

### Phase 2: Operation Files Created
- ✅ `/src/lib/operations/creditCards.ts` - Complete credit card and statement management
- ✅ `/src/lib/operations/streaks.ts` - Streak tracking for logging and unnecessary spending
- ✅ `/src/lib/operations/silentWins.ts` - Silent wins detection

## 🔨 In Progress / Remaining Work

### Critical: Update Existing Files for Type Safety

#### 1. Update `src/lib/operations/analytics.ts`
**Add these imports:**
```typescript
import type { VibeScore, InvestmentSummary } from '@/types';
```

**Modify all expense queries to filter out investments** by adding `AND e.type = 'expense'`:
- Line 77: `getWeeklySummary` - thisWeekResult query
- Line 92: `getWeeklySummary` - lastWeekResult query
- Line 119: `getWeeklySummary` - biggestImpulseRow query
- Line 264: `getDailySpending` - LEFT JOIN entries query
- Line 311: `getExpenseTrends` - thisWeekResult query
- Line 326: `getExpenseTrends` - lastWeekResult query

**Add at end of file:**
```typescript
// Investment Analytics
export function getInvestmentSummaries(months: number = 6): InvestmentSummary[] {
  const summaries: InvestmentSummary[] = [];
  const today = new Date();

  for (let i = 0; i < months; i++) {
    const date = subMonths(today, i);
    const year = date.getFullYear();
    const month = date.getMonth();

    const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
    const endMonth = month === 11 ? 0 : month + 1;
    const endYear = month === 11 ? year + 1 : year;
    const endDate = `${endYear}-${String(endMonth + 1).padStart(2, '0')}-01`;

    const result = db.prepare(`
      SELECT COALESCE(SUM(e.amount), 0) as total
      FROM entries e
      JOIN expenses exp ON e.expenseId = exp.id
      WHERE exp.date >= ? AND exp.date < ? AND e.type = 'investment'
    `).get(startDate, endDate) as any;

    summaries.push({
      month: format(date, 'MMM yyyy'),
      totalInvested: result.total,
    });
  }

  return summaries.reverse();
}

// Vibe Score Calculation
export function calculateVibeScore(date: Date = new Date()): VibeScore {
  const settings = getSettings();
  const weekStart = startOfWeek(date, {
    weekStartsOn: settings.weekStartDay === 'monday' ? 1 : 0,
  });
  const weekEnd = endOfWeek(date, {
    weekStartsOn: settings.weekStartDay === 'monday' ? 1 : 0,
  });

  const startDate = format(weekStart, 'yyyy-MM-dd');
  const endDate = format(weekEnd, 'yyyy-MM-dd');

  const totals = db.prepare(`
    SELECT
      COALESCE(SUM(e.amount), 0) as total,
      COALESCE(SUM(CASE WHEN e.necessity = 'unnecessary' THEN e.amount ELSE 0 END), 0) as unnecessary,
      COALESCE(SUM(CASE WHEN e.status = 'open' THEN e.amount ELSE 0 END), 0) as open
    FROM entries e
    JOIN expenses exp ON e.expenseId = exp.id
    WHERE exp.date >= ? AND exp.date <= ? AND e.type = 'expense'
  `).get(startDate, endDate) as any;

  const creditTotal = db.prepare(`
    SELECT COALESCE(SUM(e.amount), 0) as total
    FROM entries e
    JOIN expenses exp ON e.expenseId = exp.id
    JOIN modes m ON e.modeId = m.id
    WHERE exp.date >= ? AND exp.date <= ? AND m.isCredit = 1 AND e.type = 'expense'
  `).get(startDate, endDate) as any;

  const unnecessaryPercentage = totals.total > 0 ? (totals.unnecessary / totals.total) * 100 : 0;
  const creditPercentage = totals.total > 0 ? (creditTotal.total / totals.total) * 100 : 0;
  const weeklyLimit = settings.monthlySpendLimit / 4;
  const overspendPercentage = weeklyLimit > 0 ? Math.max(0, ((totals.total - weeklyLimit) / weeklyLimit) * 100) : 0;
  const openLiabilitiesPercentage = settings.monthlyCreditLimit > 0 ? (totals.open / settings.monthlyCreditLimit) * 100 : 0;

  let score = 100;
  score -= Math.min(40, unnecessaryPercentage * 0.8);
  score -= Math.min(25, creditPercentage * 0.5);
  score -= Math.min(25, overspendPercentage * 0.5);
  score -= Math.min(10, openLiabilitiesPercentage * 0.2);
  score = Math.max(0, Math.round(score));

  return {
    score,
    unnecessaryPercentage,
    creditPercentage,
    overspendPercentage,
    openLiabilitiesPercentage,
  };
}
```

#### 2. Update `src/lib/operations/expenses.ts`

**Find `getEntriesByCategory` function** and add `AND e.type = 'expense'` filter.

**Find `getMonthlyTotals` function** and add `AND e.type = 'expense'` filter.

**In `createEntry` function**, add after getting the expense:
```typescript
// Auto-assign credit entries to statements
if (mode?.isCredit && mode.creditCardId) {
  const { getOrCreateCurrentStatement } = require('./creditCards');
  const statement = getOrCreateCurrentStatement(mode.creditCardId, date);
  data.creditCardStatementId = statement.id;
  data.status = 'open'; // Force credit entries to open
}
```

**In `updateEntry` function**, add validation:
```typescript
// Prevent manual closure of credit entries
const mode = getModeById(existing.modeId);
if (mode?.isCredit && data.status === 'closed') {
  throw new Error('Credit card entries cannot be manually closed. Pay the statement instead.');
}
```

**Add new fields to INSERT and UPDATE statements** for: `type`, `mood`, `regret`, `creditCardStatementId`

#### 3. Update `src/lib/operations/modes.ts`

**Update return mapping** to include `creditCardId`:
```typescript
return {
  id: row.id,
  name: row.name,
  isCredit: Boolean(row.isCredit),
  creditCardId: row.creditCardId,
  isActive: Boolean(row.isActive),
  order: row.order,
  createdAt: row.createdAt,
};
```

---

## 📝 Remaining Files to Create

### API Routes (7 files)

1. **`src/app/api/credit-cards/route.ts`**
2. **`src/app/api/credit-cards/[id]/route.ts`**
3. **`src/app/api/credit-cards/[id]/statements/route.ts`**
4. **`src/app/api/statements/[id]/route.ts`**
5. **`src/app/api/statements/[id]/pay/route.ts`**
6. **`src/app/api/streaks/route.ts`**
7. **`src/app/api/vibe-score/route.ts`**

### UI Components (5 new files)

8. **`src/components/expense/MoodPicker.tsx`**
9. **`src/components/analytics/VibeScoreCard.tsx`**
10. **`src/components/analytics/StreakCard.tsx`**
11. **`src/components/analytics/InvestmentChart.tsx`**
12. **`src/components/ui/SilentWinToast.tsx`**

### Pages (2 new files)

13. **`src/app/liabilities/credit-cards/page.tsx`**
14. **`src/app/liabilities/credit-cards/[id]/statements/page.tsx`**

### Updates to Existing Files (4 files)

15. **Update `src/components/expense/EntryForm.tsx`** - Add type toggle, mood picker, regret checkbox, impulse timer
16. **Update `src/app/settings/page.tsx`** - Add Credit Cards tab + mood/regret toggles
17. **Update `src/app/analytics/page.tsx`** - Add vibe score card, streaks card, investment chart
18. **Update `src/components/layout/Navigation.tsx`** - Add Credit Cards link

---

## 🚀 Quick Start Guide for Continuing

### Priority 1: Make App Functional (Minimum Viable)

1. **Update expenses.ts** - Add new fields to database operations
2. **Update analytics.ts** - Add investment filtering
3. **Update EntryForm** - Add type field with default 'expense'
4. **Test** - Ensure app still works with new schema

### Priority 2: Credit Card Feature

5. Create credit card API routes (files 1-5)
6. Create credit cards pages (files 13-14)
7. Update Settings page with Credit Cards tab

### Priority 3: Gen-Z Features

8. Create streaks/vibe-score APIs (files 6-7)
9. Create UI components (files 8-12)
10. Update Analytics page
11. Update EntryForm with mood/regret/impulse timer

---

## 🎯 Next Immediate Step

**You should start by updating `src/lib/operations/expenses.ts`** to handle all the new fields properly. This is critical because the existing app will break when it tries to create entries without the new required fields.

See plan file at: `C:\Users\Lenovo\.claude\plans\sleepy-soaring-quasar.md` for complete implementation details.