import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

export async function GET(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    
    console.log('🔍 Auth profile API called');
    console.log('📡 Backend URL:', BACKEND_URL);
    console.log('🔑 Auth header present:', !!authHeader);
    console.log('🔑 Auth header value:', authHeader ? authHeader.substring(0, 20) + '...' : 'None');

    if (!authHeader) {
      console.log('❌ No authorization header, returning 401');
      return NextResponse.json({ error: 'Authorization header required' }, { status: 401 });
    }

    console.log('🔍 Fetching user profile...');

    // Fetch user profile from backend
    const response = await fetch(`${BACKEND_URL}/api/auth/profile`, {
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
    });

    console.log(`📡 Backend profile response status: ${response.status}`);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Failed to fetch user profile:', errorData);
      return NextResponse.json(errorData, { status: response.status });
    }

    const responseData = await response.json();
    console.log('📦 Raw backend response:', responseData);
    console.log('📦 Response data type:', typeof responseData);
    console.log('📦 Response data keys:', Object.keys(responseData));
    
    // Backend returns nested structure: { user: { id, email, role, ... } }
    // Extract the user data and flatten it for frontend consumption
    const userData = responseData.user;
    console.log('👤 Extracted userData:', userData);
    console.log('👤 UserData type:', typeof userData);
    console.log('👤 UserData keys:', userData ? Object.keys(userData) : 'null/undefined');
    
    if (!userData) {
      console.error('❌ Invalid user data structure from backend:', responseData);
      console.error('❌ Full response data:', JSON.stringify(responseData, null, 2));
      return NextResponse.json(
        { error: 'Invalid user data structure from backend' },
        { status: 500 }
      );
    }

    console.log('✅ Successfully retrieved user profile:', { 
      id: userData.id, 
      email: userData.email, 
      role: userData.role 
    });
    console.log('✅ User ID for OBS settings:', userData.id);
    
    // Return user data in the expected format with user wrapper
    return NextResponse.json({ user: userData });
  } catch (error) {
    console.error('💥 Unexpected error in auth profile API:', error);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
} 