import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getTokenFromHeader } from '@/lib/auth/jwt';
import { db } from '@/lib/db';
import { ApiResponse, User } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = getTokenFromHeader(authHeader);

    if (!token) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'No token provided' },
        { status: 401 }
      );
    }

    const payload = await verifyToken(token);
    const user = db.getUserById(payload.userId);

    if (!user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse<User>>(
      { success: true, data: user },
      { status: 200 }
    );
  } catch (error) {
    console.error('Me error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Invalid token' },
      { status: 401 }
    );
  }
}
