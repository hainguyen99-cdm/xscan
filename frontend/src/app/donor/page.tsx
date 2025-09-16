'use client';
export const dynamic = 'force-dynamic';

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