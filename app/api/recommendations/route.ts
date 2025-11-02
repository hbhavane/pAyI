import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getTokenFromHeader } from '@/lib/auth/jwt';
import { recommendationEngine } from '@/lib/ai/recommendation-engine';
import { ApiResponse, CardRecommendation, RecommendationRequest } from '@/types';

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
    const body = await request.json();

    const recommendationRequest: RecommendationRequest = {
      userId: payload.userId,
      merchantId: body.merchantId,
      transactionAmount: body.transactionAmount || 100,
      location: body.location,
    };

    if (!recommendationRequest.merchantId || !recommendationRequest.location) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const recommendations = await recommendationEngine.getRecommendation(
      recommendationRequest
    );

    return NextResponse.json<ApiResponse<CardRecommendation[]>>(
      { success: true, data: recommendations },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get recommendations error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
