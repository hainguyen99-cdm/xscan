import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

export async function POST(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json({ error: 'Authorization header required' }, { status: 401 });
    }

    // Get the request body
    const body = await request.json();

    // Send test alert to backend using the dedicated test-alert endpoint
    const response = await fetch(`${BACKEND_URL}/api/obs-settings/my-settings/test-alert`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error testing OBS alert:', error);
    return NextResponse.json(
      { error: 'Failed to test OBS alert' },
      { status: 500 }
    );
  }
} 