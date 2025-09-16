import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Get auth token from cookies (optional for donations)
    const authToken = request.cookies.get('auth-token')?.value;
    
    // Call the backend API to process donation
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    // Add authorization header if token exists
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }
    
    const response = await fetch(`${BACKEND_URL}/api/donations/process`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { 
          success: false, 
          message: errorData.message || 'Failed to process donation',
          status: response.status 
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      data: data.data,
      message: 'Donation processed successfully'
    });

  } catch (error) {
    console.error('Error processing donation:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}