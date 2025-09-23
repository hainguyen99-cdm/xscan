import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

// POST /api/obs-settings/test-donation-level
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization');
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authorization token required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    console.log('🔄 Frontend API: Testing donation level');
    console.log('📝 Request body:', JSON.stringify(body, null, 2));

    const response = await fetch(`${BACKEND_URL}/api/obs-settings/test-donation-level`, {
      method: 'POST',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Backend error:', errorData);
      return NextResponse.json(
        { error: errorData.message || 'Failed to test donation level' },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('✅ Frontend API: Donation level test successful');
    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ Error testing donation level:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
