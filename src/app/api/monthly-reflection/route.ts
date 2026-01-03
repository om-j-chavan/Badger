// ============================================
// BADGER - Monthly Reflection API Route
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { getMonthlyReflection, saveMonthlyReflection, getPreviousMonthReflection, hasCurrentMonthReflection, getAllReflections } from '@/lib/operations/monthlyReflection';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const year = searchParams.get('year');
    const month = searchParams.get('month');
    const type = searchParams.get('type');

    if (type === 'previous') {
      const reflection = getPreviousMonthReflection();
      return NextResponse.json(reflection);
    }

    if (type === 'check-current') {
      const hasReflection = hasCurrentMonthReflection();
      return NextResponse.json({ hasReflection });
    }

    if (type === 'all') {
      const reflections = getAllReflections();
      return NextResponse.json(reflections);
    }

    if (!year || !month) {
      return NextResponse.json(
        { error: 'Year and month are required' },
        { status: 400 }
      );
    }

    const reflection = getMonthlyReflection(parseInt(year), parseInt(month));
    return NextResponse.json(reflection);
  } catch (error) {
    console.error('Get reflection error:', error);
    return NextResponse.json(
      { error: 'Failed to get reflection' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { year, month, reflection } = body;

    if (!year || month === undefined || reflection === undefined) {
      return NextResponse.json(
        { error: 'Year, month, and reflection are required' },
        { status: 400 }
      );
    }

    const result = saveMonthlyReflection(year, month, reflection);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Save reflection error:', error);
    return NextResponse.json(
      { error: 'Failed to save reflection' },
      { status: 500 }
    );
  }
}
