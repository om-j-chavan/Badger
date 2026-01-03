// ============================================
// BADGER - Income API
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { getAllIncome, getIncomeForMonth, createIncome } from '@/lib/operations';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const year = searchParams.get('year');
    const month = searchParams.get('month');

    if (year && month) {
      const income = getIncomeForMonth(parseInt(year), parseInt(month));
      return NextResponse.json(income);
    }

    const income = getAllIncome();
    return NextResponse.json(income);
  } catch (error) {
    console.error('Error fetching income:', error);
    return NextResponse.json(
      { error: 'Failed to fetch income' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { date, source, amount, accountId } = body;

    if (!date || !source || amount === undefined || !accountId) {
      return NextResponse.json(
        { error: 'Date, source, amount, and accountId are required' },
        { status: 400 }
      );
    }

    const income = createIncome({ date, source, amount, accountId });
    return NextResponse.json(income, { status: 201 });
  } catch (error) {
    console.error('Error creating income:', error);
    return NextResponse.json(
      { error: 'Failed to create income' },
      { status: 500 }
    );
  }
}
