'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { showToast } from '@/components/ui/toast';

interface AnalyticsSummary {
  summary: {
    totalEvents: number;
    totalDays: number;
    averageEventsPerDay: number;
  };
  dailyEvents: Array<{
    _id: string;
    events: Array<{
      eventType: string;
      count: number;
    }>;
    totalEvents: number;
  }>;
  eventTypeBreakdown: Array<{
    _id: string;
    count: number;
  }>;
  deviceBreakdown: Array<{
    _id: string;
    count: number;
  }>;
  browserBreakdown: Array<{
    _id: string;
    count: number;
  }>;
}

interface RealTimeAnalytics {
  lastHour: number;
  last24Hours: number;
  currentVisitors: number;
  timestamp: string;
}

interface AnalyticsDashboardProps {
  donationLinkId: string;
  accessToken: string;
}

export function AnalyticsDashboard({ donationLinkId, accessToken }: AnalyticsDashboardProps) {
  const [analyticsSummary, setAnalyticsSummary] = useState<AnalyticsSummary | null>(null);
  const [realTimeAnalytics, setRealTimeAnalytics] = useState<RealTimeAnalytics | null>(null);
  const [timeRange, setTimeRange] = useState<number>(30);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingRealTime, setIsLoadingRealTime] = useState(false);

  const fetchAnalyticsSummary = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/donations/links/${donationLinkId}/analytics/summary?days=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }

      const data = await response.json();
      setAnalyticsSummary(data.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      showToast({
        type: 'error',
        title: 'Analytics Error',
        message: 'Failed to load analytics data',
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRealTimeAnalytics = async () => {
    try {
      setIsLoadingRealTime(true);
      const response = await fetch(`/api/donations/links/${donationLinkId}/analytics/realtime`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch real-time analytics');
      }

      const data = await response.json();
      setRealTimeAnalytics(data.data);
    } catch (error) {
      console.error('Error fetching real-time analytics:', error);
    } finally {
      setIsLoadingRealTime(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsSummary();
  }, [timeRange, donationLinkId]);

  useEffect(() => {
    // Fetch real-time analytics every 30 seconds
    fetchRealTimeAnalytics();
    const interval = setInterval(fetchRealTimeAnalytics, 30000);
    return () => clearInterval(interval);
  }, [donationLinkId]);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const getEventTypeColor = (eventType: string): string => {
    const colors: Record<string, string> = {
      'page_view': 'bg-blue-500',
      'donation_started': 'bg-yellow-500',
      'donation_completed': 'bg-green-500',
      'qr_code_scanned': 'bg-purple-500',
      'social_share': 'bg-pink-500',
      'link_clicked': 'bg-indigo-500',
    };
    return colors[eventType] || 'bg-gray-500';
  };

  const getEventTypeLabel = (eventType: string): string => {
    const labels: Record<string, string> = {
      'page_view': 'Page Views',
      'donation_started': 'Donations Started',
      'donation_completed': 'Donations Completed',
      'qr_code_scanned': 'QR Code Scans',
      'social_share': 'Social Shares',
      'link_clicked': 'Link Clicks',
    };
    return labels[eventType] || eventType;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600">Track your donation link performance</p>
        </div>
        <div className="flex items-center space-x-3">
          <Select value={timeRange.toString()} onValueChange={(value) => setTimeRange(Number(value))}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={fetchAnalyticsSummary} variant="outline">
            Refresh
          </Button>
        </div>
      </div>

      {/* Real-time Stats */}
      {realTimeAnalytics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Last Hour</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(realTimeAnalytics.lastHour)}</div>
              <p className="text-xs text-gray-500">events</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Last 24 Hours</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(realTimeAnalytics.last24Hours)}</div>
              <p className="text-xs text-gray-500">events</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Current Visitors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{realTimeAnalytics.currentVisitors}</div>
              <p className="text-xs text-gray-500">active now</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Summary Stats */}
      {analyticsSummary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(analyticsSummary.summary.totalEvents)}</div>
              <p className="text-xs text-gray-500">in {analyticsSummary.summary.totalDays} days</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Average Events/Day</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsSummary.summary.averageEventsPerDay.toFixed(1)}</div>
              <p className="text-xs text-gray-500">events per day</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Time Range</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{timeRange}</div>
              <p className="text-xs text-gray-500">days analyzed</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Event Type Breakdown */}
      {analyticsSummary && (
        <Card>
          <CardHeader>
            <CardTitle>Event Type Breakdown</CardTitle>
            <CardDescription>Distribution of different types of events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analyticsSummary.eventTypeBreakdown.map((event) => (
                <div key={event._id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${getEventTypeColor(event._id)}`} />
                    <span className="text-sm font-medium">{getEventTypeLabel(event._id)}</span>
                  </div>
                  <span className="text-sm text-gray-600">{formatNumber(event.count)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Device & Browser Breakdown */}
      {analyticsSummary && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Device Types</CardTitle>
              <CardDescription>Traffic by device category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analyticsSummary.deviceBreakdown.map((device) => (
                  <div key={device._id} className="flex items-center justify-between">
                    <span className="text-sm font-medium capitalize">{device._id}</span>
                    <span className="text-sm text-gray-600">{formatNumber(device.count)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Browsers</CardTitle>
              <CardDescription>Traffic by web browser</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analyticsSummary.browserBreakdown.map((browser) => (
                  <div key={browser._id} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{browser._id || 'Unknown'}</span>
                    <span className="text-sm text-gray-600">{formatNumber(browser.count)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Daily Events Chart */}
      {analyticsSummary && (
        <Card>
          <CardHeader>
            <CardTitle>Daily Activity</CardTitle>
            <CardDescription>Events over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analyticsSummary.dailyEvents.map((day) => (
                <div key={day._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-gray-900">{day._id}</span>
                    <span className="text-xs text-gray-500">{day.totalEvents} total events</span>
                  </div>
                  <div className="flex space-x-2">
                    {day.events.map((event) => (
                      <div
                        key={event.eventType}
                        className="flex items-center space-x-1 px-2 py-1 bg-white rounded text-xs"
                      >
                        <div className={`w-2 h-2 rounded-full ${getEventTypeColor(event.eventType)}`} />
                        <span>{event.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 