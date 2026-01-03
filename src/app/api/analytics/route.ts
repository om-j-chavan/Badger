// ============================================
// BADGER - Analytics API
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import {
  getCategorySpendBreakdown,
  getWeeklySummary,
  getMonthlySummaries,
  getWarnings,
  getDailySpending,
  getExpenseTrends,
} from '@/lib/operations';
import { format, startOfMonth, endOfMonth } from 'date-fns';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type');
    const year = searchParams.get('year');
    const month = searchParams.get('month');

    switch (type) {
      case 'category-breakdown': {
        // Get category breakdown for a month
        const now = new Date();
        const targetYear = year ? parseInt(year) : now.getFullYear();
        const targetMonth = month ? parseInt(month) : now.getMonth();

        const startDate = format(
          startOfMonth(new Date(targetYear, targetMonth)),
          'yyyy-MM-dd'
        );
        const endDate = format(
          endOfMonth(new Date(targetYear, targetMonth)),
          'yyyy-MM-dd'
        );

        const breakdown = getCategorySpendBreakdown(startDate, endDate);
        return NextResponse.json(breakdown);
      }

      case 'weekly-summary': {
        const summary = getWeeklySummary();
        return NextResponse.json(summary);
      }

      case 'monthly-summaries': {
        const months = searchParams.get('months');
        const summaries = getMonthlySummaries(months ? parseInt(months) : 6);
        return NextResponse.json(summaries);
      }

      case 'warnings': {
        const warnings = getWarnings();
        return NextResponse.json(warnings);
      }

      case 'daily-spending': {
        const now = new Date();
        const targetYear = year ? parseInt(year) : now.getFullYear();
        const targetMonth = month ? parseInt(month) : now.getMonth();

        const spending = getDailySpending(targetYear, targetMonth);
        return NextResponse.json(spending);
      }

      case 'trends': {
        const trends = getExpenseTrends();
        return NextResponse.json(trends);
      }

      default: {
        // Return all analytics
        const now = new Date();
        const targetYear = year ? parseInt(year) : now.getFullYear();
        const targetMonth = month ? parseInt(month) : now.getMonth();

        const startDate = format(
          startOfMonth(new Date(targetYear, targetMonth)),
          'yyyy-MM-dd'
        );
        const endDate = format(
          endOfMonth(new Date(targetYear, targetMonth)),
          'yyyy-MM-dd'
        );

        const [
          categoryBreakdown,
          weeklySummary,
          monthlySummaries,
          warnings,
          dailySpending,
          trends,
        ] = await Promise.all([
          getCategorySpendBreakdown(startDate, endDate),
          getWeeklySummary(),
          getMonthlySummaries(6),
          getWarnings(),
          getDailySpending(targetYear, targetMonth),
          getExpenseTrends(),
        ]);

        return NextResponse.json({
          categoryBreakdown,
          weeklySummary,
          monthlySummaries,
          warnings,
          dailySpending,
          trends,
        });
      }
    }
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
