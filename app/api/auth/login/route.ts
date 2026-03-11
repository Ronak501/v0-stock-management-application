import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connection';
import User from '@/lib/db/models/User';
import { generateToken, setTokenCookie } from '@/lib/auth/jwt';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user and include password field
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Compare passwords
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Generate token
    const token = await generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    // Set token in cookie
    await setTokenCookie(token);

    return NextResponse.json(
      {
        success: true,
        message: 'Login successful',
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
        },
        token,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
