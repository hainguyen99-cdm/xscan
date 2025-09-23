import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    console.log('🔍 Frontend API: Getting settings behavior from:', `${BACKEND_URL}/api/obs-settings/settings-behavior`);

    const response = await fetch(`${BACKEND_URL}/api/obs-settings/settings-behavior`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('📡 Frontend API: Response status:', response.status);
    console.log('📡 Frontend API: Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const responseText = await response.text();
      console.error('❌ Frontend API: Error response:', responseText);
      
      try {
        const errorData = JSON.parse(responseText);
        return NextResponse.json({ error: errorData.message || 'Failed to get settings behavior' }, { status: response.status });
      } catch (parseError) {
        return NextResponse.json({ 
          error: `Backend error (${response.status}): ${responseText.substring(0, 200)}` 
        }, { status: response.status });
      }
    }

    const data = await response.json();
    console.log('✅ Frontend API: Success response:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ Frontend API: Error getting settings behavior:', error);
    return NextResponse.json({ 
      error: `Connection error: ${error.message}` 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const body = await request.json();
    console.log('🔍 Frontend API: Updating settings behavior with:', body);
    
    if (!body.settingsBehavior || !['auto', 'basic', 'donation-levels'].includes(body.settingsBehavior)) {
      return NextResponse.json({ error: 'Invalid settings behavior value' }, { status: 400 });
    }

    console.log('🔍 Frontend API: Sending request to:', `${BACKEND_URL}/api/obs-settings/settings-behavior`);

    const response = await fetch(`${BACKEND_URL}/api/obs-settings/settings-behavior`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    console.log('📡 Frontend API: Response status:', response.status);
    console.log('📡 Frontend API: Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const responseText = await response.text();
      console.error('❌ Frontend API: Error response:', responseText);
      
      try {
        const errorData = JSON.parse(responseText);
        return NextResponse.json({ error: errorData.message || 'Failed to update settings behavior' }, { status: response.status });
      } catch (parseError) {
        return NextResponse.json({ 
          error: `Backend error (${response.status}): ${responseText.substring(0, 200)}` 
        }, { status: response.status });
      }
    }

    const data = await response.json();
    console.log('✅ Frontend API: Success response:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ Frontend API: Error updating settings behavior:', error);
    return NextResponse.json({ 
      error: `Connection error: ${error.message}` 
    }, { status: 500 });
  }
}
