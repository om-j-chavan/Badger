// ============================================
// BADGER - Vibe Score API Route
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { calculateVibeScore } from '@/lib/operations/analytics';

export const dynamic = 'force-dynamic';

// GET /api/vibe-score - Calculate current vibe score
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get('date');

    let date = new Date();
    if (dateParam) {
      date = new Date(dateParam);
      if (isNaN(date.getTime())) {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid date format',
          },
          { status: 400 }
        );
      }
    }

    const vibeScore = calculateVibeScore(date);

    return NextResponse.json({
      success: true,
      data: vibeScore,
    });
  } catch (error: any) {
    console.error('Error calculating vibe score:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to calculate vibe score',
      },
      { status: 500 }
    );
  }
}
