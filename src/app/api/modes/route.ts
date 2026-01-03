// ============================================
// BADGER - Modes API
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { getAllModes, createMode } from '@/lib/operations';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const includeInactive = searchParams.get('includeInactive') === 'true';

    const modes = getAllModes(includeInactive);
    return NextResponse.json(modes);
  } catch (error) {
    console.error('Error fetching modes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch modes' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, isCredit, order } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    const mode = createMode({ name, isCredit, order });
    return NextResponse.json(mode, { status: 201 });
  } catch (error) {
    console.error('Error creating mode:', error);
    return NextResponse.json(
      { error: 'Failed to create mode' },
      { status: 500 }
    );
  }
}
