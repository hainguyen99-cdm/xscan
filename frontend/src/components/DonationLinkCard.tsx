'use client';

import { DonationLink } from '@/types';

interface DonationLinkCardProps {
  donationLink: DonationLink;
  onEdit?: (link: DonationLink) => void;
  onDelete?: (link: DonationLink) => void;
  onCopyLink?: (link: DonationLink) => void;
}

export function DonationLinkCard({ donationLink, onEdit, onDelete, onCopyLink }: DonationLinkCardProps) {
  const handleCopyLink = () => {
    if (onCopyLink) {
      onCopyLink(donationLink);
    } else {
      const baseUrl = window.location.origin;
      const donationPageUrl = `${baseUrl}/donate/${donationLink.customUrl}`;
      navigator.clipboard.writeText(donationPageUrl);
    }
  };

  return (
    <div 
      className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-200 hover:-translate-y-1"
      style={{
        borderLeft: `4px solid ${donationLink.theme.primaryColor}`,
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-gray-900 text-lg">{donationLink.title}</h4>
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
          donationLink.isActive 
            ? 'bg-green-100 text-green-800 border-green-200' 
            : 'bg-gray-100 text-gray-800 border-gray-200'
        }`}>
          {donationLink.isActive ? 'Active' : 'Inactive'}
        </span>
      </div>
      
      {/* Description */}
      {donationLink.description && (
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{donationLink.description}</p>
      )}
      
      {/* URL */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-gray-500 mb-1">Donation URL</label>
        <div className="flex items-center space-x-2">
          <code className="flex-1 px-3 py-2 bg-gray-50 rounded-lg text-sm text-gray-700 font-mono break-all">
            {`${window.location.origin}/donate/${donationLink.customUrl}`}
          </code>
          <button
            onClick={handleCopyLink}
            className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            title="Copy link"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Theme Preview */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-gray-500 mb-2">Theme Preview</label>
        <div className="flex items-center space-x-2">
          <div 
            className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
            style={{ backgroundColor: donationLink.theme.primaryColor }}
            title="Primary color"
          />
          <div 
            className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
            style={{ backgroundColor: donationLink.theme.secondaryColor }}
            title="Secondary color"
          />
          <div 
            className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
            style={{ backgroundColor: donationLink.theme.backgroundColor }}
            title="Background color"
          />
          <div 
            className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
            style={{ backgroundColor: donationLink.theme.textColor }}
            title="Text color"
          />
        </div>
      </div>

      {/* Settings */}
      <div className="mb-4 flex items-center space-x-4 text-xs text-gray-600">
        <span className={`flex items-center ${donationLink.allowAnonymous ? 'text-green-600' : 'text-gray-500'}`}>
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          {donationLink.allowAnonymous ? 'Anonymous allowed' : 'Anonymous disabled'}
        </span>
      </div>
      
      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onEdit?.(donationLink)}
            className="text-indigo-600 hover:text-indigo-700 text-sm font-medium px-3 py-1 rounded-lg hover:bg-indigo-50 transition-colors"
          >
            Edit
          </button>
          <button
            onClick={() => {
              const baseUrl = window.location.origin;
              const donationPageUrl = `${baseUrl}/donate/${donationLink.customUrl}`;
              window.open(donationPageUrl, '_blank');
            }}
            className="text-gray-600 hover:text-gray-700 text-sm font-medium px-3 py-1 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Preview
          </button>
        </div>
        
        <button
          onClick={() => onDelete?.(donationLink)}
          className="text-red-600 hover:text-red-700 text-sm font-medium px-3 py-1 rounded-lg hover:bg-red-50 transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  );
} 