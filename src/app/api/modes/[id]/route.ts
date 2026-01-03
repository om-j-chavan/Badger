// ============================================
// BADGER - Mode by ID API
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { getModeById, updateMode, deleteMode } from '@/lib/operations';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const mode = getModeById(id);

    if (!mode) {
      return NextResponse.json(
        { error: 'Mode not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(mode);
  } catch (error) {
    console.error('Error fetching mode:', error);
    return NextResponse.json(
      { error: 'Failed to fetch mode' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const mode = updateMode(id, body);

    if (!mode) {
      return NextResponse.json(
        { error: 'Mode not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(mode);
  } catch (error) {
    console.error('Error updating mode:', error);
    return NextResponse.json(
      { error: 'Failed to update mode' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const success = deleteMode(id);

    if (!success) {
      return NextResponse.json(
        { error: 'Mode not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting mode:', error);
    return NextResponse.json(
      { error: 'Failed to delete mode' },
      { status: 500 }
    );
  }
}
