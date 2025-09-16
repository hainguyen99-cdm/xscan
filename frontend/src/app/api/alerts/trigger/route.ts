import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { streamerId, alertData } = body;

    if (!streamerId) {
      return NextResponse.json(
        { error: 'Streamer ID is required' },
        { status: 400 }
      );
    }

    // In a real implementation, this would:
    // 1. Validate the streamer exists
    // 2. Store the alert in a database
    // 3. Send WebSocket/SSE notification to the widget
    // 4. Trigger any external integrations

    // For now, we'll just simulate success
    console.log('Alert triggered:', { streamerId, alertData });

    return NextResponse.json({
      success: true,
      message: 'Alert triggered successfully',
      alertId: `alert_${Date.now()}`,
      streamerId,
      data: alertData
    });

  } catch (error) {
    console.error('Failed to trigger alert:', error);
    return NextResponse.json(
      { error: 'Failed to trigger alert' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Alert trigger endpoint - use POST to trigger alerts',
    endpoints: {
      trigger: 'POST /api/alerts/trigger',
      test: 'GET /widget/alert/test',
      streamer: 'GET /widget/alert/[streamerId]'
    }
  });
} 