// ============================================
// BADGER - Subscription Alerts API Route
// ============================================

import { NextResponse } from 'next/server';
import { getSubscriptionAlerts } from '@/lib/operations/maturityAnalytics';

export async function GET() {
  try {
    const alerts = getSubscriptionAlerts();
    return NextResponse.json(alerts);
  } catch (error) {
    console.error('Subscription alerts error:', error);
    return NextResponse.json(
      { error: 'Failed to get subscription alerts' },
      { status: 500 }
    );
  }
}
