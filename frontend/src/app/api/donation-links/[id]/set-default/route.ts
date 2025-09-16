import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const DONATION_LINKS_PATH = process.env.DONATION_LINKS_PATH || '/api/donation-links';

function buildCandidatePaths(basePath: string | null, id: string): string[] {
  const candidates: string[] = [];
  if (basePath && basePath.trim().length > 0) {
    candidates.push(`${basePath}/${id}/set-default`);
  }
  candidates.push(
    `/api/donation-links/${id}/set-default`,
    `/api/v1/donation-links/${id}/set-default`,
    `/donation-links/${id}/set-default`,
    `/api/donations/links/${id}/set-default`,
  );
  return Array.from(new Set(candidates));
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ success: false, message: 'Authorization header required' }, { status: 401 });
    }

    const id = params?.id;
    if (!id) {
      return NextResponse.json({ success: false, message: 'Donation link id is required' }, { status: 400 });
    }

    const paths = buildCandidatePaths(DONATION_LINKS_PATH, id);
    const tried: Array<{ path: string; status: number; message: string }> = [];
    for (const path of paths) {
      const res = await fetch(`${BACKEND_URL}${path}`, {
        method: 'PATCH',
        headers: { Authorization: authHeader },
      });
      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        return NextResponse.json({ success: true, data: data.data ?? data });
      }
      let msg = 'Request failed';
      try { const j = await res.json(); msg = j.message || msg; } catch {}
      tried.push({ path, status: res.status, message: msg });
      if (res.status !== 404) break;
    }
    return NextResponse.json({ success: false, message: tried[tried.length - 1]?.message || 'Failed to set default', tried }, { status: tried[tried.length - 1]?.status || 502 });
  } catch (error) {
    console.error('Error setting default donation link:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}


