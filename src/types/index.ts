// ============================================
// BADGER - Core Type Definitions
// ============================================

// Enums
export type Necessity = 'necessary' | 'unnecessary';
export type EntryStatus = 'open' | 'closed';
export type WeekStartDay = 'sunday' | 'monday';
export type EntryType = 'expense' | 'investment';
export type Mood = 'happy' | 'neutral' | 'sad';

// ============================================
// Core Entities
// ============================================

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  isActive: boolean;
  order: number;
  createdAt: string;
}

export interface Mode {
  id: string;
  name: string;
  isCredit: boolean;
  creditCardId: string | null;
  isActive: boolean;
  order: number;
  createdAt: string;
}

export interface Account {
  id: string;
  name: string;
  openingBalance: number;
  isActive: boolean;
  order: number;
  createdAt: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  isActive: boolean;
  createdAt: string;
}

export interface Template {
  id: string;
  name: string;
  defaults: TemplateDefaults;
  isActive: boolean;
  createdAt: string;
}

export interface TemplateDefaults {
  name?: string;
  amount?: number;
  modeId?: string;
  categoryId?: string;
  necessity?: Necessity;
  accountId?: string;
  tags?: string[];
}

// ============================================
// Transaction Entities
// ============================================

export interface Entry {
  id: string;
  expenseId: string;
  name: string;
  amount: number;
  modeId: string;
  categoryId: string;
  necessity: Necessity;
  type: EntryType;
  status: EntryStatus;
  expectedClosure: string | null;
  accountId: string;
  tags: string[];
  creditCardStatementId: string | null;
  mood: Mood | null;
  regret: boolean;
  createdAt: string;
}

export interface EntryWithRelations extends Entry {
  mode?: Mode;
  category?: Category;
  account?: Account;
  tagObjects?: Tag[];
}

export interface Expense {
  id: string;
  date: string; // YYYY-MM-DD format
  createdAt: string;
}

export interface ExpenseWithEntries extends Expense {
  entries: EntryWithRelations[];
  totalAmount: number;
  unnecessaryAmount: number;
  openAmount: number;
}

export interface Income {
  id: string;
  date: string;
  source: string;
  amount: number;
  accountId: string;
  createdAt: string;
}

export interface IncomeWithRelations extends Income {
  account?: Account;
}

// ============================================
// Settings
// ============================================

export interface Settings {
  id: string;
  monthlySpendLimit: number;
  monthlyUnnecessaryLimit: number;
  monthlyCreditLimit: number;
  stupidSpendThreshold: number;
  currency: string;
  weekStartDay: WeekStartDay;
  enableMoodTracking: boolean;
  enableRegretTracking: boolean;
  lastBackupDate: string | null;
  updatedAt: string;
}

// ============================================
// Analytics Types
// ============================================

export interface CategorySpend {
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  amount: number;
  percentage: number;
}

export interface WeeklySummary {
  totalSpent: number;
  unnecessaryPercentage: number;
  biggestLeak: { category: string; amount: number } | null;
  biggestImpulse: { name: string; amount: number } | null;
  changeVsLastWeek: number; // percentage change
}

export interface MonthlySummary {
  month: string;
  totalIncome: number;
  totalExpense: number;
  unnecessaryExpense: number;
  balance: number;
}

export interface AccountBalance {
  accountId: string;
  accountName: string;
  openingBalance: number;
  totalIncome: number;
  totalExpense: number;
  currentBalance: number;
}

// ============================================
// Warning Types
// ============================================

export interface Warning {
  type: 'spend_limit' | 'unnecessary_limit' | 'credit_limit' | 'stupid_spend';
  message: string;
  severity: 'warning' | 'error';
  currentValue: number;
  limitValue: number;
}

// ============================================
// Form Types
// ============================================

export interface EntryFormData {
  name: string;
  amount: number;
  modeId: string;
  categoryId: string;
  necessity: Necessity;
  type: EntryType;
  status: EntryStatus;
  expectedClosure: string | null;
  accountId: string;
  tags: string[];
  mood: Mood | null;
  regret: boolean;
  creditCardStatementId?: string | null;
}

export interface IncomeFormData {
  date: string;
  source: string;
  amount: number;
  accountId: string;
}

// ============================================
// Quick Add Parsing
// ============================================

