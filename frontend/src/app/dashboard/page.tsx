export const dynamic = 'force-dynamic';
'use client';

import { Dashboard } from '@/components/Dashboard';
import Layout from '@/components/Layout';

export default function DashboardPage() {
  return (
    <Layout>
      <Dashboard />
    </Layout>
  );
} 