// ============================================
// BADGER - Quick Add Parser
// ============================================

import type { ParsedQuickAdd, Necessity } from '@/types';

/**
 * Parse quick add input string
 * Format: "amount name category mode necessity"
 * Example: "250 lunch food upi unnecessary"
 * Example: "1500 electricity bills"
 */
export function parseQuickAdd(input: string): ParsedQuickAdd {
  const result: ParsedQuickAdd = {};

  // Normalize input
  const normalized = input.toLowerCase().trim();
  const parts = normalized.split(/\s+/);

  if (parts.length === 0) return result;

  // First token should be amount (number)
  const firstPart = parts[0];
  const amount = parseFloat(firstPart);

  if (!isNaN(amount)) {
    result.amount = amount;
    parts.shift(); // Remove amount from parts
  }

  // Check for necessity keywords
  const necessityKeywords = ['necessary', 'unnecessary', 'need', 'want'];
  const necessityIndex = parts.findIndex((p) =>
    necessityKeywords.some((k) => p.includes(k))
  );

  if (necessityIndex !== -1) {
    const necessityWord = parts[necessityIndex];
    if (necessityWord.includes('unnecessary') || necessityWord.includes('want')) {
      result.necessity = 'unnecessary';
    } else {
      result.necessity = 'necessary';
    }
    parts.splice(necessityIndex, 1);
  }

  // Common mode aliases
  const modeAliases: Record<string, string> = {
    cash: 'cash',
    upi: 'upi',
    gpay: 'upi',
    phonepe: 'upi',
    paytm: 'upi',
    card: 'debit card',
    debit: 'debit card',
    credit: 'credit card',
    cc: 'credit card',
    dc: 'debit card',
    transfer: 'bank transfer',
    neft: 'bank transfer',
    imps: 'bank transfer',
  };

  // Check for mode keywords
  for (let i = parts.length - 1; i >= 0; i--) {
    const part = parts[i];
    if (modeAliases[part]) {
      result.mode = modeAliases[part];
      parts.splice(i, 1);
      break;
    }
  }

  // Common category aliases
  const categoryAliases: Record<string, string> = {
    food: 'food & dining',
    lunch: 'food & dining',
    dinner: 'food & dining',
    breakfast: 'food & dining',
    snack: 'food & dining',
    coffee: 'food & dining',
    restaurant: 'food & dining',
    zomato: 'food & dining',
    swiggy: 'food & dining',
    transport: 'transport',
    uber: 'transport',
    ola: 'transport',
    cab: 'transport',
    auto: 'transport',
    metro: 'transport',
    bus: 'transport',
    fuel: 'transport',
    petrol: 'transport',
    shopping: 'shopping',
    amazon: 'shopping',
    flipkart: 'shopping',
    clothes: 'shopping',
    bills: 'bills & utilities',
    electricity: 'bills & utilities',
    water: 'bills & utilities',
    rent: 'bills & utilities',
    internet: 'bills & utilities',
    phone: 'bills & utilities',
    mobile: 'bills & utilities',
    entertainment: 'entertainment',
    movie: 'entertainment',
    netflix: 'entertainment',
    spotify: 'entertainment',
    games: 'entertainment',
    health: 'health',
    medicine: 'health',
    doctor: 'health',
    hospital: 'health',
    pharmacy: 'health',
    gym: 'health',
    groceries: 'groceries',
    grocery: 'groceries',
    vegetables: 'groceries',
    fruits: 'groceries',
    milk: 'groceries',
    education: 'education',
    books: 'education',
    course: 'education',
    tuition: 'education',
    personal: 'personal care',
    salon: 'personal care',
    haircut: 'personal care',
  };

  // Check for category keywords
  for (let i = parts.length - 1; i >= 0; i--) {
    const part = parts[i];
    if (categoryAliases[part]) {
      result.category = categoryAliases[part];
      parts.splice(i, 1);
      break;
    }
  }

  // Check for tags (prefixed with #)
  const tags: string[] = [];
  for (let i = parts.length - 1; i >= 0; i--) {
    if (parts[i].startsWith('#')) {
      tags.unshift(parts[i].substring(1));
      parts.splice(i, 1);
    }
  }
  if (tags.length > 0) {
    result.tags = tags;
  }

  // Remaining parts form the name
  if (parts.length > 0) {
    result.name = parts.join(' ');
  }

  return result;
}

/**
 * Format amount with currency
 */
export function formatCurrency(amount: number, currency: string = '₹'): string {
  return `${currency}${amount.toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Format date for display
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Format date for input fields
 */
export function formatDateForInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
