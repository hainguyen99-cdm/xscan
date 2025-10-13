import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

// Resolve backend URL safely to avoid self-calls (port 3000) in local dev
const resolveBackendUrl = (): string => {
  const serverUrl = process.env.BACKEND_URL;
  const publicUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  let url = serverUrl || publicUrl || 'http://localhost:3001';
  if (url.includes('localhost:3000')) {
    url = url.replace('localhost:3000', 'localhost:3001');
  }
  return url;
};

const BACKEND_URL = resolveBackendUrl();

export async function POST(req: NextRequest) {
  try {
    console.log('🔧 POST request received for restoring optimized levels');
    
    // Get the authorization header
    const authHeader = req.headers.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json({ error: 'Authorization header required' }, { status: 401 });
    }

    const cookie = req.headers.get('cookie') || '';

    console.log('🌐 Making request to:', `${BACKEND_URL}/api/obs-settings/restore-optimized-levels`);

    const upstream = await fetch(`${BACKEND_URL}/api/obs-settings/restore-optimized-levels`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        cookie,
        authorization: authHeader,
      },
    });

    const text = await upstream.text();
    const responseContentType = upstream.headers.get('Content-Type') || 'application/json';
    
    console.log('📡 Backend response status:', upstream.status);
    console.log('📡 Backend response text length:', text.length);
    
    if (!upstream.ok) {
      console.error('❌ Backend request failed:', upstream.status, text);
      return new NextResponse(text, { 
        status: upstream.status, 
        headers: { 'Content-Type': responseContentType } 
      });
    }
    
    console.log('✅ Backend restoration successful');
    return new NextResponse(text, { 
      status: upstream.status, 
      headers: { 'Content-Type': responseContentType } 
    });
  } catch (err: unknown) {
    console.error('Error restoring optimized levels:', err);
    
    if (err instanceof Error) {
      if (err.message.includes('network') || err.message.includes('fetch')) {
        return NextResponse.json({ 
          error: 'Network error. Please check your connection and try again.',
          code: 'NETWORK_ERROR'
        }, { status: 503 });
      }
    }
    
    return NextResponse.json({ 
      error: 'Failed to restore optimized levels. Please try again.',
      code: 'RESTORE_ERROR'
    }, { status: 500 });
  }
}
