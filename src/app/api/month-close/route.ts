// ============================================
// BADGER - Month Close API Route
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { getMonthClose, closeMonth, reopenMonth, isMonthClosed, getAllClosedMonths } from '@/lib/operations/monthClose';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const year = searchParams.get('year');
    const month = searchParams.get('month');
    const listAll = searchParams.get('list') === 'true';

    if (listAll) {
      const closedMonths = getAllClosedMonths();
      return NextResponse.json(closedMonths);
    }

    if (!year || !month) {
      return NextResponse.json(
        { error: 'Year and month are required' },
        { status: 400 }
      );
    }

    const monthClose = getMonthClose(parseInt(year), parseInt(month));
    return NextResponse.json(monthClose);
  } catch (error) {
    console.error('Get month close error:', error);
    return NextResponse.json(
      { error: 'Failed to get month close status' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { year, month, action } = body;

    if (!year || month === undefined || !action) {
      return NextResponse.json(
        { error: 'Year, month, and action are required' },
        { status: 400 }
      );
    }

    let result;
    if (action === 'close') {
      result = closeMonth(year, month);
    } else if (action === 'reopen') {
      result = reopenMonth(year, month);
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use "close" or "reopen"' },
        { status: 400 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Month close action error:', error);
    return NextResponse.json(
      { error: 'Failed to update month close status' },
      { status: 500 }
    );
  }
}
