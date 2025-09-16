import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const formData = await request.formData();

    // Check if BACKEND_URL is configured
    const backendUrl = process.env.BACKEND_URL;
    if (!backendUrl) {
      console.error('BACKEND_URL environment variable is not set');
      return NextResponse.json({ 
        message: 'Backend configuration error' 
      }, { status: 500 });
    }

    console.log('Attempting to upload cover photo to backend:', `${backendUrl}/api/users/profile/cover`);

    // Forward the request to the backend
    const backendResponse = await fetch(`${backendUrl}/api/users/profile/cover`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    console.log('Backend response status:', backendResponse.status);

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      console.error('Backend error response:', errorText);
      
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: `Backend error: ${backendResponse.status} ${backendResponse.statusText}` };
      }

      return NextResponse.json({ 
        message: errorData.message || 'Failed to upload cover photo' 
      }, { status: backendResponse.status });
    }

    const data = await backendResponse.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Cover photo upload error:', error);
    
    // Check if it's a network error
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return NextResponse.json({ 
        message: 'Unable to connect to backend server. Please check your connection.' 
      }, { status: 503 });
    }
    
    return NextResponse.json({ 
      message: 'Internal server error' 
    }, { status: 500 });
  }
}
