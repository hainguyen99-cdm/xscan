'use client';

import React, { ReactNode } from 'react';
import { useUIStore } from '@/store';
import { Header } from './Header';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { sidebarOpen, toggleSidebar } = useUIStore();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      <Header />
      
      <main className="relative">
        {children}
      </main>
    </div>
  );
} 