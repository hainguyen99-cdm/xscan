import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('🔍 Auth register API called');
    console.log('📡 Backend URL:', BACKEND_URL);
    console.log('📦 Request body:', body);

    // Forward the registration request to the backend
    const response = await fetch(`${BACKEND_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    console.log(`📡 Backend register response status: ${response.status}`);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Registration failed:', errorData);
      return NextResponse.json(errorData, { status: response.status });
    }

    const responseData = await response.json();
    console.log('✅ Registration successful');
    
    return NextResponse.json(responseData);
  } catch (error) {
    console.error('💥 Unexpected error in auth register API:', error);
    return NextResponse.json(
      { error: 'Registration failed due to server error' },
      { status: 500 }
    );
  }
}
