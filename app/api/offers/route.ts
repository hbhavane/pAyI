import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ApiResponse, CardOffer } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cardId = searchParams.get('cardId');

    if (!cardId) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Card ID is required' },
        { status: 400 }
      );
    }

    const offers = db.getActiveOffersForCard(cardId);

    return NextResponse.json<ApiResponse<CardOffer[]>>(
      { success: true, data: offers },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get offers error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
