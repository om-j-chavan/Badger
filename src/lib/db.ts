// ============================================
// BADGER - Database Connection & Schema
// ============================================

import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Database file location - stored in user's app data
const DB_PATH = process.env.BADGER_DB_PATH || path.join(process.cwd(), 'data', 'badger.db');

// Ensure data directory exists
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Create database connection
const db = new Database(DB_PATH);

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');

// ============================================
// Schema Definition
// ============================================

const schema = `
  -- Categories table
  CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    color TEXT NOT NULL DEFAULT '#ADEBB3',
    icon TEXT NOT NULL DEFAULT '📁',
    isActive INTEGER NOT NULL DEFAULT 1,
    "order" INTEGER NOT NULL DEFAULT 0,
    createdAt TEXT NOT NULL DEFAULT (datetime('now'))
  );

  -- Modes table (payment methods)
  CREATE TABLE IF NOT EXISTS modes (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    isCredit INTEGER NOT NULL DEFAULT 0,
    isActive INTEGER NOT NULL DEFAULT 1,
    "order" INTEGER NOT NULL DEFAULT 0,
    createdAt TEXT NOT NULL DEFAULT (datetime('now'))
  );

  -- Accounts table
  CREATE TABLE IF NOT EXISTS accounts (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    openingBalance REAL NOT NULL DEFAULT 0,
    isActive INTEGER NOT NULL DEFAULT 1,
    "order" INTEGER NOT NULL DEFAULT 0,
    createdAt TEXT NOT NULL DEFAULT (datetime('now'))
  );

  -- Tags table
  CREATE TABLE IF NOT EXISTS tags (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    color TEXT NOT NULL DEFAULT '#A3D9D3',
    isActive INTEGER NOT NULL DEFAULT 1,
    createdAt TEXT NOT NULL DEFAULT (datetime('now'))
  );

  -- Templates table
  CREATE TABLE IF NOT EXISTS templates (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    defaults TEXT NOT NULL DEFAULT '{}',
    isActive INTEGER NOT NULL DEFAULT 1,
    createdAt TEXT NOT NULL DEFAULT (datetime('now'))
  );

  -- Expenses table (daily container)
  CREATE TABLE IF NOT EXISTS expenses (
    id TEXT PRIMARY KEY,
    date TEXT NOT NULL UNIQUE,
    createdAt TEXT NOT NULL DEFAULT (datetime('now'))
  );

  -- Entries table (individual transactions)
  CREATE TABLE IF NOT EXISTS entries (
    id TEXT PRIMARY KEY,
    expenseId TEXT NOT NULL,
    name TEXT NOT NULL,
    amount REAL NOT NULL,
    modeId TEXT NOT NULL,
    categoryId TEXT NOT NULL,
    necessity TEXT NOT NULL DEFAULT 'necessary',
    status TEXT NOT NULL DEFAULT 'closed',
    expectedClosure TEXT,
    accountId TEXT NOT NULL,
    tags TEXT NOT NULL DEFAULT '[]',
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (expenseId) REFERENCES expenses(id) ON DELETE CASCADE,
    FOREIGN KEY (modeId) REFERENCES modes(id),
    FOREIGN KEY (categoryId) REFERENCES categories(id),
    FOREIGN KEY (accountId) REFERENCES accounts(id)
  );

  -- Income table
  CREATE TABLE IF NOT EXISTS income (
    id TEXT PRIMARY KEY,
    date TEXT NOT NULL,
    source TEXT NOT NULL,
    amount REAL NOT NULL,
    accountId TEXT NOT NULL,
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (accountId) REFERENCES accounts(id)
  );

  -- Settings table (singleton)
  CREATE TABLE IF NOT EXISTS settings (
    id TEXT PRIMARY KEY DEFAULT 'default',
    monthlySpendLimit REAL NOT NULL DEFAULT 50000,
    monthlyUnnecessaryLimit REAL NOT NULL DEFAULT 10000,
    monthlyCreditLimit REAL NOT NULL DEFAULT 20000,
    stupidSpendThreshold REAL NOT NULL DEFAULT 2000,
    currency TEXT NOT NULL DEFAULT '₹',
    weekStartDay TEXT NOT NULL DEFAULT 'monday',
    updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
  );

  -- Create indexes for better query performance
  CREATE INDEX IF NOT EXISTS idx_entries_expenseId ON entries(expenseId);
  CREATE INDEX IF NOT EXISTS idx_entries_categoryId ON entries(categoryId);
  CREATE INDEX IF NOT EXISTS idx_entries_modeId ON entries(modeId);
  CREATE INDEX IF NOT EXISTS idx_entries_accountId ON entries(accountId);
  CREATE INDEX IF NOT EXISTS idx_entries_status ON entries(status);
  CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
  CREATE INDEX IF NOT EXISTS idx_income_date ON income(date);
  CREATE INDEX IF NOT EXISTS idx_income_accountId ON income(accountId);
`;

