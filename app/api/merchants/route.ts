import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ApiResponse, Merchant } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const radius = searchParams.get('radius');

    if (lat && lng) {
      const merchants = db.getNearbyMerchants(
        parseFloat(lat),
        parseFloat(lng),
        radius ? parseInt(radius) : 5000
      );

      return NextResponse.json<ApiResponse<Merchant[]>>(
        { success: true, data: merchants },
        { status: 200 }
      );
    }

    const merchants = db.getAllMerchants();

    return NextResponse.json<ApiResponse<Merchant[]>>(
      { success: true, data: merchants },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get merchants error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
