// ============================================
// BADGER - Database Initialization Script
// ============================================

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Database file location
const DB_PATH = process.env.BADGER_DB_PATH || path.join(process.cwd(), 'data', 'badger.db');

// Ensure data directory exists
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

console.log('Initializing Badger database at:', DB_PATH);

// Create database connection
const db = new Database(DB_PATH);

// Enable WAL mode
db.pragma('journal_mode = WAL');

// Create schema
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

  -- Create indexes
  CREATE INDEX IF NOT EXISTS idx_entries_expenseId ON entries(expenseId);
  CREATE INDEX IF NOT EXISTS idx_entries_categoryId ON entries(categoryId);
  CREATE INDEX IF NOT EXISTS idx_entries_modeId ON entries(modeId);
  CREATE INDEX IF NOT EXISTS idx_entries_accountId ON entries(accountId);
  CREATE INDEX IF NOT EXISTS idx_entries_status ON entries(status);
  CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
  CREATE INDEX IF NOT EXISTS idx_income_date ON income(date);
  CREATE INDEX IF NOT EXISTS idx_income_accountId ON income(accountId);
`;

db.exec(schema);
console.log('Schema created successfully.');

// Seed default data
function seedDefaults() {
  // Settings
  const settings = db.prepare('SELECT * FROM settings WHERE id = ?').get('default');
  if (!settings) {
    db.prepare(`
      INSERT INTO settings (id, monthlySpendLimit, monthlyUnnecessaryLimit, monthlyCreditLimit, stupidSpendThreshold, currency, weekStartDay)
      VALUES (?, 50000, 10000, 20000, 2000, '₹', 'monday')
    `).run('default');
    console.log('Default settings created.');
  }

  // Categories
  const categoryCount = db.prepare('SELECT COUNT(*) as count FROM categories').get();
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
    console.log('Default categories created.');
  }

  // Modes
  const modeCount = db.prepare('SELECT COUNT(*) as count FROM modes').get();
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
    console.log('Default modes created.');
  }

  // Accounts
  const accountCount = db.prepare('SELECT COUNT(*) as count FROM accounts').get();
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
    console.log('Default accounts created.');
  }
}

seedDefaults();

db.close();
console.log('Database initialization complete!');
