// ============================================
// BADGER - Duplicate Entry API
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { duplicateEntry } from '@/lib/operations';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const entry = duplicateEntry(id);

    if (!entry) {
      return NextResponse.json(
        { error: 'Entry not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    console.error('Error duplicating entry:', error);
    return NextResponse.json(
      { error: 'Failed to duplicate entry' },
      { status: 500 }
    );
  }
}
