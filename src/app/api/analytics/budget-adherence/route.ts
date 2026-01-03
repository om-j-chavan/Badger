// ============================================
// BADGER - Budget Adherence API Route
// ============================================

import { NextResponse } from 'next/server';
import { getBudgetAdherence } from '@/lib/operations/maturityAnalytics';

export async function GET() {
  try {
    const adherence = getBudgetAdherence();
    return NextResponse.json(adherence);
  } catch (error) {
    console.error('Budget adherence error:', error);
    return NextResponse.json(
      { error: 'Failed to get budget adherence' },
      { status: 500 }
    );
  }
}