// Initialize database schema
db.exec(schema);

// ============================================
// Seed Default Data
// ============================================

function seedDefaultData() {
  const { v4: uuidv4 } = require('uuid');

  // Check if settings exist
  const settings = db.prepare('SELECT * FROM settings WHERE id = ?').get('default');
  if (!settings) {
    db.prepare(`
      INSERT INTO settings (id, monthlySpendLimit, monthlyUnnecessaryLimit, monthlyCreditLimit, stupidSpendThreshold, currency, weekStartDay)
      VALUES (?, 50000, 10000, 20000, 2000, '₹', 'monday')
    `).run('default');
  }

  // Check if categories exist
  const categoryCount = db.prepare('SELECT COUNT(*) as count FROM categories').get() as { count: number };
  if (categoryCount.count === 0) {
    const defaultCategories = [
      { name: 'Food & Dining', color: '#ADEBB3', icon: '🍕', order: 1 },
      { name: 'Transport', color: '#7FC8A9', icon: '🚗', order: 2 },
      { name: 'Shopping', color: '#A3D9D3', icon: '🛍️', order: 3 },
      { name: 'Bills & Utilities', color: '#F5C16C', icon: '💡', order: 4 },
      { name: 'Entertainment', color: '#E8B4BC', icon: '🎬', order: 5 },
      { name: 'Health', color: '#C3B1E1', icon: '💊', order: 6 },
      { name: 'Groceries', color: '#ADEBB3', icon: '🛒', order: 7 },
      { name: 'Education', color: '#7FC8A9', icon: '📚', order: 8 },
      { name: 'Personal Care', color: '#A3D9D3', icon: '💅', order: 9 },
      { name: 'Other', color: '#E3EFE8', icon: '📦', order: 10 },
    ];

    const insertCategory = db.prepare(`
      INSERT INTO categories (id, name, color, icon, "order") VALUES (?, ?, ?, ?, ?)
    `);

    for (const cat of defaultCategories) {
      insertCategory.run(uuidv4(), cat.name, cat.color, cat.icon, cat.order);
    }
  }

  // Check if modes exist
  const modeCount = db.prepare('SELECT COUNT(*) as count FROM modes').get() as { count: number };
  if (modeCount.count === 0) {
    const defaultModes = [
      { name: 'Cash', isCredit: 0, order: 1 },
      { name: 'UPI', isCredit: 0, order: 2 },
      { name: 'Debit Card', isCredit: 0, order: 3 },
      { name: 'Credit Card', isCredit: 1, order: 4 },
      { name: 'Bank Transfer', isCredit: 0, order: 5 },
    ];

    const insertMode = db.prepare(`
      INSERT INTO modes (id, name, isCredit, "order") VALUES (?, ?, ?, ?)
    `);

    for (const mode of defaultModes) {
      insertMode.run(uuidv4(), mode.name, mode.isCredit, mode.order);
    }
  }

  // Check if accounts exist
  const accountCount = db.prepare('SELECT COUNT(*) as count FROM accounts').get() as { count: number };
  if (accountCount.count === 0) {
    const defaultAccounts = [
      { name: 'Primary Bank', openingBalance: 0, order: 1 },
      { name: 'Cash Wallet', openingBalance: 0, order: 2 },
    ];

    const insertAccount = db.prepare(`
      INSERT INTO accounts (id, name, openingBalance, "order") VALUES (?, ?, ?, ?)
    `);

    for (const acc of defaultAccounts) {
      insertAccount.run(uuidv4(), acc.name, acc.openingBalance, acc.order);
    }
  }
}

// Seed default data
seedDefaultData();

// ============================================
// Migration System
// ============================================

