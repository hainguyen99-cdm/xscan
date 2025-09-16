'use client';

import { useState } from 'react';
import { AdminNavigation } from './AdminNavigation';
import { UserManagement } from './admin/UserManagement';
import { EnhancedTransactionManagement } from './admin/EnhancedTransactionManagement';
import { FeeManagement } from './admin/FeeManagement';
import { ReportingSystem } from './admin/ReportingSystem';
import { AdminStats } from './admin/AdminStats';
import { DepositManagement } from './admin/DepositManagement';
import { AdminBankAccountManagement } from './admin/AdminBankAccountManagement';

type AdminSection = 'overview' | 'users' | 'transactions' | 'deposits' | 'bank-accounts' | 'fees' | 'reports';

export function AdminDashboard() {
  const [activeSection, setActiveSection] = useState<AdminSection>('overview');

  const renderSection = () => {
    switch (activeSection) {
      case 'overview':
        return <AdminStats />;
      case 'users':
        return <UserManagement />;
      case 'transactions':
        return <EnhancedTransactionManagement />;
      case 'deposits':
        return <DepositManagement />;
      case 'bank-accounts':
        return <AdminBankAccountManagement />;
      case 'fees':
        return <FeeManagement />;
      case 'reports':
        return <ReportingSystem />;
      default:
        return <AdminStats />;
    }
  };

  return (
    <div className="flex h-full bg-gray-50">
      {/* Left Sidebar Navigation - Hidden on mobile, shown on desktop */}
      <div className="hidden md:block">
        <AdminNavigation
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />
      </div>

      {/* Mobile Navigation - Always rendered but conditionally shown */}
      <div className="md:hidden">
        <AdminNavigation
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Section Header */}
        <div className="bg-white border-b border-gray-200 px-4 md:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 capitalize truncate">
                {activeSection === 'overview' ? 'Dashboard' :
                 activeSection === 'users' ? 'User Management' :
                 activeSection === 'transactions' ? 'Transaction Management' :
                 activeSection === 'deposits' ? 'Deposit Management' :
                 activeSection === 'bank-accounts' ? 'Bank Account Management' :
                 activeSection === 'fees' ? 'Fee Management' :
                 'Reports & Analytics'}
              </h1>
              <p className="text-sm text-gray-600 mt-1 truncate">
                {                 activeSection === 'overview' ? 'Platform overview and key metrics' :
                 activeSection === 'users' ? 'Manage user accounts and permissions' :
                 activeSection === 'transactions' ? 'Monitor and manage all transactions' :
                 activeSection === 'deposits' ? 'Monitor and manage all deposit transactions' :
                 activeSection === 'bank-accounts' ? 'Manage bank accounts for all users' :
                 activeSection === 'fees' ? 'Configure platform fees and rates' :
                 'Generate comprehensive reports and analytics'}
              </p>
            </div>

            {/* Breadcrumb - Hidden on small mobile, shown on larger screens */}
            <nav className="hidden sm:flex" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-2">
                <li>
                  <span className="text-gray-500">Admin</span>
                </li>
                <li>
                  <svg className="h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </li>
                <li>
                  <span className="text-gray-900 capitalize font-medium">
                    {activeSection === 'overview' ? 'Dashboard' :
                     activeSection === 'users' ? 'Users' :
                     activeSection === 'transactions' ? 'Transactions' :
                     activeSection === 'deposits' ? 'Deposits' :
                     activeSection === 'bank-accounts' ? 'Bank Accounts' :
                     activeSection === 'fees' ? 'Fees' :
                     'Reports'}
                  </span>
                </li>
              </ol>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="w-full">
            {renderSection()}
          </div>
        </main>
      </div>
    </div>
  );
} 