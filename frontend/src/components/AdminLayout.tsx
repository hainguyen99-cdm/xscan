'use client';

import { ReactNode } from 'react';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin-specific header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-xl font-bold text-gray-900">XScan Admin</h1>
              </div>
            </div>

            {/* Admin-specific actions */}
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                Admin Panel
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main content area - full width and height */}
      <main className="w-full h-[calc(100vh-4rem)]">
        {children}
      </main>
    </div>
  );
}
