export const dynamic = 'force-dynamic';
'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/store';
import Layout from '@/components/Layout';
import DonorDashboard from '@/components/DonorDashboard';

export default function DonorPage() {
  return (
    <Layout>
      <DonorDashboard />
    </Layout>
  );
} 