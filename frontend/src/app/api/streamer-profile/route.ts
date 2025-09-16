import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');
    
    if (!username) {
      return NextResponse.json(
        { error: 'Username parameter is required' },
        { status: 400 }
      );
    }
    
    const token = request.headers.get('authorization');
    
    // Forward the request to the backend
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    const response = await fetch(`${backendUrl}/api/users/streamer/${username}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': token }),
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Streamer not found' },
          { status: 404 }
        );
      }
      throw new Error(`Backend responded with status: ${response.status}`);
    }

    const streamerData = await response.json();
    return NextResponse.json(streamerData);
    
  } catch (error) {
    console.error('Error fetching streamer profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch streamer profile' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');
    const action = searchParams.get('action');
    
    console.log('Follow request:', { username, action });
    
    if (!username || action !== 'follow') {
      return NextResponse.json(
        { error: 'Username and action=follow parameters are required' },
        { status: 400 }
      );
    }
    
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;
    
    console.log('Auth header:', authHeader);
    console.log('Token extracted:', token ? `${token.substring(0, 10)}...` : 'none');
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // First, get the streamer ID from the username
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    const streamerResponse = await fetch(`${backendUrl}/api/users/streamer/${username}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!streamerResponse.ok) {
      if (streamerResponse.status === 404) {
        return NextResponse.json(
          { error: 'Streamer not found' },
          { status: 404 }
        );
      }
      throw new Error(`Failed to get streamer info: ${streamerResponse.status}`);
    }

    const streamerData = await streamerResponse.json();
    const streamerId = streamerData.id;
    
    // Now call the follow endpoint with the streamer ID
    const followResponse = await fetch(`${backendUrl}/api/users/${streamerId}/follow`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!followResponse.ok) {
      if (followResponse.status === 404) {
        return NextResponse.json(
          { error: 'Streamer not found' },
          { status: 404 }
        );
      }
      if (followResponse.status === 401) {
        return NextResponse.json(
          { error: 'Authentication failed' },
          { status: 401 }
        );
      }
      throw new Error(`Backend responded with status: ${followResponse.status}`);
    }

    const result = await followResponse.json();
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('Error toggling follow status:', error);
    return NextResponse.json(
      { error: 'Failed to update follow status' },
      { status: 500 }
    );
  }
}
