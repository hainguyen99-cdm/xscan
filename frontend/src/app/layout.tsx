import type { Metadata } from 'next';
import { Providers } from './providers';
import { ToastContainer } from '@/components/ui/toast';
import './globals.css';

export const metadata: Metadata = {
  title: 'DonationPlatform - Streamer Donation System',
  description: 'Professional donation platform for streamers and KOLs with OBS alert integration',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
          <ToastContainer />
        </Providers>
      </body>
    </html>
  );
} 