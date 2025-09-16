import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function GET(_request: NextRequest, { params }: { params: { streamerId: string } }) {
  try {
    const streamerId = params?.streamerId;
    if (!streamerId) {
      return NextResponse.json({ success: false, message: 'streamerId is required' }, { status: 400 });
    }

    const url = new URL(`${BACKEND_URL}/api/donations/links`);
    url.searchParams.set('streamerId', streamerId);

    const res = await fetch(url.toString(), { method: 'GET' });
    if (!res.ok) {
      const msg = (await res.json().catch(() => ({}))).message || 'Failed to fetch donation links';
      return NextResponse.json({ success: false, message: msg }, { status: res.status || 502 });
    }

    const data = await res.json();
    return NextResponse.json({ success: true, data: data.data ?? data });
  } catch (error) {
    console.error('Error fetching streamer donation links:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}


