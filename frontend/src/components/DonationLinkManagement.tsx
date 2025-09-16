'use client';

import React from 'react';

import { useState, useEffect } from 'react';
import { DonationLink, DonationLinkFormData } from '@/types';
import { DonationLinkForm } from './DonationLinkForm';
import { DonationLinkCard } from './DonationLinkCard';
import { QRCodeModal } from './QRCodeModal';
import { LoadingSpinner } from './ui/LoadingSpinner';

interface DonationLinkManagementProps {
  streamerId: string;
}

export function DonationLinkManagement({ streamerId }: DonationLinkManagementProps) {
  const [donationLinks, setDonationLinks] = useState<DonationLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingLink, setEditingLink] = useState<DonationLink | null>(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedLink, setSelectedLink] = useState<DonationLink | null>(null);

  // Mock data for demonstration - replace with actual API calls
  useEffect(() => {
    const mockLinks: DonationLink[] = [
      {
        id: '1',
        streamerId,
        slug: 'main-stream',
        title: 'Main Stream',
        description: 'Primary donation link for main streams',
        customUrl: 'donationplatform.com/streamer/main-stream',
        qrCodeUrl: '/api/qr/main-stream',
        isActive: true,
        allowAnonymous: true,
        theme: {
          primaryColor: '#6366f1',
          secondaryColor: '#06b6d4',
          backgroundColor: '#ffffff',
          textColor: '#1f2937'
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '2',
        streamerId,
        slug: 'gaming-night',
        title: 'Gaming Night',
        description: 'Special donation link for gaming streams',
        customUrl: 'donationplatform.com/streamer/gaming-night',
        qrCodeUrl: '/api/qr/gaming-night',
        isActive: true,
        allowAnonymous: false,
        theme: {
          primaryColor: '#10b981',
          secondaryColor: '#3b82f6',
          backgroundColor: '#f8fafc',
          textColor: '#1e293b'
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    setDonationLinks(mockLinks);
    setIsLoading(false);
  }, [streamerId]);

  const handleCreateLink = async (formData: DonationLinkFormData) => {
    try {
      // Mock API call - replace with actual implementation
      const newLink: DonationLink = {
        id: Date.now().toString(),
        streamerId,
        slug: formData.customUrl,
        title: formData.title,
        description: formData.description,
        customUrl: `donationplatform.com/streamer/${formData.customUrl}`,
        qrCodeUrl: `/api/qr/${formData.customUrl}`,
        isActive: true,
        allowAnonymous: formData.allowAnonymous,
        theme: formData.theme,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setDonationLinks(prev => [newLink, ...prev]);
      setShowCreateForm(false);
    } catch (error) {
      console.error('Error creating donation link:', error);
    }
  };

  const handleEditLink = async (formData: DonationLinkFormData) => {
    if (!editingLink) return;
    
    try {
      // Mock API call - replace with actual implementation
      const updatedLink: DonationLink = {
        ...editingLink,
        title: formData.title,
        description: formData.description,
        slug: formData.customUrl,
        allowAnonymous: formData.allowAnonymous,
        theme: formData.theme,
        updatedAt: new Date().toISOString()
      };

      const updatedLinks = (donationLinks || []).map(l => 
        l.id === editingLink.id ? updatedLink : l
      );
      setDonationLinks(updatedLinks);
      setEditingLink(null);
    } catch (error) {
      console.error('Error updating donation link:', error);
    }
  };

  const handleDeleteLink = async (link: DonationLink) => {
    if (confirm(`Are you sure you want to delete "${link.title}"?`)) {
      try {
        // Mock API call - replace with actual implementation
        setDonationLinks(prev => (prev || []).filter(l => l.id !== link.id));
      } catch (error) {
        console.error('Error deleting donation link:', error);
      }
    }
  };

  const handleCopyLink = (link: DonationLink) => {
    const baseUrl = window.location.origin;
    const donationPageUrl = `${baseUrl}/donate/${link.customUrl}`;
    navigator.clipboard.writeText(donationPageUrl);
    // You could add a toast notification here
  };

  const handleShowQR = (link: DonationLink) => {
    setSelectedLink(link);
    setShowQRModal(true);
  };

  const handleToggleActive = async (link: DonationLink) => {
    try {
      const updatedLink = { ...link, isActive: !link.isActive };
      const updatedLinks = (donationLinks || []).map(l => 
        l.id === link.id ? updatedLink : l
      );
      setDonationLinks(updatedLinks);
    } catch (error) {
      console.error('Error toggling link status:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Donation Links</h2>
          <p className="text-gray-600 mt-1">Manage your donation links and customize their appearance</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
        >
          <span className="mr-2">+</span>
          Create New Link
        </button>
      </div>

      {/* Create/Edit Form */}
      {(showCreateForm || editingLink) && (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-cyan-600 px-6 py-4">
            <h3 className="text-xl font-bold text-white">
              {editingLink ? 'Edit Donation Link' : 'Create New Donation Link'}
            </h3>
          </div>
          <div className="p-6">
            <DonationLinkForm
              initialData={editingLink ? {
                title: editingLink.title,
                description: editingLink.description || '',
                customUrl: editingLink.customUrl,
                isActive: editingLink.isActive,
                allowAnonymous: editingLink.allowAnonymous,
                theme: editingLink.theme,
              } : undefined}
              onSubmit={editingLink ? handleEditLink : handleCreateLink}
            />
            <div className="px-6 pb-6">
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  setEditingLink(null);
                }}
                className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Donation Links Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(donationLinks || []).map((link) => (
          <div key={link.id} className="relative">
            <DonationLinkCard
              donationLink={link}
              onEdit={setEditingLink}
              onDelete={handleDeleteLink}
              onCopyLink={handleCopyLink}
            />
            
            {/* Additional Actions */}
            <div className="mt-3 flex items-center justify-between">
              <button
                onClick={() => handleShowQR(link)}
                className="text-sm text-cyan-600 hover:text-cyan-700 font-medium flex items-center"
              >
                <span className="mr-1">📱</span>
                QR Code
              </button>
              
              <button
                onClick={() => handleToggleActive(link)}
                className={`text-sm font-medium px-3 py-1 rounded-full transition-colors ${
                  link.isActive
                    ? 'bg-green-100 text-green-800 hover:bg-green-200'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                {link.isActive ? 'Active' : 'Inactive'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {(donationLinks || []).length === 0 && !showCreateForm && (
        <div className="text-center py-12">
          <div className="mx-auto h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <span className="text-gray-400 text-2xl">🔗</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No donation links yet</h3>
          <p className="text-gray-600 mb-6">Create your first donation link to start accepting donations</p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700"
          >
            Create Your First Link
          </button>
        </div>
      )}

      {/* QR Code Modal */}
      {showQRModal && selectedLink && (
        <QRCodeModal
          donationLink={selectedLink}
          onClose={() => {
            setShowQRModal(false);
            setSelectedLink(null);
          }}
        />
      )}
    </div>
  );
} 