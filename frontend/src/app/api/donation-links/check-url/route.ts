import { NextRequest, NextResponse } from 'next/server';
import { getStoredToken } from '@/lib/api';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { success: false, message: 'Authorization header required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');

    if (!url) {
      return NextResponse.json(
        { success: false, message: 'URL parameter is required' },
        { status: 400 }
      );
    }

    // Validate URL format
    if (!/^[a-zA-Z0-9-]+$/.test(url)) {
      return NextResponse.json(
        { success: false, message: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // Check URL availability in backend
    const response = await fetch(
      `${BACKEND_URL}/api/donation-links/check-url?url=${encodeURIComponent(url)}`,
      {
        headers: {
          'Authorization': authHeader,
        },
      }
    );

    if (!response.ok) {
      // If backend doesn't have this endpoint yet, we'll do a basic check
      // by trying to fetch existing donation links
      const existingLinksResponse = await fetch(
        `${BACKEND_URL}/api/donation-links?limit=1000`,
        {
          headers: {
            'Authorization': authHeader,
          },
        }
      );

      if (existingLinksResponse.ok) {
        const existingLinks = await existingLinksResponse.json();
        const isTaken = existingLinks.data?.some((link: any) => 
          link.customUrl === url || link.slug === url
        );

        return NextResponse.json({
          success: true,
          available: !isTaken,
          message: isTaken ? 'URL is already taken' : 'URL is available',
        });
      }

      // If we can't check, assume it's available
      return NextResponse.json({
        success: true,
        available: true,
        message: 'URL appears to be available',
      });
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      available: data.available,
      message: data.message || (data.available ? 'URL is available' : 'URL is already taken'),
    });

  } catch (error) {
    console.error('Error checking URL availability:', error);
    
    // In case of error, we'll do a basic check by looking at existing links
    try {
      const authHeader = request.headers.get('authorization');
      if (authHeader) {
        const existingLinksResponse = await fetch(
          `${BACKEND_URL}/api/donation-links?limit=1000`,
          {
            headers: {
              'Authorization': authHeader,
            },
          }
        );

        if (existingLinksResponse.ok) {
          const existingLinks = await existingLinksResponse.json();
          const url = new URL(request.url).searchParams.get('url');
          const isTaken = existingLinks.data?.some((link: any) => 
            link.customUrl === url || link.slug === url
          );

          return NextResponse.json({
            success: true,
            available: !isTaken,
            message: isTaken ? 'URL is already taken' : 'URL is available',
          });
        }
      }
    } catch (fallbackError) {
      console.error('Fallback URL check failed:', fallbackError);
    }

    return NextResponse.json(
      { success: false, message: 'Failed to check URL availability' },
      { status: 500 }
    );
  }
} 