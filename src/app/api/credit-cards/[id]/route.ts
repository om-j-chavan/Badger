// ============================================
// BADGER - Credit Card Detail API Route
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import {
  getCreditCardById,
  updateCreditCard,
  deleteCreditCard,
  getCreditCardSummary
} from '@/lib/operations/creditCards';

// GET /api/credit-cards/[id] - Get credit card details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const includeSummary = searchParams.get('summary') === 'true';

    if (includeSummary) {
      const summary = getCreditCardSummary(params.id);
      if (!summary) {
        return NextResponse.json(
          {
            success: false,
            error: 'Credit card not found',
          },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: summary,
      });
    }

    const creditCard = getCreditCardById(params.id);

    if (!creditCard) {
      return NextResponse.json(
        {
          success: false,
          error: 'Credit card not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: creditCard,
    });
  } catch (error: any) {
    console.error('Error fetching credit card:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch credit card',
      },
      { status: 500 }
    );
  }
}

// PATCH /api/credit-cards/[id] - Update credit card
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    // Validate fields if provided
    if (body.closingDay !== undefined) {
      if (typeof body.closingDay !== 'number' || body.closingDay < 1 || body.closingDay > 31) {
        return NextResponse.json(
          {
            success: false,
            error: 'Closing day must be between 1 and 31',
          },
          { status: 400 }
        );
      }
    }

    if (body.dueDay !== undefined) {
      if (typeof body.dueDay !== 'number' || body.dueDay < 1 || body.dueDay > 31) {
        return NextResponse.json(
          {
            success: false,
            error: 'Due day must be between 1 and 31',
          },
          { status: 400 }
        );
      }
    }

    const creditCard = updateCreditCard(params.id, body);

    if (!creditCard) {
      return NextResponse.json(
        {
          success: false,
          error: 'Credit card not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: creditCard,
    });
  } catch (error: any) {
    console.error('Error updating credit card:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to update credit card',
      },
      { status: 500 }
    );
  }
}

// DELETE /api/credit-cards/[id] - Soft delete credit card
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const result = deleteCreditCard(params.id);

    if (!result) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to delete credit card',
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Credit card deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting credit card:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to delete credit card',
      },
      { status: 500 }
    );
  }
}
