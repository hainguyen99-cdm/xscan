import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ success: false, message: 'Authorization header required' }, { status: 401 });
    }

    const { id } = params;
    if (!id) {
      return NextResponse.json({ success: false, message: 'Donation link ID is required' }, { status: 400 });
    }

    // Try the new donation-links endpoint first, then fallback to donations/links
    const paths = [
      `/api/donation-links/${id}`,
      `/api/donations/links/${id}`,
    ];

    for (const path of paths) {
      try {
        const res = await fetch(`${BACKEND_URL}${path}`, {
          method: 'DELETE',
          headers: { Authorization: authHeader },
        });

        if (res.ok) {
          return NextResponse.json({ success: true, message: 'Donation link deleted successfully' });
        }

        if (res.status !== 404) {
          let msg = 'Request failed';
          try { const j = await res.json(); msg = j.message || msg; } catch {}
          return NextResponse.json({ success: false, message: msg }, { status: res.status });
        }
      } catch (error) {
        console.error(`Error trying path ${path}:`, error);
      }
    }

    return NextResponse.json({ success: false, message: 'Donation link not found' }, { status: 404 });
  } catch (error) {
    console.error('Error deleting donation link:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ success: false, message: 'Authorization header required' }, { status: 401 });
    }

    const { id } = params;
    if (!id) {
      return NextResponse.json({ success: false, message: 'Donation link ID is required' }, { status: 400 });
    }

    // Try the new donation-links endpoint first, then fallback to donations/links
    const paths = [
      `/api/donation-links/${id}`,
      `/api/donations/links/${id}`,
    ];

    for (const path of paths) {
      try {
        const res = await fetch(`${BACKEND_URL}${path}`, {
          headers: { Authorization: authHeader },
        });

        if (res.ok) {
          const data = await res.json();
          // Transform the response to add 'id' field for frontend compatibility
          const transformedData = data.data ?? data;
          if (transformedData) {
            transformedData.id = transformedData._id || transformedData.id;
          }
          return NextResponse.json({ success: true, data: transformedData });
        }

        if (res.status !== 404) {
          let msg = 'Request failed';
          try { const j = await res.json(); msg = j.message || msg; } catch {}
          return NextResponse.json({ success: false, message: msg }, { status: res.status });
        }
      } catch (error) {
        console.error(`Error trying path ${path}:`, error);
      }
    }

    return NextResponse.json({ success: false, message: 'Donation link not found' }, { status: 404 });
  } catch (error) {
    console.error('Error fetching donation link:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ success: false, message: 'Authorization header required' }, { status: 401 });
    }

    const { id } = params;
    if (!id) {
      return NextResponse.json({ success: false, message: 'Donation link ID is required' }, { status: 400 });
    }

    const body = await request.json();

    // Try the new donation-links endpoint first, then fallback to donations/links
    const paths = [
      `/api/donation-links/${id}`,
      `/api/donations/links/${id}`,
    ];

    for (const path of paths) {
      try {
        const res = await fetch(`${BACKEND_URL}${path}`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json', 
            Authorization: authHeader 
          },
          body: JSON.stringify(body),
        });

        if (res.ok) {
          const data = await res.json();
          // Transform the response to add 'id' field for frontend compatibility
          const transformedData = data.data ?? data;
          if (transformedData) {
            transformedData.id = transformedData._id || transformedData.id;
          }
          return NextResponse.json({ success: true, data: transformedData, message: data.message || 'Donation link updated successfully' });
        }

        if (res.status !== 404) {
          let msg = 'Request failed';
          try { const j = await res.json(); msg = j.message || msg; } catch {}
          return NextResponse.json({ success: false, message: msg }, { status: res.status });
        }
      } catch (error) {
        console.error(`Error trying path ${path}:`, error);
      }
    }

    return NextResponse.json({ success: false, message: 'Donation link not found' }, { status: 404 });
  } catch (error) {
    console.error('Error updating donation link:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
