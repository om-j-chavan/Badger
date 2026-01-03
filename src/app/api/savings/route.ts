// ============================================
// BADGER - Savings API Route
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { getMonthlySavingsSummary, getSavingsTrend } from '@/lib/operations/analytics';

export const dynamic = 'force-dynamic';

// GET /api/savings - Get monthly savings summary or trend
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const year = searchParams.get('year');
    const month = searchParams.get('month');

    if (type === 'trend') {
      const months = searchParams.get('months');
      const monthsCount = months ? parseInt(months) : 6;
      const trend = getSavingsTrend(monthsCount);
      return NextResponse.json({
        success: true,
        data: trend,
      });
    }

    // Default: Get single month summary
    const now = new Date();
    const targetYear = year ? parseInt(year) : now.getFullYear();
    const targetMonth = month ? parseInt(month) : now.getMonth() + 1;

    const summary = getMonthlySavingsSummary(targetYear, targetMonth);

    return NextResponse.json({
      success: true,
      data: summary,
    });
  } catch (error: any) {
    console.error('Savings API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to get savings data',
      },
      { status: 500 }
    );
  }
}
