'use client';

import { Donation } from '@/types';

interface RecentDonationsProps {
  donations: Donation[];
}

export function RecentDonations({ donations }: RecentDonationsProps) {
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'bank_transfer':
        return '🏦';
      case 'wallet':
        return '💰';
      default:
        return '💳';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'pending':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-4">
      {donations.map((donation) => (
        <div key={donation.id} className="group p-4 bg-gradient-to-r from-gray-50 to-indigo-50/30 rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-md hover:shadow-indigo-100/50 transition-all duration-300 hover:bg-gradient-to-r hover:from-indigo-50/50 hover:to-cyan-50/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-r from-indigo-600 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-indigo-200/50 transition-all duration-300 group-hover:scale-110">
                  <span className="text-white font-semibold text-sm">
                    {donation.isAnonymous ? 'A' : (donation.donorId ? 'D' : '?')}
                  </span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-base font-semibold text-gray-900 group-hover:text-indigo-700 transition-colors duration-200">
                  {donation.isAnonymous ? 'Anonymous Donor' : (donation.donorId ? `Donor ${donation.donorId}` : 'Unknown Donor')}
                </p>
                {donation.message && (
                  <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors duration-200 mt-1 line-clamp-2">{donation.message}</p>
                )}
                <div className="flex items-center space-x-3 mt-2">
                  <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full border border-gray-200">
                    {formatTimeAgo(donation.createdAt)}
                  </span>
                  <span className="text-sm">{getPaymentMethodIcon(donation.paymentMethod)}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent group-hover:from-indigo-700 group-hover:to-cyan-700 transition-all duration-300">
                  ${donation.amount.toFixed(2)}
                </p>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(donation.status)}`}>
                  {donation.status}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
      
      <div className="pt-4">
        <button className="w-full text-center text-indigo-600 hover:text-indigo-700 text-sm font-semibold py-3 px-4 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-all duration-200 border border-indigo-200 hover:border-indigo-300 hover:shadow-md">
          View All Donations →
        </button>
      </div>
    </div>
  );
} 