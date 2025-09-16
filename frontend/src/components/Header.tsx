'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppStore } from '@/store';
import { useAuthStore } from '@/store';

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const { user, isAuthenticated } = useAppStore();
  const { logout } = useAuthStore();
  const pathname = usePathname();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Donate for Streamers', href: '/donate-for-streamers' },
    { name: 'Wallet', href: '/wallet' },
    { name: 'Reports', href: '/reports' },
  ];

  // Add admin navigation for admin users
  const adminNavigation = [
    { name: 'XScan Admin', href: '/admin' },
  ];

  const handleLogout = () => {
    logout();
    setIsProfileDropdownOpen(false);
  };

  const resolveImageUrl = (url?: string): string => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return url.startsWith('/') ? url : `/${url}`;
  };

  return (
    <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-indigo-100/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/dashboard" className="flex items-center group">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 bg-gradient-to-r from-indigo-600 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-indigo-200/50 transition-all duration-300 group-hover:scale-110">
                  <span className="text-white font-bold text-lg">D</span>
                </div>
              </div>
              <div className="ml-3">
                <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent">
                  DonationPlatform
                </h1>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-1">
            {navigation.map((item) => {
              const isCurrent = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isCurrent
                      ? 'text-white bg-gradient-to-r from-indigo-600 to-cyan-600 shadow-lg shadow-indigo-200/50'
                      : 'text-gray-700 hover:text-indigo-600 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-cyan-50'
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
            
            {/* Admin Navigation */}
            {isAuthenticated && user?.role === 'admin' && (
              <div className="flex items-center space-x-1 ml-4 pl-4 border-l border-gray-200">
                {adminNavigation.map((item) => {
                  const isCurrent = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                        isCurrent
                          ? 'text-white bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg shadow-purple-200/50'
                          : 'text-gray-700 hover:text-purple-600 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50'
                      }`}
                    >
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            )}
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <button className="p-2 text-gray-400 hover:text-indigo-600 relative transition-colors duration-200 hover:bg-indigo-50 rounded-xl">
              <span className="sr-only">View notifications</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-5 5v-5z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
              <span className="absolute top-1 right-1 block h-2.5 w-2.5 rounded-full bg-gradient-to-r from-red-400 to-pink-500 animate-pulse"></span>
            </button>

            {/* Profile dropdown */}
            {isAuthenticated && user ? (
              <div className="relative">
                <button 
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center space-x-2 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 hover:bg-indigo-50 p-2 transition-all duration-200"
                >
                  {user.profilePicture ? (
                    <img
                      src={resolveImageUrl(user.profilePicture)}
                      alt="Profile"
                      className="h-9 w-9 rounded-xl object-cover shadow-lg"
                      onError={(e) => {
                        const target = e.currentTarget as HTMLImageElement;
                        // Try one more time by forcing leading slash if missing
                        const current = target.getAttribute('src') || '';
                        if (current && !current.startsWith('/') && !current.startsWith('http')) {
                          target.src = `/${current}`;
                          return;
                        }
                        target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="h-9 w-9 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 flex items-center justify-center shadow-lg">
                      <span className="text-white font-medium text-sm">
                        {(() => {
                          const displayName = user.firstName && user.lastName 
                            ? `${user.firstName} ${user.lastName}`.trim()
                            : user.name || '';
                          return displayName.charAt(0) ? displayName.charAt(0).toUpperCase() : 'U';
                        })()}
                      </span>
                    </div>
                  )}
                  <span className="hidden md:block text-gray-700 font-medium">
                    {user.firstName && user.lastName 
                      ? `${user.firstName} ${user.lastName}`.trim()
                      : user.name || 'User'
                    }
                  </span>
                  <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown menu */}
                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl py-2 z-50 border border-indigo-100/50">
                    <div className="px-4 py-3 text-sm text-gray-700 border-b border-indigo-100/50">
                      <div className="font-semibold text-gray-900">
                        {user.firstName && user.lastName 
                          ? `${user.firstName} ${user.lastName}`.trim()
                          : user.name || 'User'
                        }
                      </div>
                      <div className="text-gray-500">{user.email}</div>
                      {user.role === 'admin' && (
                        <div className="text-xs text-purple-600 font-medium bg-purple-50 px-2 py-1 rounded mt-1 inline-block">
                          Administrator
                        </div>
                      )}
                    </div>
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-cyan-50 transition-all duration-200"
                      onClick={() => setIsProfileDropdownOpen(false)}
                    >
                      Profile Settings
                    </Link>
                    {user.role === 'admin' && (
                      <Link
                        href="/admin"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-200"
                        onClick={() => setIsProfileDropdownOpen(false)}
                      >
                        XScan Admin
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 hover:text-red-600 transition-all duration-200"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  href="/login"
                  className="text-gray-700 hover:text-indigo-600 px-4 py-2 rounded-xl text-sm font-medium hover:bg-indigo-50 transition-all duration-200"
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 text-white px-5 py-2 rounded-xl text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-200"
            >
              <span className="sr-only">Open main menu</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white/95 backdrop-blur-md border-t border-indigo-100/50">
            {navigation.map((item) => {
              const isCurrent = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`block px-3 py-2 rounded-xl text-base font-medium transition-all duration-200 ${
                    isCurrent
                      ? 'text-white bg-gradient-to-r from-indigo-600 to-cyan-600 shadow-lg'
                      : 'text-gray-700 hover:text-indigo-600 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-cyan-50'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              );
            })}
            
            {/* Admin Navigation in Mobile Menu */}
            {isAuthenticated && user?.role === 'admin' && (
              <>
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Admin
                  </div>
                  {adminNavigation.map((item) => {
                    const isCurrent = pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`block px-3 py-2 rounded-xl text-base font-medium transition-all duration-200 ${
                          isCurrent
                            ? 'text-white bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg'
                            : 'text-gray-700 hover:text-purple-600 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50'
                        }`}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {item.name}
                      </Link>
                    );
                  })}
                </div>
              </>
            )}
            
            {isAuthenticated && (
              <button
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}
                className="block w-full text-left px-3 py-2 rounded-xl text-base font-medium text-gray-700 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 hover:text-red-600 transition-all duration-200"
              >
                Sign out
              </button>
            )}
          </div>
        </div>
      )}

      {/* Click outside to close dropdown */}
      {isProfileDropdownOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsProfileDropdownOpen(false)}
        />
      )}
    </header>
  );
} 