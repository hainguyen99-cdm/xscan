'use client';

import { 
  ChartBarIcon, 
  UsersIcon, 
  CreditCardIcon, 
  CurrencyDollarIcon, 
  DocumentChartBarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Cog6ToothIcon,
  ShieldCheckIcon,
  Bars3Icon,
  XMarkIcon,
  BanknotesIcon,
  BuildingLibraryIcon
} from '@heroicons/react/24/outline';
import { useState, useEffect, useRef } from 'react';

type AdminSection = 'overview' | 'users' | 'transactions' | 'deposits' | 'bank-accounts' | 'fees' | 'reports';

interface AdminNavigationProps {
  activeSection: AdminSection;
  onSectionChange: (section: AdminSection) => void;
}

const navigationItems = [
  {
    id: 'overview' as AdminSection,
    name: 'Overview',
    icon: ChartBarIcon,
    description: 'Dashboard overview and key metrics',
    badge: null,
    shortcut: '1'
  },
  {
    id: 'users' as AdminSection,
    name: 'User Management',
    icon: UsersIcon,
    description: 'Manage users, accounts, and permissions',
    badge: '5',
    shortcut: '2'
  },
  {
    id: 'transactions' as AdminSection,
    name: 'Transactions',
    icon: CreditCardIcon,
    description: 'View and manage all transactions',
    badge: '0',
    shortcut: '3'
  },
  {
    id: 'deposits' as AdminSection,
    name: 'Deposit Management',
    icon: BanknotesIcon,
    description: 'Monitor and manage all deposits',
    badge: '12',
    shortcut: '4'
  },
  {
    id: 'bank-accounts' as AdminSection,
    name: 'Bank Account Management',
    icon: BuildingLibraryIcon,
    description: 'Manage bank accounts for all users',
    badge: '8',
    shortcut: '5'
  },
  {
    id: 'fees' as AdminSection,
    name: 'Fee Management',
    icon: CurrencyDollarIcon,
    description: 'Configure platform fees and rates',
    badge: null,
    shortcut: '6'
  },
  {
    id: 'reports' as AdminSection,
    name: 'Reports',
    icon: DocumentChartBarIcon,
    description: 'Generate reports and analytics',
    badge: '0',
    shortcut: '7'
  }
];

const quickStats = [
  { label: 'Total Users', value: '5', color: 'text-gray-900' },
  { label: 'Active Today', value: '5', color: 'text-green-600' },
  { label: 'Revenue (30d)', value: '₫15.4M', color: 'text-gray-900' },
  { label: 'Pending Applications', value: '3', color: 'text-orange-600' }
];

