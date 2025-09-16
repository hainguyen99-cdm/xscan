import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const body = await request.json();
    const { action, notes } = body;

    // Validate action
    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ 
        message: 'Invalid action. Must be "approve" or "reject"' 
      }, { status: 400 });
    }

    // Call backend API to review application (correct backend endpoint)
    const backendResponse = await fetch(`${process.env.BACKEND_URL}/api/admin/streamer-applications/${params.id}/review`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ action, notes }),
    });

    const data = await backendResponse.json();

    if (!backendResponse.ok) {
      return NextResponse.json({ 
        message: data.message || 'Failed to process application' 
      }, { status: backendResponse.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Review streamer application error:', error);
    return NextResponse.json({ 
      message: 'Internal server error' 
    }, { status: 500 });
  }
}
