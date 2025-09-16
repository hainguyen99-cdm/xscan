import { NextRequest, NextResponse } from 'next/server';
import { getStoredToken } from '@/lib/api';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const body = await request.json();

    // Validate required fields
    const stringFields = [
      'username', 'displayName', 'email', 'platform', 'channelUrl', 
      'description', 'contentCategory', 'reasonForApplying'
    ];
    
    const numberFields = ['monthlyViewers'];

    // Validate string fields
    for (const field of stringFields) {
      if (!body[field] || (typeof body[field] === 'string' && body[field].trim() === '')) {
        return NextResponse.json({ 
          message: `Missing required field: ${field}` 
        }, { status: 400 });
      }
    }

    // Validate number fields
    for (const field of numberFields) {
      if (body[field] === undefined || body[field] === null) {
        return NextResponse.json({ 
          message: `Missing required field: ${field}` 
        }, { status: 400 });
      }
      
      // Ensure it's a number and not negative
      const numValue = Number(body[field]);
      if (isNaN(numValue) || numValue < 0) {
        return NextResponse.json({ 
          message: `Invalid value for field: ${field}. Must be a non-negative number.` 
        }, { status: 400 });
      }
    }

    // Call backend API to submit registration (DB-backed)
    const backendResponse = await fetch(`${process.env.BACKEND_URL}/api/streamer-applications/apply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    const data = await backendResponse.json();

    if (!backendResponse.ok) {
      return NextResponse.json({ 
        message: data.message || 'Failed to submit registration' 
      }, { status: backendResponse.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Streamer registration error:', error);
    return NextResponse.json({ 
      message: 'Internal server error' 
    }, { status: 500 });
  }
}
