// ============================================
// BADGER - Liabilities API (Open Entries)
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { getOpenEntries } from '@/lib/operations';

export async function GET(request: NextRequest) {
  try {
    const entries = getOpenEntries();
    return NextResponse.json(entries);
  } catch (error) {
    console.error('Error fetching liabilities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch liabilities' },
      { status: 500 }
    );
  }
}
