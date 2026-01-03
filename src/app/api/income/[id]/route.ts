// ============================================
// BADGER - Income by ID API
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { getIncomeById, updateIncome, deleteIncome } from '@/lib/operations';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const income = getIncomeById(id);

    if (!income) {
      return NextResponse.json(
        { error: 'Income not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(income);
  } catch (error) {
    console.error('Error fetching income:', error);
    return NextResponse.json(
      { error: 'Failed to fetch income' },
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

    const income = updateIncome(id, body);

    if (!income) {
      return NextResponse.json(
        { error: 'Income not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(income);
  } catch (error) {
    console.error('Error updating income:', error);
    return NextResponse.json(
      { error: 'Failed to update income' },
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
    const success = deleteIncome(id);

    if (!success) {
      return NextResponse.json(
        { error: 'Income not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting income:', error);
    return NextResponse.json(
      { error: 'Failed to delete income' },
      { status: 500 }
    );
  }
}
