// Client-side database using IndexedDB for Vercel deployment
// This replaces SQLite for browser-based storage

const DB_NAME = 'badger-db';
const DB_VERSION = 1;

let dbInstance: IDBDatabase | null = null;

export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (dbInstance) {
      resolve(dbInstance);
      return;
    }

    if (typeof window === 'undefined') {
      reject(new Error('IndexedDB only available in browser'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create object stores (tables)
      if (!db.objectStoreNames.contains('expenses')) {
        db.createObjectStore('expenses', { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains('entries')) {
        db.createObjectStore('entries', { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains('income')) {
        db.createObjectStore('income', { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains('categories')) {
        db.createObjectStore('categories', { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('credit_cards')) {
        db.createObjectStore('credit_cards', { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains('modes')) {
        db.createObjectStore('modes', { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains('accounts')) {
        db.createObjectStore('accounts', { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains('tags')) {
        db.createObjectStore('tags', { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains('templates')) {
        db.createObjectStore('templates', { keyPath: 'id', autoIncrement: true });
      }
    };
  });
};

// Check if we're running on Vercel (serverless)
export const isServerless = () => {
  return typeof window === 'undefined' || process.env.VERCEL === '1';
};

// For now, return mock data for Vercel deployment
export const getDefaultSettings = () => ({
  id: 1,
  currency: '₹',
  language: 'en',
  theme: 'light',
  appMode: 'simple',
  weekStartDay: 'sunday',
  enableMoodTracking: false,
  enableRegretTracking: false,
  enableImpulseTimer: false,
  enableBackupReminder: true,
  lastBackup: null,
});

export const getDefaultData = () => ({
  expenses: [],
  income: [],
  categories: [
    { id: 1, name: 'Food', icon: '🍔', color: '#FF6B6B' },
    { id: 2, name: 'Transport', icon: '🚗', color: '#4ECDC4' },
    { id: 3, name: 'Shopping', icon: '🛍️', color: '#95E1D3' },
    { id: 4, name: 'Bills', icon: '📄', color: '#F38181' },
    { id: 5, name: 'Entertainment', icon: '🎬', color: '#AA96DA' },
  ],
  modes: [
    { id: 1, name: 'Cash', icon: '💵' },
    { id: 2, name: 'Card', icon: '💳' },
    { id: 3, name: 'UPI', icon: '📱' },
  ],
  accounts: [],
  tags: [],
  templates: [],
  creditCards: [],
});
