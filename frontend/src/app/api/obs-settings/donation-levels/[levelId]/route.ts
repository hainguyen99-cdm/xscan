import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

const getBackendUrl = (): string => {
  return process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL || 'http://localhost:3001';
};

export async function PUT(req: NextRequest, { params }: { params: { levelId: string } }) {
  try {
    const backend = getBackendUrl();
    const body = await req.json();
    const cookie = req.headers.get('cookie') || '';
    const authorization = req.headers.get('authorization') || '';

    const upstream = await fetch(`${backend}/api/obs-settings/donation-levels/${params.levelId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        cookie,
        authorization,
      },
      body: JSON.stringify(body),
    });

    const text = await upstream.text();
    const contentType = upstream.headers.get('Content-Type') || 'application/json';
    return new NextResponse(text, { status: upstream.status, headers: { 'Content-Type': contentType } });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}


