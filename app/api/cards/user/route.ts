import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getTokenFromHeader } from '@/lib/auth/jwt';
import { db } from '@/lib/db';
import { ApiResponse, CreditCard } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = getTokenFromHeader(authHeader);

    if (!token) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const payload = await verifyToken(token);
    const cards = db.getUserCards(payload.userId);

    return NextResponse.json<ApiResponse<CreditCard[]>>(
      { success: true, data: cards },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get user cards error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = getTokenFromHeader(authHeader);

    if (!token) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const payload = await verifyToken(token);
    const { cardId, nickname } = await request.json();

    if (!cardId) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Card ID is required' },
        { status: 400 }
      );
    }

    const userCard = db.addUserCard(payload.userId, cardId, nickname);

    return NextResponse.json<ApiResponse>(
      { success: true, data: userCard, message: 'Card added successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Add user card error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = getTokenFromHeader(authHeader);

    if (!token) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const payload = await verifyToken(token);
    const { searchParams } = new URL(request.url);
    const cardId = searchParams.get('cardId');

    if (!cardId) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Card ID is required' },
        { status: 400 }
      );
    }

    const removed = db.removeUserCard(payload.userId, cardId);

    if (!removed) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Card not found in user portfolio' },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse>(
      { success: true, message: 'Card removed successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Remove user card error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
