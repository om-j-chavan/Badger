// ============================================
// BADGER - Credit Cards API Route
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { getAllCreditCards, createCreditCard } from '@/lib/operations/creditCards';

// GET /api/credit-cards - List all credit cards
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get('includeInactive') === 'true';

    const creditCards = getAllCreditCards(includeInactive);

    return NextResponse.json({
      success: true,
      data: creditCards,
    });
  } catch (error: any) {
    console.error('Error fetching credit cards:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch credit cards',
      },
      { status: 500 }
    );
  }
}

// POST /api/credit-cards - Create new credit card
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.name || typeof body.name !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'Name is required',
        },
        { status: 400 }
      );
    }

    if (!body.closingDay || typeof body.closingDay !== 'number' || body.closingDay < 1 || body.closingDay > 31) {
      return NextResponse.json(
        {
          success: false,
          error: 'Closing day must be between 1 and 31',
        },
        { status: 400 }
      );
    }

    if (!body.dueDay || typeof body.dueDay !== 'number' || body.dueDay < 1 || body.dueDay > 31) {
      return NextResponse.json(
        {
          success: false,
          error: 'Due day must be between 1 and 31',
        },
        { status: 400 }
      );
    }

    const creditCard = createCreditCard({
      name: body.name,
      closingDay: body.closingDay,
      dueDay: body.dueDay,
    });

    return NextResponse.json({
      success: true,
      data: creditCard,
    });
  } catch (error: any) {
    console.error('Error creating credit card:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to create credit card',
      },
      { status: 500 }
    );
  }
}
