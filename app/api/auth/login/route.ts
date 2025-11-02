import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyPassword, generateToken } from '@/lib/auth/jwt';
import { LoginCredentials, ApiResponse, AuthResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body: LoginCredentials = await request.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Missing email or password' },
        { status: 400 }
      );
    }

    // Find user
    const user = db.getUserByEmail(email);
    if (!user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Verify password
    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Generate token
    const { password: _, ...userWithoutPassword } = user;
    const token = await generateToken(userWithoutPassword);

    const response: AuthResponse = { 
      user: userWithoutPassword, 
      token 
    };

    return NextResponse.json<ApiResponse<AuthResponse>>(
      { success: true, data: response },
      { status: 200 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
