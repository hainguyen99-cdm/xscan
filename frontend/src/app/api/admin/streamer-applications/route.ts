import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }

    const token = authHeader.substring(7);

    // Get query parameters from the request
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '10';
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    // Build query string
    const queryParams = new URLSearchParams();
    queryParams.append('page', page);
    queryParams.append('limit', limit);
    if (status) queryParams.append('status', status);
    if (search) queryParams.append('search', search);

    // Call backend API to fetch applications (correct backend endpoint)
    const backendResponse = await fetch(`${process.env.BACKEND_URL}/api/admin/streamer-applications?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await backendResponse.json();

    if (!backendResponse.ok) {
      return NextResponse.json({ 
        message: data.message || 'Failed to fetch applications' 
      }, { status: backendResponse.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Fetch streamer applications error:', error);
    return NextResponse.json({ 
      message: 'Internal server error' 
    }, { status: 500 });
  }
}
