// ============================================
// BADGER - Trend Stability API Route
// ============================================

import { NextResponse } from 'next/server';
import { getTrendStability } from '@/lib/operations/maturityAnalytics';

export async function GET() {
  try {
    const trend = getTrendStability();
    return NextResponse.json(trend);
  } catch (error) {
    console.error('Trend stability error:', error);
    return NextResponse.json(
      { error: 'Failed to get trend stability' },
      { status: 500 }
    );
  }
}
