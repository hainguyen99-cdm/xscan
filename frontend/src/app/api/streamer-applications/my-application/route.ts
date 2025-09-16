import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }

    const token = authHeader.substring(7);

    // Call backend API to get user's application
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    const fullUrl = `${backendUrl}/api/streamer-applications/my-application`;
    
    const backendResponse = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await backendResponse.json();

    if (!backendResponse.ok) {
      return NextResponse.json({ 
        message: data.message || 'Failed to fetch application' 
      }, { status: backendResponse.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Get application error:', error);
    return NextResponse.json({ 
      message: 'Internal server error' 
    }, { status: 500 });
  }
}
