import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

const getBackendUrl = (): string => {
  return process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL || 'http://localhost:3001';
};

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
      if (text.length > 10 * 1024 * 1024) { // 10MB limit
        throw new Error('Request payload exceeds 10MB limit');
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
    console.log('🚀 PUT request received for donation level:', params.levelId);
    
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

    // Check if body is too large for backend
    const bodySize = JSON.stringify(body).length;
    if (bodySize > 5 * 1024 * 1024) { // 5MB limit for backend
      console.warn('⚠️ Body size exceeds 5MB, may cause backend issues');
    }

    const backend = getBackendUrl();
    const cookie = req.headers.get('cookie') || '';

    const upstream = await fetch(`${backend}/api/obs-settings/donation-levels/${params.levelId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        cookie,
        authorization: authHeader,
      },
      body: JSON.stringify(body),
    });

    const text = await upstream.text();
    const responseContentType = upstream.headers.get('Content-Type') || 'application/json';
    
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
        error: 'Request payload is too large or invalid. Please ensure files are under 10MB.',
        code: 'PAYLOAD_TOO_LARGE'
      }, { status: 413 });
    }
    
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}


