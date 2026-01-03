// ============================================
// BADGER - Cut Analysis API Route
// ============================================

import { NextResponse } from 'next/server';
import { getCutAnalysis } from '@/lib/operations/maturityAnalytics';

export async function GET() {
  try {
    const analysis = getCutAnalysis();
    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Cut analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to get cut analysis' },
      { status: 500 }
    );
  }
}
