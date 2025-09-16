'use client';
export const dynamic = 'force-dynamic';

import { AdminDashboard } from '@/components/AdminDashboard';
import AdminLayout from '@/components/AdminLayout';

export default function AdminPage() {
  return (
    <AdminLayout>
      <AdminDashboard />
    </AdminLayout>
  );
} 