import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ApiResponse, CreditCard } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const cards = db.getAllCards();
    
    return NextResponse.json<ApiResponse<CreditCard[]>>(
      { success: true, data: cards },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get all cards error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
