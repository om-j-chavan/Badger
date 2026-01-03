// ============================================
// BADGER - Expenses API
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { getExpensesForMonth, getExpenseWithEntries, createEntry } from '@/lib/operations';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get('date');
    const year = searchParams.get('year');
    const month = searchParams.get('month');

    // Get expense for specific date
    if (date) {
      const expense = getExpenseWithEntries(date);
      return NextResponse.json(expense || { entries: [], totalAmount: 0, unnecessaryAmount: 0, openAmount: 0 });
    }

    // Get expenses for month
    if (year && month) {
      const expenses = getExpensesForMonth(parseInt(year), parseInt(month));
      return NextResponse.json(expenses);
    }

    // Default: current month
    const now = new Date();
    const expenses = getExpensesForMonth(now.getFullYear(), now.getMonth());
    return NextResponse.json(expenses);
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch expenses' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { date, entry } = body;

    if (!date || !entry) {
      return NextResponse.json(
        { error: 'Date and entry are required' },
        { status: 400 }
      );
    }

    const { name, amount, modeId, categoryId, necessity, status, expectedClosure, accountId, tags, type, mood, regret } = entry;

    if (!name || amount === undefined || !modeId || !categoryId || !accountId) {
      return NextResponse.json(
        { error: 'Missing required entry fields' },
        { status: 400 }
      );
    }

    const newEntry = createEntry(date, {
      name,
      amount,
      modeId,
      categoryId,
      necessity: necessity || 'necessary',
      status: status || 'closed',
      expectedClosure: expectedClosure || null,
      accountId,
      tags: tags || [],
      type: type || 'expense',
      mood: mood || null,
      regret: regret || false,
    });

    return NextResponse.json(newEntry, { status: 201 });
  } catch (error) {
    console.error('Error creating entry:', error);
    return NextResponse.json(
      { error: 'Failed to create entry' },
      { status: 500 }
    );
  }
}
