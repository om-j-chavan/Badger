// ============================================
// BADGER - Bill Forecast API Route
// ============================================

import { NextResponse } from 'next/server';
import { getBillForecast } from '@/lib/operations/maturityAnalytics';

export async function GET() {
  try {
    const forecast = getBillForecast();
    return NextResponse.json(forecast);
  } catch (error) {
    console.error('Bill forecast error:', error);
    return NextResponse.json(
      { error: 'Failed to get bill forecast' },
      { status: 500 }
    );
  }
}
