// ============================================
// BADGER - Credit Card Statements API Route
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import {
  getCreditCardStatements,
  getUnpaidStatements,
} from '@/lib/operations/creditCards';

// GET /api/credit-cards/[id]/statements - Get statements for a credit card
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const unpaidOnly = searchParams.get('unpaidOnly') === 'true';

    const statements = unpaidOnly
      ? getUnpaidStatements(params.id)
      : getCreditCardStatements(params.id);

    return NextResponse.json({
      success: true,
      data: statements,
    });
  } catch (error: any) {
    console.error('Error fetching statements:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch statements',
      },
      { status: 500 }
    );
  }
}
