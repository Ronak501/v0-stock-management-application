import { NextRequest, NextResponse } from 'next/server';
import { removeTokenCookie } from '@/lib/auth/jwt';

export async function POST(request: NextRequest) {
  try {
    await removeTokenCookie();

    return NextResponse.json(
      { success: true, message: 'Logout successful' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