export interface ParsedQuickAdd {
  amount?: number;
  name?: string;
  category?: string;
  mode?: string;
  necessity?: Necessity;
  tags?: string[];
}

// ============================================
// Calendar Types
// ============================================

export interface CalendarDay {
  date: string;
  isCurrentMonth: boolean;
  isToday: boolean;
  expense?: ExpenseWithEntries;
  hasWarning: boolean;
}

export interface CalendarMonth {
  year: number;
  month: number; // 0-indexed
  days: CalendarDay[];
}

// ============================================
// Credit Card Types
// ============================================

export interface CreditCard {
  id: string;
  name: string;
  closingDay: number;
  dueDay: number;
  isActive: boolean;
  order: number;
  createdAt: string;
}

export interface CreditCardStatement {
  id: string;
  creditCardId: string;
  periodStart: string;
  periodEnd: string;
  totalAmount: number;
  paid: boolean;
  paidDate: string | null;
  createdAt: string;
}

export interface CreditCardStatementWithRelations extends CreditCardStatement {
  creditCard?: CreditCard;
  entries: EntryWithRelations[];
}

export interface CreditCardWithStatements extends CreditCard {
  statements: CreditCardStatementWithRelations[];
  totalOutstanding: number;
  currentStatementTotal: number;
}

// ============================================
// Gen-Z Behavior Layer Types
// ============================================

export interface Streaks {
  id: string;
  currentLogStreak: number;
  longestLogStreak: number;
  lastLogDate: string | null;
  currentUnnecessaryStreak: number;
  longestUnnecessaryStreak: number;
  lastUnnecessaryStreakDate: string | null;
  updatedAt: string;
}

export interface VibeScore {
  score: number; // 0-100
  unnecessaryPercentage: number;
  creditPercentage: number;
  overspendPercentage: number;
  openLiabilitiesPercentage: number;
}

export interface SilentWin {
  type: 'under_limit' | 'streak_milestone' | 'low_regret';
  message: string;
  icon: string;
}

export interface InvestmentSummary {
  month: string;
  totalInvested: number;
}

// ============================================
// Maturity Features Types
// ============================================

export interface MonthClose {
  id: string;
  month: number; // 0-11
  year: number;
  isClosed: boolean;
  closedAt: string | null;
  closedBy: string;
  createdAt: string;
}

export interface MonthlyReflection {
  id: string;
  month: number; // 0-11
  year: number;
  reflection: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BillForecast {
  totalExpected: number;
  breakdown: {
    creditCards: number;
    subscriptions: number;
    fixedExpenses: number;
  };
  items: ForecastItem[];
}

export interface ForecastItem {
  name: string;
  amount: number;
  dueDate: string;
  type: 'credit_card' | 'subscription' | 'fixed';
  source?: string;
}

export interface SubscriptionAlert {
  name: string;
  amount: number;
  lastUsed: string | null;
  monthlyPayments: number;
  totalSpent: number;
  suggestion: string;
}

export interface TrendStability {
  avgSpend: number;
  avgUnnecessaryPercent: number;
  avgCreditPercent: number;
  isStabilizing: boolean;
  trend: 'improving' | 'stable' | 'worsening';
  months: {
    month: string;
    spend: number;
    unnecessaryPercent: number;
    creditPercent: number;
  }[];
}

export interface BudgetAdherence {
  totalMonths: number;
  monthsUnderLimit: number;
  adherenceRate: number;
  recentMonths: {
    month: string;
    underLimit: boolean;
    spendPercent: number;
  }[];
}

export interface CutAnalysis {
  totalAvoidable: number;
  avoidablePercent: number;
  topCategories: {
    categoryName: string;
    amount: number;
    count: number;
  }[];
  topMerchants: {
    merchantName: string;
    amount: number;
    count: number;
  }[];
}

export interface AppExport {
  version: string;
  exportDate: string;
  data: {
    settings: Settings;
    accounts: Account[];
    categories: Category[];
    modes: Mode[];
    tags: Tag[];
    templates: Template[];
    creditCards: CreditCard[];
    entries: Entry[];
    expenses: Expense[];
    creditCardStatements: CreditCardStatement[];
    incomes: Income[];
    streaks: Streaks;
    monthClose: MonthClose[];
    monthlyReflection: MonthlyReflection[];
  };
}
