// ============================================
// BADGER - Pay Statement API Route
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { markStatementPaid } from '@/lib/operations/creditCards';
import { format } from 'date-fns';

// POST /api/statements/[id]/pay - Mark statement as paid
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.accountId || typeof body.accountId !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'Account ID is required',
        },
        { status: 400 }
      );
    }

    // Use provided date or default to today
    const paidDate = body.paidDate || format(new Date(), 'yyyy-MM-dd');

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(paidDate)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid date format. Use yyyy-MM-dd',
        },
        { status: 400 }
      );
    }

    const result = markStatementPaid(params.id, paidDate, body.accountId);

    if (!result) {
      return NextResponse.json(
        {
          success: false,
          error: 'Statement not found or already paid',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Statement marked as paid successfully',
    });
  } catch (error: any) {
    console.error('Error paying statement:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to pay statement',
      },
      { status: 500 }
    );
  }
}
