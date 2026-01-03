// ============================================
// BADGER - Streaks API Route
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { getStreaks } from '@/lib/operations/streaks';

// GET /api/streaks - Get current streaks
export async function GET(request: NextRequest) {
  try {
    const streaks = getStreaks();

    return NextResponse.json({
      success: true,
      data: streaks,
    });
  } catch (error: any) {
    console.error('Error fetching streaks:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch streaks',
      },
      { status: 500 }
    );
  }
}