export function AdminNavigation({ activeSection, onSectionChange }: AdminNavigationProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const navigationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setIsCollapsed(false);
      }
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  useEffect(() => {
    const handleToggleMobileMenu = () => {
      setIsMobileMenuOpen(prev => !prev);
    };

    window.addEventListener('toggleMobileMenu', handleToggleMobileMenu);
    return () => window.removeEventListener('toggleMobileMenu', handleToggleMobileMenu);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Handle number keys for quick navigation (1-7)
      if (event.key >= '1' && event.key <= '7' && !isMobile) {
        const sectionIndex = parseInt(event.key) - 1;
        if (sectionIndex < navigationItems.length) {
          const section = navigationItems[sectionIndex].id;
          onSectionChange(section);
        }
      }

      // Handle Escape key to close mobile menu
      if (event.key === 'Escape' && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }

      // Handle Ctrl/Cmd + B to toggle sidebar collapse
      if ((event.ctrlKey || event.metaKey) && event.key === 'b') {
        event.preventDefault();
        if (!isMobile) {
          setIsCollapsed(!isCollapsed);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isMobileMenuOpen, isCollapsed, isMobile, onSectionChange]);

  const handleToggleCollapse = () => {
    if (!isMobile) {
      setIsCollapsed(!isCollapsed);
    }
  };

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleNavigationClick = (section: AdminSection) => {
    onSectionChange(section);
    if (isMobile) {
      setIsMobileMenuOpen(false);
    }
  };

  // Mobile Navigation Overlay
  if (isMobile) {
    return (
      <>
        {/* Mobile Menu Button */}
        <button
          onClick={handleMobileMenuToggle}
          className="fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg border border-gray-200 md:hidden hover:bg-gray-50 transition-colors"
          aria-label="Toggle mobile menu"
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-navigation"
        >
          {isMobileMenuOpen ? (
            <XMarkIcon className="h-6 w-6 text-gray-600" />
          ) : (
            <Bars3Icon className="h-6 w-6 text-gray-600" />
          )}
        </button>

        {/* Mobile Navigation Overlay */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={handleMobileMenuToggle} />
            <div 
              id="mobile-navigation"
              className="fixed left-0 top-0 h-full w-80 bg-white shadow-xl"
              role="navigation"
              aria-label="Admin navigation"
            >
              {/* Mobile Header */}
              <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
                <div className="flex items-center space-x-2">
                  <ShieldCheckIcon className="h-8 w-8 text-indigo-600" />
                  <div>
                    <h1 className="text-lg font-semibold text-gray-900">Admin</h1>
                    <p className="text-xs text-gray-500">Platform Management</p>
                  </div>
                </div>
                <button
                  onClick={handleMobileMenuToggle}
                  className="p-1 rounded-md hover:bg-gray-100 transition-colors"
                  aria-label="Close mobile menu"
                >
                  <XMarkIcon className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              {/* Mobile Navigation Items */}
              <nav className="flex-1 overflow-y-auto py-4">
                <div className="px-3 space-y-1">
                  {navigationItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeSection === item.id;
                    
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleNavigationClick(item.id)}
                        className={`w-full group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                          isActive
                            ? 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-500 shadow-sm'
                            : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 hover:shadow-sm'
                        }`}
                        aria-current={isActive ? 'page' : undefined}
                        title={`${item.name} (${item.shortcut})`}
                      >
                        <Icon
                          className={`flex-shrink-0 h-5 w-5 mr-3 ${
                            isActive ? 'text-indigo-500' : 'text-gray-400 group-hover:text-gray-500'
                          }`}
                        />
                        <div className="flex-1 text-left min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-medium truncate">{item.name}</span>
                            <div className="flex items-center space-x-2">
                              {item.badge && (
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                  isActive ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'
                                }`}>
                                  {item.badge}
                                </span>
                              )}
                              <span className="text-xs text-gray-400 font-mono bg-gray-100 px-1.5 py-0.5 rounded">
                                {item.shortcut}
                              </span>
                            </div>
                          </div>
                          <div className={`text-xs truncate ${
                            isActive ? 'text-indigo-600' : 'text-gray-500'
                          }`}>
                            {item.description}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </nav>

              {/* Mobile Quick Stats */}
              <div className="border-t border-gray-200 p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                  <Cog6ToothIcon className="h-4 w-4 mr-2 text-gray-400" />
                  Quick Stats
                </h4>
                <div className="space-y-3">
                  {quickStats.map((stat, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-xs text-gray-600 truncate">{stat.label}</span>
                      <span className={`text-sm font-semibold ${stat.color}`}>
                        {stat.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // Desktop Sidebar Navigation
  return (
    <>
      {/* Mobile Menu Toggle Button - Always visible on mobile */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={handleMobileMenuToggle}
          className="p-2 bg-white rounded-md shadow-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50"
          aria-label="Toggle mobile menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Desktop Sidebar */}
      <div className={`hidden md:flex flex-col bg-white border-r border-gray-200 transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-16' : 'w-64'
      } h-full`}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          {!isCollapsed && (
            <div className="flex items-center">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">XS</span>
              </div>
              <span className="ml-3 text-lg font-semibold text-gray-900">Admin</span>
            </div>
          )}
          <button
            onClick={handleToggleCollapse}
            className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d={isCollapsed ? "M13 5l7 7-7 7M5 5l7 7-7 7" : "M11 19l-7-7 7-7m8 14l-7-7 7-7"} />
            </svg>
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto py-4">
          <div className="px-3 space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigationClick(item.id)}
                  className={`w-full group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                    isActive
                      ? 'bg-indigo-100 text-indigo-700 border-r-2 border-indigo-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                  title={isCollapsed ? item.name : undefined}
                >
                  <Icon className={`flex-shrink-0 h-5 w-5 ${
                    isActive ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-500'
                  }`} />
                  {!isCollapsed && (
                    <>
                      <span className="ml-3 flex-1 text-left">{item.name}</span>
                      {item.badge && (
                        <span className="ml-auto inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                          {item.badge}
                        </span>
                      )}
                      {item.shortcut && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                          {item.shortcut}
                        </span>
                      )}
                    </>
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Quick Stats */}
        {!isCollapsed && (
          <div className="border-t border-gray-200 p-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Quick Stats
            </h3>
            <div className="space-y-2">
              {quickStats.map((stat, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="text-gray-600">{stat.label}</span>
                  <span className={`font-medium ${stat.color}`}>{stat.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Mobile Navigation Overlay */}
      {isMobile && (
        <div className={`md:hidden fixed inset-0 z-50 transition-opacity duration-300 ${
          isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}>
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={handleMobileMenuToggle}
          />
          
          {/* Mobile Menu */}
          <div className={`absolute left-0 top-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ${
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}>
            {/* Mobile Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">XS</span>
                </div>
                <span className="ml-3 text-lg font-semibold text-gray-900">Admin</span>
              </div>
              <button
                onClick={handleMobileMenuToggle}
                className="p-1 rounded-md text-gray-400 hover:text-gray-600"
                aria-label="Close mobile menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Mobile Navigation Items */}
            <nav className="flex-1 overflow-y-auto py-4">
              <div className="px-3 space-y-1">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavigationClick(item.id)}
                      className={`w-full group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                        isActive
                          ? 'bg-indigo-100 text-indigo-700 border-r-2 border-indigo-600'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <Icon className={`flex-shrink-0 h-5 w-5 ${
                        isActive ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-500'
                      }`} />
                      <span className="ml-3 flex-1 text-left">{item.name}</span>
                      {item.badge && (
                        <span className="ml-auto inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                          {item.badge}
                        </span>
                      )}
                      {item.shortcut && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                          {item.shortcut}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </nav>

            {/* Mobile Quick Stats */}
            <div className="border-t border-gray-200 p-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Quick Stats
              </h3>
              <div className="space-y-2">
                {quickStats.map((stat, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-gray-600">{stat.label}</span>
                    <span className={`font-medium ${stat.color}`}>{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 