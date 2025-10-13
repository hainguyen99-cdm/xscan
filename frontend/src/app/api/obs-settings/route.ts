import { NextRequest, NextResponse } from 'next/server';

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

// Custom body parser for handling large payloads
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

export async function GET(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json({ error: 'Authorization header required' }, { status: 401 });
    }

    console.log('🔍 Fetching OBS settings for user...');
    console.log('🌐 Backend URL:', BACKEND_URL);

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
        error: 'Backend service is not available. Please ensure the backend server is running on port 3001.',
        code: 'BACKEND_UNAVAILABLE'
      }, { status: 503 });
    }

    // First, try to get existing OBS settings
    const settingsUrl = `${BACKEND_URL}/api/obs-settings/my-settings`;
    console.log('📡 Making request to:', settingsUrl);
    
    let response = await fetch(settingsUrl, {
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
    });

    console.log(`📡 Backend response status: ${response.status}`);
    console.log(`📡 Backend response statusText: ${response.statusText}`);

    // If settings don't exist (404), create them with defaults
    if (response.status === 404) {
      console.log('⚠️ OBS settings not found, creating default settings...');
      
      // First, get the user's profile to get their id directly from backend
      console.log('👤 Getting user profile from backend to get id...');
      const profileResponse = await fetch(`${BACKEND_URL}/api/auth/profile`, {
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
        },
      });

      if (!profileResponse.ok) {
        const errorData = await profileResponse.json();
        console.error('❌ Failed to get user profile:', errorData);
        return NextResponse.json(errorData, { status: profileResponse.status });
      }

      const profileData = await profileResponse.json();
      console.log('📦 Raw profile response:', profileData);
      console.log('📦 Profile response type:', typeof profileData);
      console.log('📦 Profile response keys:', Object.keys(profileData));
      
      // Backend returns: { user: { id, ... } }
      const userId = profileData?.user?.id;
      console.log('👤 User ID for streamerId:', userId);
      console.log('🔍 Available fields in profileData:', Object.keys(profileData));
      
      // Additional debugging to see the full structure
      if (profileData.user) {
        console.log('🔍 Found nested user object:', profileData.user);
        console.log('🔍 User object keys:', Object.keys(profileData.user));
        console.log('🔍 User ID from nested object:', profileData.user.id);
      }
      
      if (!userId) {
        console.error('❌ Could not extract user ID from profile response');
        console.error('❌ Full profile response:', JSON.stringify(profileData, null, 2));
        return NextResponse.json({ 
          error: 'Could not determine user ID for OBS settings creation',
          code: 'USER_ID_MISSING'
        }, { status: 400 });
      }
      
      // Create default OBS settings
      const createResponse = await fetch(`${BACKEND_URL}/api/obs-settings`, {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          streamerId: userId, // Include the user's _id as streamerId
          imageSettings: {
            enabled: true,
            mediaType: 'image',
            width: 300,
            height: 200,
            borderRadius: 8,
            shadow: true,
            shadowColor: '#000000',
            shadowBlur: 10,
            shadowOffsetX: 2,
            shadowOffsetY: 2,
          },
          soundSettings: {
            enabled: true,
            volume: 80,
            fadeIn: 0,
            fadeOut: 0,
            loop: false,
          },
          animationSettings: {
            enabled: true,
            animationType: 'fade',
            duration: 500,
            easing: 'ease-out',
            direction: 'right',
            bounceIntensity: 20,
            zoomScale: 1.2,
          },
          styleSettings: {
            backgroundColor: '#1a1a1a',
            textColor: '#ffffff',
            accentColor: '#00ff00',
            borderColor: '#333333',
            borderWidth: 2,
            borderStyle: 'solid',
            fontFamily: 'Arial, sans-serif',
            fontSize: 16,
            fontWeight: 'normal',
            fontStyle: 'normal',
            textShadow: true,
            textShadowColor: '#000000',
            textShadowBlur: 3,
            textShadowOffsetX: 1,
            textShadowOffsetY: 1,
          },
          positionSettings: {
            x: 100,
            y: 100,
            anchor: 'top-left',
            zIndex: 1000,
            responsive: true,
            mobileScale: 0.8,
          },
          displaySettings: {
            duration: 5000,
            fadeInDuration: 300,
            fadeOutDuration: 300,
            autoHide: true,
            showProgress: false,
            progressColor: '#00ff00',
            progressHeight: 3,
          },
          generalSettings: {
            enabled: true,
            maxAlerts: 3,
            alertSpacing: 20,
            cooldown: 1000,
            priority: 'medium',
          },
          isActive: true,
        }),
      });

      console.log(`📝 Create settings response status: ${createResponse.status}`);

      if (!createResponse.ok) {
        const errorData = await createResponse.json();
        console.error('❌ Failed to create OBS settings:', errorData);
        return NextResponse.json(errorData, { status: createResponse.status });
      }

      console.log('✅ OBS settings created successfully, fetching settings...');

      // Now try to get the settings again
      response = await fetch(settingsUrl, {
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
        },
      });

      console.log(`📡 Second attempt response status: ${response.status}`);
    }

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Error response from backend:', errorData);
      console.error('❌ Response status:', response.status);
      console.error('❌ Response statusText:', response.statusText);
      
      // Handle specific error cases
      if (response.status === 403) {
        return NextResponse.json({ 
          error: 'Access denied. OBS settings are only available for streamers and administrators.',
          code: 'ACCESS_DENIED'
        }, { status: 403 });
      }
      
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    // Ensure widgetUrl is present for the frontend
    if (data && data.streamerId && data.alertToken && !data.widgetUrl) {
      data.widgetUrl = `${BACKEND_URL}/api/widget-public/alert/${data.streamerId}/${data.alertToken}`;
    }
    console.log('✅ Successfully retrieved OBS settings:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('💥 Unexpected error in OBS settings API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch OBS settings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json({ error: 'Authorization header required' }, { status: 401 });
    }

    // Get the request body
    const body = await request.json();

    // Create OBS settings
    const response = await fetch(`${BACKEND_URL}/api/obs-settings`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json();
      
      // Handle specific error cases
      if (response.status === 403) {
        return NextResponse.json({ 
          error: 'Access denied. OBS settings are only available for streamers and administrators.',
          code: 'ACCESS_DENIED'
        }, { status: 403 });
      }
      
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error creating OBS settings:', error);
    return NextResponse.json(
      { error: 'Failed to create OBS settings' },
      { status: 500 }
    );
  }
} 

