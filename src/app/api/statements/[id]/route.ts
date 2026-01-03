// ============================================
// BADGER - Statement Detail API Route
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { getStatementById } from '@/lib/operations/creditCards';

// GET /api/statements/[id] - Get statement details with entries
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const statement = getStatementById(params.id);

    if (!statement) {
      return NextResponse.json(
        {
          success: false,
          error: 'Statement not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: statement,
    });
  } catch (error: any) {
    console.error('Error fetching statement:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch statement',
      },
      { status: 500 }
    );
  }
}
