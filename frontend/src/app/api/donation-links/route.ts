import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const DONATION_LINKS_PATH = process.env.DONATION_LINKS_PATH || '/api/donation-links';

function buildCandidatePaths(basePath: string | null, query: string | null = null): string[] {
	const candidates: string[] = [];
	if (basePath && basePath.trim().length > 0) {
		candidates.push(`${basePath}${query ? `?${query}` : ''}`);
	}
	// Common conventions to try if explicit path not set or returns 404
	const q = query ? `?${query}` : '';
	candidates.push(
		`/api/donation-links${q}`,
		`/api/v1/donation-links${q}`,
		`/donation-links${q}`,
		`/api/donations/links${q}`,
	);
	// Remove duplicates while preserving order
	return Array.from(new Set(candidates));
}

async function forwardGet(authHeader: string, page: number, limit: number) {
	const query = `page=${page}&limit=${limit}`;
	const paths = buildCandidatePaths(DONATION_LINKS_PATH, query);
	const tried: Array<{ path: string; status: number; message: string }> = [];
	for (const p of paths) {
		const res = await fetch(`${BACKEND_URL}${p}`, { headers: { Authorization: authHeader } });
		if (res.ok) {
			const data = await res.json();
			
			// Transform the response to add 'id' field for frontend compatibility
			const transformedData = data.data ?? data;
			if (transformedData.donationLinks) {
				transformedData.donationLinks = transformedData.donationLinks.map((link: any) => ({
					...link,
					id: link._id || link.id, // Add id field for frontend compatibility
				}));
			} else if (Array.isArray(transformedData)) {
				transformedData.forEach((link: any) => {
					link.id = link._id || link.id;
				});
			}
			
			return NextResponse.json({ success: true, data: transformedData, pagination: data.pagination });
		}
		let msg = 'Request failed';
		try { const j = await res.json(); msg = j.message || msg; } catch {}
		tried.push({ path: p, status: res.status, message: msg });
		if (res.status !== 404) break;
	}
	return NextResponse.json({ success: false, message: tried[tried.length - 1]?.message || 'Failed to fetch donation links', tried }, { status: tried[tried.length - 1]?.status || 502 });
}

async function forwardPost(authHeader: string, body: any) {
	// Use only the exact working path
	const path = DONATION_LINKS_PATH;
	console.log('Sending to backend:', `${BACKEND_URL}${path}`);
	console.log('Payload being sent:', body);
	
	const res = await fetch(`${BACKEND_URL}${path}`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json', Authorization: authHeader },
		body: JSON.stringify(body),
	});
	
	if (res.ok) {
		const data = await res.json();
		return NextResponse.json({ success: true, data: data.data ?? data, message: 'Donation link created successfully' });
	}
	
	let msg = 'Request failed';
	try { const j = await res.json(); msg = j.message || msg; } catch {}
	
	return NextResponse.json({ 
		success: false, 
		message: msg, 
		pathTried: path,
		status: res.status 
	}, { status: res.status || 502 });
}

export async function GET(request: NextRequest) {
	try {
		const authHeader = request.headers.get('authorization');
		if (!authHeader) {
			return NextResponse.json({ success: false, message: 'Authorization header required' }, { status: 401 });
		}
		const { searchParams } = new URL(request.url);
		const page = parseInt(searchParams.get('page') || '1');
		const limit = parseInt(searchParams.get('limit') || '10');
		return await forwardGet(authHeader, page, limit);
	} catch (error) {
		console.error('Error fetching donation links:', error);
		return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
	}
}



export async function POST(request: NextRequest) {
	try {
		const authHeader = request.headers.get('authorization');
		if (!authHeader) {
			return NextResponse.json({ success: false, message: 'Authorization header required' }, { status: 401 });
		}
		const body = await request.json();
		if (!body?.title || !body?.customUrl) {
			return NextResponse.json({ success: false, message: 'Title and custom URL are required' }, { status: 400 });
		}
		
		// Get the current frontend domain from the request
		const host = request.headers.get('host') || 'localhost:3000';
		const protocol = request.headers.get('x-forwarded-proto') || 'http';
		const baseUrl = `${protocol}://${host}`;
		
		// Transform frontend data to match backend expectations
		const backendPayload: any = {
			title: body.title,
			description: body.description || '',
			customUrl: body.customUrl, // Send the slug as customUrl
			slug: body.customUrl, // Also send as slug
			theme: body.theme || {}
		};
		
		// Remove streamerId completely - backend doesn't want it
		// try {
		// 	const profileRes = await fetch(`${BACKEND_URL}/api/auth/profile`, { headers: { Authorization: authHeader, 'Content-Type': 'application/json' } });
		// 	if (profileRes.ok) {
		// 		const profile = await profileRes.json();
		// 		const uid = (profile?.user?.id) || profile?.id;
		// 		if (uid) backendPayload.streamerId = uid;
		// 	}
		// } catch {}
		
		console.log('Frontend payload:', body);
		console.log('Backend payload:', backendPayload);
		console.log('Base URL:', baseUrl);
		
		return await forwardPost(authHeader, backendPayload);
	} catch (error) {
		console.error('Error creating donation link:', error);
		return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
	}
} 

export async function PATCH(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ success: false, message: 'Authorization header required' }, { status: 401 });
    }
    const { id, action } = await request.json().catch(() => ({}));
    if (!id || action !== 'set-default') {
      return NextResponse.json({ success: false, message: 'Invalid request' }, { status: 400 });
    }

    const path = `${DONATION_LINKS_PATH}/${id}/set-default`;
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
    return NextResponse.json({ success: false, message: msg }, { status: res.status || 502 });
  } catch (error) {
    console.error('Error setting default donation link:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}