export async function PATCH(request: NextRequest) {
  try {
    console.log('🚀 PATCH request received for OBS settings');
    
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json({ error: 'Authorization header required' }, { status: 401 });
    }

    // Log request details for debugging
    const contentLength = request.headers.get('content-length');
    const contentType = request.headers.get('content-type');
    console.log('📝 Request content-length header:', contentLength);
    console.log('📝 Request content-type:', contentType);
    console.log('📝 Request method:', request.method);
    console.log('📝 Request URL:', request.url);

    // Use custom body parser for large payloads
    console.log('🔄 Starting to parse request body...');
    const body = await parseBody(request);
    
    console.log('📝 Parsed request body size:', JSON.stringify(body).length, 'characters');
    console.log('📝 Body keys:', Object.keys(body));

    // Check if body is too large for backend
    const bodySize = JSON.stringify(body).length;
    if (bodySize > 5 * 1024 * 1024) { // 5MB limit for backend
      console.warn('⚠️ Body size exceeds 5MB, may cause backend issues');
    }

    // Update OBS settings
    const response = await fetch(`${BACKEND_URL}/api/obs-settings/my-settings`, {
      method: 'PATCH',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Backend response error:', response.status, errorData);
      
      // Handle specific error cases
      if (response.status === 403) {
        return NextResponse.json({ 
          error: 'Access denied. OBS settings are only available for streamers and administrators.',
          code: 'ACCESS_DENIED'
        }, { status: 403 });
      }
      
      if (response.status === 404) {
        return NextResponse.json({ 
          error: 'OBS settings not found. Please create settings first.',
          code: 'SETTINGS_NOT_FOUND'
        }, { status: 404 });
      }
      
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    console.log('✅ Backend update successful');
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Error updating OBS settings:', error);
    
    // Handle specific parsing errors
    if (error instanceof Error && error.message.includes('Failed to parse request body')) {
      return NextResponse.json({ 
        error: 'Request payload is too large or invalid. Please ensure files are under 10MB.',
        code: 'PAYLOAD_TOO_LARGE'
      }, { status: 413 });
    }
    
    return NextResponse.json(
      { error: 'Failed to update OBS settings' },
      { status: 500 }
    );
  }
} 