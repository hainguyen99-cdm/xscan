'use client';

import { useState } from 'react';

interface ScanCardProps {
  isScanning: boolean;
  setIsScanning: (scanning: boolean) => void;
}

export function ScanCard({ isScanning, setIsScanning }: ScanCardProps) {
  const [targetUrl, setTargetUrl] = useState('');
  const [scanType, setScanType] = useState('full');

  const handleStartScan = async () => {
    if (!targetUrl) return;
    
    setIsScanning(true);
    
    // Simulate scan process
    setTimeout(() => {
      setIsScanning(false);
      setTargetUrl('');
    }, 5000);
  };

  const scanTypes = [
    { id: 'quick', name: 'Quick Scan', description: 'Basic security check (5-10 min)' },
    { id: 'full', name: 'Full Scan', description: 'Comprehensive security audit (30-60 min)' },
    { id: 'custom', name: 'Custom Scan', description: 'Configure specific tests' }
  ];

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">New Security Scan</h3>
        <p className="mt-1 text-sm text-gray-500">
          Scan a website for security vulnerabilities and compliance issues
        </p>
      </div>
      
      <div className="px-6 py-4 space-y-4">
        {/* Target URL Input */}
        <div>
          <label htmlFor="target-url" className="block text-sm font-medium text-gray-700 mb-2">
            Target URL
          </label>
          <div className="flex rounded-md shadow-sm">
            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
              https://
            </span>
            <input
              type="text"
              id="target-url"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              placeholder="example.com"
              className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md focus:ring-blue-500 focus:border-blue-500 text-sm border-gray-300"
              disabled={isScanning}
            />
          </div>
        </div>

        {/* Scan Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Scan Type
          </label>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {scanTypes.map((type) => (
              <label
                key={type.id}
                className={`relative flex cursor-pointer rounded-lg border p-4 focus:outline-none ${
                  scanType === type.id
                    ? 'border-blue-500 ring-2 ring-blue-500'
                    : 'border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="scan-type"
                  value={type.id}
                  checked={scanType === type.id}
                  onChange={(e) => setScanType(e.target.value)}
                  className="sr-only"
                  disabled={isScanning}
                />
                <div className="flex w-full items-center justify-between">
                  <div className="flex items-center">
                    <div className="text-sm">
                      <p className={`font-medium ${
                        scanType === type.id ? 'text-blue-900' : 'text-gray-900'
                      }`}>
                        {type.name}
                      </p>
                      <p className={`${
                        scanType === type.id ? 'text-blue-700' : 'text-gray-500'
                      }`}>
                        {type.description}
                      </p>
                    </div>
                  </div>
                  {scanType === type.id && (
                    <div className="shrink-0 text-blue-600">
                      <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                        <path fillRule="evenodd" d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z" />
                      </svg>
                    </div>
                  )}
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={() => {
              setTargetUrl('');
              setScanType('full');
            }}
            disabled={isScanning}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={handleStartScan}
            disabled={!targetUrl || isScanning}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isScanning ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Scanning...</span>
              </div>
            ) : (
              'Start Scan'
            )}
          </button>
        </div>
      </div>
    </div>
  );
} 