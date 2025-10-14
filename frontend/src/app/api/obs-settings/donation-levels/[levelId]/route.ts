import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL || 'http://localhost:3001';

export async function PUT(request: NextRequest, { params }: { params: { levelId: string } }) {
  try {
    const token = request.headers.get('authorization');
    if (!token) {
      return NextResponse.json({ error: 'Authorization token required' }, { status: 401 });
    }

    const body = await request.json();
    const response = await fetch(`${BACKEND_URL}/api/obs-settings/donation-levels/${encodeURIComponent(params.levelId)}`, {
      method: 'PUT',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json({ error: errorData.message || 'Failed to update donation level' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating donation level:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { levelId: string } }) {
  try {
    const token = request.headers.get('authorization');
    if (!token) {
      return NextResponse.json({ error: 'Authorization token required' }, { status: 401 });
    }

    const response = await fetch(`${BACKEND_URL}/api/obs-settings/donation-levels/${encodeURIComponent(params.levelId)}`, {
      method: 'DELETE',
      headers: {
        'Authorization': token,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json({ error: errorData.message || 'Failed to delete donation level' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error deleting donation level:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

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

// Custom body parser for handling large payloads (same as main obs-settings route)
async function parseBody(request: NextRequest): Promise<any> {
  try {
    const contentType = request.headers.get('content-type') || '';
    
    // For large files, use streaming parser
    if (contentType.includes('multipart/form-data')) {
      // Handle multipart form data (file uploads)
      const formData = await request.formData();
      const body: any = {};
      
      // Convert FormData entries to array for iteration
      const entries = Array.from(formData.entries());
      
      for (const [key, value] of entries) {
        if (value instanceof File) {
          // For very large files, we might want to process in chunks
          // But for now, let's try to handle the full file
          try {
            const arrayBuffer = await value.arrayBuffer();
            const base64 = Buffer.from(arrayBuffer).toString('base64');
            body[key] = {
              name: value.name,
              type: value.type,
              size: value.size,
              data: `data:${value.type};base64,${base64}`
            };
            console.log(`📁 Processed file: ${value.name}, size: ${value.size} bytes, encoded: ${base64.length} chars`);
          } catch (fileError) {
            console.error(`❌ Error processing file ${value.name}:`, fileError);
            throw new Error(`Failed to process file: ${value.name}`);
          }
        } else {
          body[key] = value;
        }
      }
      
      return body;
    } else {
      // Handle JSON payloads with size checking
      const text = await request.text();
      if (!text) return {};
      
      console.log(`📝 Raw request body size: ${text.length} characters`);
      
      // Check if the payload is too large
      if (text.length > 50 * 1024 * 1024) { // 50MB limit for frontend processing
        throw new Error('Request payload exceeds 50MB limit');
      }
      
      try {
        return JSON.parse(text);
      } catch (parseError) {
        console.error('Failed to parse JSON body:', parseError);
        throw new Error('Invalid JSON payload');
      }
    }
  } catch (error) {
    console.error('Error parsing request body:', error);
    throw error;
  }
}

export async function PUT(req: NextRequest, { params }: { params: { levelId: string } }) {
  try {
    // Decode the levelId since it's encoded in the URL
    const decodedLevelId = decodeURIComponent(params.levelId);
    console.log('🚀 PUT request received for donation level:', decodedLevelId);
    console.log('🔍 Original encoded levelId:', params.levelId);
    
    // Validate levelId format
    if (!decodedLevelId || typeof decodedLevelId !== 'string') {
      console.error('❌ Invalid levelId:', decodedLevelId);
      return NextResponse.json({ 
        error: 'Invalid level ID format',
        code: 'INVALID_LEVEL_ID'
      }, { status: 400 });
    }
    
    // Get the authorization header
    const authHeader = req.headers.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json({ error: 'Authorization header required' }, { status: 401 });
    }

    // Log request details for debugging
    const contentLength = req.headers.get('content-length');
    const requestContentType = req.headers.get('content-type');
    console.log('📝 Request content-length header:', contentLength);
    console.log('📝 Request content-type:', requestContentType);
    console.log('📝 Request method:', req.method);
    console.log('📝 Request URL:', req.url);

    // Use custom body parser for large payloads
    console.log('🔄 Starting to parse request body...');
    const body = await parseBody(req);
    
    console.log('📝 Parsed request body size:', JSON.stringify(body).length, 'characters');
    console.log('📝 Body keys:', Object.keys(body));
    console.log('📝 Body levelId:', body.levelId);
    console.log('📝 URL levelId:', decodedLevelId);
    console.log('📝 LevelId match:', body.levelId === decodedLevelId);

    // Check if body is too large for backend
    const bodySize = JSON.stringify(body).length;
    if (bodySize > 50 * 1024 * 1024) { // 50MB limit for backend
      console.warn('⚠️ Body size exceeds 50MB, may cause backend issues');
    }

    console.log('🌐 Backend URL:', BACKEND_URL);
    const cookie = req.headers.get('cookie') || '';
    
    // Test backend connectivity first
    try {
      const healthCheck = await fetch(`${BACKEND_URL}/api/health`, { 
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      console.log('🏥 Backend health check status:', healthCheck.status);
    } catch (error) {
      console.error('❌ Backend connectivity test failed:', error);
      return NextResponse.json({ 
        error: 'Backend service is not available. Please ensure the backend server is running.',
        code: 'BACKEND_UNAVAILABLE'
      }, { status: 503 });
    }

    // Add timeout and additional headers for large payloads
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 minute timeout

    console.log('🌐 Making request to:', `${BACKEND_URL}/api/obs-settings/donation-levels/${encodeURIComponent(decodedLevelId)}`);
    console.log('📝 Request body size:', JSON.stringify(body).length);
    console.log('📝 Request headers:', {
      'Content-Type': 'application/json',
      'Content-Length': JSON.stringify(body).length.toString(),
      'Authorization': authHeader ? 'Bearer [REDACTED]' : 'None',
      'Cookie': cookie ? 'Present' : 'None'
    });

    const upstream = await fetch(`${BACKEND_URL}/api/obs-settings/donation-levels/${encodeURIComponent(decodedLevelId)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': JSON.stringify(body).length.toString(),
        cookie,
        authorization: authHeader,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

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
    
    console.log('✅ Backend update successful');
    return new NextResponse(text, { 
      status: upstream.status, 
      headers: { 'Content-Type': responseContentType } 
    });
  } catch (err: unknown) {
    console.error('Error updating donation level:', err);
    
    // Handle specific parsing errors
    if (err instanceof Error && err.message.includes('Failed to parse request body')) {
      return NextResponse.json({ 
        error: 'Request payload is too large or invalid. Please ensure files are under 50MB.',
        code: 'PAYLOAD_TOO_LARGE'
      }, { status: 413 });
    }
    
    // Handle timeout errors
    if (err instanceof Error && (err.name === 'AbortError' || err.message.includes('timeout'))) {
      return NextResponse.json({ 
        error: 'Request timed out. The file may be too large or the server is busy. Please try again.',
        code: 'REQUEST_TIMEOUT'
      }, { status: 408 });
    }
    
    // Handle network errors
    if (err instanceof Error && err.message.includes('fetch')) {
      return NextResponse.json({ 
        error: 'Network error. Please check your connection and try again.',
        code: 'NETWORK_ERROR'
      }, { status: 503 });
    }
    
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}


