import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params || {};
    if (!id) {
      return NextResponse.json({ success: false, message: 'Donation link ID is required' }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));

    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ success: false, message: 'Authorization header required' }, { status: 401 });
    }
    headers['Authorization'] = authHeader;

    const res = await fetch(`${BACKEND_URL}/api/donations/links/${encodeURIComponent(id)}/analytics/donation-completed`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body || {}),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return NextResponse.json({ success: false, message: data?.message || 'Failed to track donation completed' }, { status: res.status || 500 });
    }

    return NextResponse.json({ success: true, data: data.data ?? data, message: 'Donation completed tracked' });
  } catch (error) {
    console.error('Error forwarding donation-completed analytics:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}


