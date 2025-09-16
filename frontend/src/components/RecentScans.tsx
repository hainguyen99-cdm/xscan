export function RecentScans() {
  const recentScans = [
    {
      id: 1,
      target: 'example.com',
      status: 'completed',
      vulnerabilities: 3,
      timestamp: '2 hours ago',
      scanType: 'Full Scan'
    },
    {
      id: 2,
      target: 'test-site.org',
      status: 'in-progress',
      vulnerabilities: null,
      timestamp: '5 minutes ago',
      scanType: 'Quick Scan'
    },
    {
      id: 3,
      target: 'demo-app.net',
      status: 'completed',
      vulnerabilities: 0,
      timestamp: '1 day ago',
      scanType: 'Full Scan'
    },
    {
      id: 4,
      target: 'sample-web.com',
      status: 'failed',
      vulnerabilities: null,
      timestamp: '2 days ago',
      scanType: 'Custom Scan'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        );
      case 'in-progress':
        return (
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        );
      case 'failed':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Recent Scans</h3>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {recentScans.map((scan) => (
            <div key={scan.id} className="flex items-center space-x-4 p-3 rounded-lg border border-gray-200 hover:bg-gray-50">
              <div className="flex-shrink-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getStatusColor(scan.status)}`}>
                  {getStatusIcon(scan.status)}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{scan.target}</p>
                <p className="text-sm text-gray-500">{scan.scanType}</p>
              </div>
              <div className="flex-shrink-0 text-right">
                {scan.vulnerabilities !== null ? (
                  <p className="text-sm font-medium text-gray-900">{scan.vulnerabilities} issues</p>
                ) : (
                  <p className="text-sm text-gray-500">-</p>
                )}
                <p className="text-xs text-gray-400">{scan.timestamp}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6">
          <a
            href="/scans"
            className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            View All Scans
          </a>
        </div>
      </div>
    </div>
  );
} 