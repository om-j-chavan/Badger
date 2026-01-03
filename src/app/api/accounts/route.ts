// ============================================
// BADGER - Accounts API
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { getAllAccounts, createAccount, getAllAccountBalances } from '@/lib/operations';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const includeInactive = searchParams.get('includeInactive') === 'true';
    const withBalances = searchParams.get('withBalances') === 'true';

    if (withBalances) {
      const balances = getAllAccountBalances();
      return NextResponse.json(balances);
    }

    const accounts = getAllAccounts(includeInactive);
    return NextResponse.json(accounts);
  } catch (error) {
    console.error('Error fetching accounts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch accounts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, openingBalance, order } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    const account = createAccount({ name, openingBalance, order });
    return NextResponse.json(account, { status: 201 });
  } catch (error) {
    console.error('Error creating account:', error);
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    );
  }
}
