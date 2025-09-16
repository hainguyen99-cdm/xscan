import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

export async function PATCH(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    
    console.log('🔍 Profile update API called');
    console.log('📡 Backend URL:', BACKEND_URL);
    console.log('🔑 Auth header present:', !!authHeader);

    if (!authHeader) {
      console.log('❌ No authorization header, returning 401');
      return NextResponse.json({ error: 'Authorization header required' }, { status: 401 });
    }

    // Get the request body
    const body = await request.json();
    console.log('📦 Update data:', body);

    // Fetch user profile update from backend
    const response = await fetch(`${BACKEND_URL}/api/users/profile/update`, {
      method: 'PATCH',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    console.log(`📡 Backend update response status: ${response.status}`);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Failed to update user profile:', errorData);
      return NextResponse.json(errorData, { status: response.status });
    }

    const responseData = await response.json();
    console.log('✅ Successfully updated user profile:', responseData);
    
    return NextResponse.json(responseData);
  } catch (error) {
    console.error('💥 Unexpected error in profile update API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