function runMigrations() {
  const { v4: uuidv4 } = require('uuid');
  const currentVersion = db.pragma('user_version', { simple: true }) as number;

  if (currentVersion < 1) {
    console.log('Running migration 1: Credit Card Model...');

    // Create credit cards table
    db.exec(`
      CREATE TABLE IF NOT EXISTS credit_cards (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        closingDay INTEGER NOT NULL CHECK(closingDay >= 1 AND closingDay <= 31),
        dueDay INTEGER NOT NULL CHECK(dueDay >= 1 AND dueDay <= 31),
        isActive INTEGER NOT NULL DEFAULT 1,
        "order" INTEGER NOT NULL DEFAULT 0,
        createdAt TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE INDEX IF NOT EXISTS idx_credit_cards_isActive ON credit_cards(isActive);
    `);

    // Create credit card statements table
    db.exec(`
      CREATE TABLE IF NOT EXISTS credit_card_statements (
        id TEXT PRIMARY KEY,
        creditCardId TEXT NOT NULL,
        periodStart TEXT NOT NULL,
        periodEnd TEXT NOT NULL,
        paid INTEGER NOT NULL DEFAULT 0,
        paidDate TEXT,
        createdAt TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (creditCardId) REFERENCES credit_cards(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_statements_creditCardId ON credit_card_statements(creditCardId);
      CREATE INDEX IF NOT EXISTS idx_statements_paid ON credit_card_statements(paid);
      CREATE INDEX IF NOT EXISTS idx_statements_periodEnd ON credit_card_statements(periodEnd);
    `);

    // Add creditCardStatementId to entries table
    try {
      db.exec(`ALTER TABLE entries ADD COLUMN creditCardStatementId TEXT;`);
      db.exec(`CREATE INDEX IF NOT EXISTS idx_entries_creditCardStatementId ON entries(creditCardStatementId);`);
    } catch (e) {
      // Column may already exist, ignore
    }

    // Add creditCardId to modes table
    try {
      db.exec(`ALTER TABLE modes ADD COLUMN creditCardId TEXT;`);
      db.exec(`CREATE INDEX IF NOT EXISTS idx_modes_creditCardId ON modes(creditCardId);`);
    } catch (e) {
      // Column may already exist, ignore
    }

    // Migration: Create default credit card for existing credit entries
    const existingCreditEntries = db.prepare(`
      SELECT e.id, e.modeId, exp.date
      FROM entries e
      JOIN expenses exp ON e.expenseId = exp.id
      JOIN modes m ON e.modeId = m.id
      WHERE m.isCredit = 1 AND e.creditCardStatementId IS NULL
      ORDER BY exp.date ASC
    `).all() as any[];

    if (existingCreditEntries.length > 0) {
      console.log(`Found ${existingCreditEntries.length} existing credit entries to migrate`);

      // Create default credit card
      const defaultCardId = uuidv4();
      db.prepare(`
        INSERT INTO credit_cards (id, name, closingDay, dueDay, isActive, "order")
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(defaultCardId, 'Default Credit Card', 1, 15, 1, 0);

      // Link the first credit mode to this card
      const creditMode = db.prepare('SELECT id FROM modes WHERE isCredit = 1 ORDER BY "order" LIMIT 1').get() as any;
      if (creditMode) {
        db.prepare('UPDATE modes SET creditCardId = ? WHERE id = ?').run(defaultCardId, creditMode.id);
      }

      // Helper function to calculate statement period
      function calculateStatementPeriod(closingDay: number, transactionDate: string) {
        const txDate = new Date(transactionDate + 'T00:00:00');
        const txDay = txDate.getDate();
        const txMonth = txDate.getMonth();
        const txYear = txDate.getFullYear();

        let periodEnd: Date;

        if (txDay <= closingDay) {
          periodEnd = new Date(txYear, txMonth, closingDay);
        } else {
          periodEnd = new Date(txYear, txMonth + 1, closingDay);
        }

        const periodStart = new Date(periodEnd);
        periodStart.setMonth(periodStart.getMonth() - 1);
        periodStart.setDate(periodStart.getDate() + 1);

        const formatDate = (d: Date) => {
          const year = d.getFullYear();
          const month = String(d.getMonth() + 1).padStart(2, '0');
          const day = String(d.getDate()).padStart(2, '0');
          return `${year}-${month}-${day}`;
        };

        return {
          periodStart: formatDate(periodStart),
          periodEnd: formatDate(periodEnd)
        };
      }

      // Group entries by statement period and create statements
      const statementMap = new Map<string, string>(); // periodKey -> statementId

      for (const entry of existingCreditEntries) {
        const period = calculateStatementPeriod(1, entry.date);
        const periodKey = `${period.periodStart}_${period.periodEnd}`;

        let statementId = statementMap.get(periodKey);

        if (!statementId) {
          // Create new statement
          const newStatementId = uuidv4();
          db.prepare(`
            INSERT INTO credit_card_statements (id, creditCardId, periodStart, periodEnd, paid, paidDate)
            VALUES (?, ?, ?, ?, ?, ?)
          `).run(newStatementId, defaultCardId, period.periodStart, period.periodEnd, 1, period.periodEnd);

          statementMap.set(periodKey, newStatementId);
          statementId = newStatementId;
        }

        // Link entry to statement
        db.prepare('UPDATE entries SET creditCardStatementId = ? WHERE id = ?').run(statementId, entry.id);
      }

      console.log(`Created ${statementMap.size} historical statements and linked entries`);
    }

    db.pragma('user_version = 1');
    console.log('Migration 1 completed');
  }

  if (currentVersion < 2) {
    console.log('Running migration 2: Investment Entry Type...');

    // Add type column to entries
    try {
      db.exec(`ALTER TABLE entries ADD COLUMN type TEXT NOT NULL DEFAULT 'expense';`);
      db.exec(`CREATE INDEX IF NOT EXISTS idx_entries_type ON entries(type);`);
    } catch (e) {
      // Column may already exist, ignore
    }

    db.pragma('user_version = 2');
    console.log('Migration 2 completed');
  }

  if (currentVersion < 3) {
    console.log('Running migration 3: Gen-Z Behavior Layer...');

    // Add mood and regret to entries
    try {
      db.exec(`ALTER TABLE entries ADD COLUMN mood TEXT;`);
      db.exec(`ALTER TABLE entries ADD COLUMN regret INTEGER NOT NULL DEFAULT 0;`);
    } catch (e) {
      // Columns may already exist, ignore
    }

    // Add tracking preferences to settings
    try {
      db.exec(`ALTER TABLE settings ADD COLUMN enableMoodTracking INTEGER NOT NULL DEFAULT 1;`);
      db.exec(`ALTER TABLE settings ADD COLUMN enableRegretTracking INTEGER NOT NULL DEFAULT 1;`);
    } catch (e) {
      // Columns may already exist, ignore
    }

    // Create streaks table
    db.exec(`
      CREATE TABLE IF NOT EXISTS streaks (
        id TEXT PRIMARY KEY DEFAULT 'default',
        currentLogStreak INTEGER NOT NULL DEFAULT 0,
        longestLogStreak INTEGER NOT NULL DEFAULT 0,
        lastLogDate TEXT,
        currentUnnecessaryStreak INTEGER NOT NULL DEFAULT 0,
        longestUnnecessaryStreak INTEGER NOT NULL DEFAULT 0,
        lastUnnecessaryStreakDate TEXT,
        updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
      );
    `);

    // Insert default streaks record
    const streaksExist = db.prepare('SELECT COUNT(*) as count FROM streaks').get() as { count: number };
    if (streaksExist.count === 0) {
      db.prepare(`INSERT INTO streaks (id) VALUES ('default')`).run();
    }

    db.pragma('user_version = 3');
    console.log('Migration 3 completed');
  }

  if (currentVersion < 4) {
    console.log('Running migration 4: Maturity Features...');

    // Create month_close table
    db.exec(`
      CREATE TABLE IF NOT EXISTS month_close (
        id TEXT PRIMARY KEY,
        month INTEGER NOT NULL,
        year INTEGER NOT NULL,
        isClosed INTEGER NOT NULL DEFAULT 0,
        closedAt TEXT,
        closedBy TEXT DEFAULT 'user',
        createdAt TEXT NOT NULL DEFAULT (datetime('now')),
        UNIQUE(year, month)
      );
    `);

    db.exec(`CREATE INDEX IF NOT EXISTS idx_month_close_year_month ON month_close(year, month);`);

    // Create monthly_reflection table
    db.exec(`
      CREATE TABLE IF NOT EXISTS monthly_reflection (
        id TEXT PRIMARY KEY,
        month INTEGER NOT NULL,
        year INTEGER NOT NULL,
        reflection TEXT,
        createdAt TEXT NOT NULL DEFAULT (datetime('now')),
        updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
        UNIQUE(year, month)
      );
    `);

    db.exec(`CREATE INDEX IF NOT EXISTS idx_monthly_reflection_year_month ON monthly_reflection(year, month);`);

    // Add lastBackupDate to settings
    try {
      db.exec(`ALTER TABLE settings ADD COLUMN lastBackupDate TEXT;`);
    } catch (e) {
      // Column may already exist, ignore
    }

    db.pragma('user_version = 4');
    console.log('Migration 4 completed');
  }
}

// Run migrations after seeding
runMigrations();

export default db;
