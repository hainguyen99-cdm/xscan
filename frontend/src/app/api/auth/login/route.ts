import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('🔍 Auth login API called');
    console.log('📡 Backend URL:', BACKEND_URL);
    console.log('📦 Request body:', { email: body.email, password: '[REDACTED]' });

    // Forward the login request to the backend
    const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    console.log(`📡 Backend login response status: ${response.status}`);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Login failed:', errorData);
      return NextResponse.json(errorData, { status: response.status });
    }

    const responseData = await response.json();
    console.log('✅ Login successful');
    
    return NextResponse.json(responseData);
  } catch (error) {
    console.error('💥 Unexpected error in auth login API:', error);
    return NextResponse.json(
      { error: 'Login failed due to server error' },
      { status: 500 }
    );
  }
}
