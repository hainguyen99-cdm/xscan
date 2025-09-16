import { ReactNode } from 'react';

interface DonationLinksLayoutProps {
  children: ReactNode;
}

export default function DonationLinksLayout({ children }: DonationLinksLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
} 