'use client';

import React, { useState } from 'react';

export default function BankTotalWidgetDemo() {
  const [streamerId, setStreamerId] = useState('64a1b2c3d4e5f6789abcdef0');
  const [theme, setTheme] = useState<'dark' | 'light' | 'transparent'>('dark');
  const [showStats, setShowStats] = useState(false);
  const [widgetUrl, setWidgetUrl] = useState('');

  const generateWidgetUrl = () => {
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
    const params = new URLSearchParams();
    
    if (theme !== 'dark') params.set('theme', theme);
    if (showStats) params.set('showStats', 'true');
    
    const queryString = params.toString();
    const url = `${baseUrl}/api/widget-public/bank-total/${streamerId}${queryString ? '?' + queryString : ''}`;
    setWidgetUrl(url);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(widgetUrl);
    alert('Widget URL copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Bank Donation Total Widget Demo
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Configuration Panel */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Widget Configuration
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Streamer ID
                  </label>
                  <input
                    type="text"
                    value={streamerId}
                    onChange={(e) => setStreamerId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter streamer ID"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Theme
                  </label>
                  <select
                    value={theme}
                    onChange={(e) => setTheme(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="dark">Dark</option>
                    <option value="light">Light</option>
                    <option value="transparent">Transparent</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="showStats"
                    checked={showStats}
                    onChange={(e) => setShowStats(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="showStats" className="ml-2 block text-sm text-gray-700">
                    Show detailed statistics
                  </label>
                </div>

                <button
                  onClick={generateWidgetUrl}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Generate Widget URL
                </button>
              </div>

              {widgetUrl && (
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Widget URL
                  </label>
                  <div className="flex">
                    <input
                      type="text"
                      value={widgetUrl}
                      readOnly
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md bg-gray-50 text-sm"
                    />
                    <button
                      onClick={copyToClipboard}
                      className="px-4 py-2 bg-gray-600 text-white rounded-r-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                      Copy
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Use this URL in OBS as a Browser Source
                  </p>
                </div>
              )}
            </div>

            {/* Widget Preview */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Widget Preview
              </h2>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 bg-gray-50">
                {widgetUrl ? (
                  <div className="space-y-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-4">
                        Widget Preview (iframes are disabled for security)
                      </p>
                      <div className="bg-white border rounded-lg p-4 shadow-sm">
                        <div className="text-center">
                          <div className="text-lg font-semibold text-gray-600 mb-2">
                            Total Bank Donations
                          </div>
                          <div className="text-3xl font-bold text-blue-600 mb-2">
                            1,500,000 ₫
                          </div>
                          <div className="text-sm text-gray-500 mb-4">
                            VND
                          </div>
                          {showStats && (
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div className="bg-gray-100 p-2 rounded">
                                <div className="font-semibold text-blue-600">25</div>
                                <div className="text-gray-500">Transactions</div>
                              </div>
                              <div className="bg-gray-100 p-2 rounded">
                                <div className="font-semibold text-blue-600">60,000 ₫</div>
                                <div className="text-gray-500">Average</div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-center">
                      <a
                        href={widgetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                      >
                        Open Widget in New Tab
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500">
                    <p>Configure the widget settings and click "Generate Widget URL" to see a preview</p>
                  </div>
                )}
              </div>

              {/* OBS Setup Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-800 mb-2">OBS Setup Instructions</h3>
                <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                  <li>Add a Browser Source in OBS</li>
                  <li>Paste the generated URL</li>
                  <li>Set width: 400px, height: 200px (adjust as needed)</li>
                  <li>Enable "Refresh browser when scene becomes active"</li>
                  <li>Position the widget where you want it</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="mt-12">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              Widget Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-2">Real-time Updates</h3>
                <p className="text-sm text-gray-600">
                  Automatically refreshes every 30 seconds to show the latest donation totals
                </p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-2">Multiple Themes</h3>
                <p className="text-sm text-gray-600">
                  Choose from dark, light, or transparent themes to match your stream's aesthetic
                </p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-2">Detailed Statistics</h3>
                <p className="text-sm text-gray-600">
                  Optional display of transaction count, averages, and time-based totals
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
