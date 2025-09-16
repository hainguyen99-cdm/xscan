'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Share2, 
  Copy, 
  Check, 
  ExternalLink,
  MessageCircle
} from 'lucide-react';
import { 
  SOCIAL_PLATFORMS, 
  openSocialShare, 
  copyToClipboard,
  generateDonationShareData
} from '@/lib/socialSharing';

interface DonorSocialShareWidgetProps {
  streamerName: string;
  amount: number;
  currency: string;
  message?: string;
  isAnonymous?: boolean;
  variant?: 'compact' | 'expanded';
  className?: string;
}

export function DonorSocialShareWidget({
  streamerName,
  amount,
  currency,
  message,
  isAnonymous = false,
  variant = 'compact',
  className = ''
}: DonorSocialShareWidgetProps) {
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [showPlatforms, setShowPlatforms] = useState(false);

  const shareData = generateDonationShareData(
    streamerName,
    amount,
    currency,
    message,
    isAnonymous
  );

  const handleSocialShare = (platform: typeof SOCIAL_PLATFORMS[0]) => {
    if (platform.id === 'discord') {
      const shareText = `${shareData.title} ${shareData.description} ${shareData.url}`;
      copyToClipboard(shareText).then(success => {
        if (success) {
          setCopiedText('discord');
          setTimeout(() => setCopiedText(null), 2000);
        }
      });
      return;
    }

    openSocialShare(platform, shareData);
  };

  const handleCopyText = async () => {
    const shareText = `${shareData.title} ${shareData.description} ${shareData.url}`;
    const success = await copyToClipboard(shareText);
    if (success) {
      setCopiedText('text');
      setTimeout(() => setCopiedText(null), 2000);
    }
  };

  const handleCopyLink = async () => {
    const success = await copyToClipboard(shareData.url);
    if (success) {
      setCopiedText('link');
      setTimeout(() => setCopiedText(null), 2000);
    }
  };

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowPlatforms(!showPlatforms)}
          className="flex items-center gap-2"
        >
          <Share2 className="w-4 h-4" />
          Share
        </Button>
        
        {showPlatforms && (
          <div className="absolute z-50 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-3 min-w-[200px]">
            <div className="grid grid-cols-4 gap-2 mb-3">
              {SOCIAL_PLATFORMS.slice(0, 8).map((platform) => (
                <Button
                  key={platform.id}
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSocialShare(platform)}
                  className="flex flex-col items-center justify-center h-12 p-1 hover:scale-105 transition-transform"
                  style={{ borderColor: platform.color }}
                >
                  <span className="text-lg">{platform.icon}</span>
                  <span className="text-xs">{platform.name}</span>
                </Button>
              ))}
            </div>
            
            <div className="border-t pt-2 space-y-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyText}
                className="w-full justify-start text-sm"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                {copiedText === 'text' ? 'Copied!' : 'Copy Text'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyLink}
                className="w-full justify-start text-sm"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                {copiedText === 'link' ? 'Copied!' : 'Copy Link'}
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Expanded variant
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-gray-700">Share this donation</h4>
        <Badge variant="outline" className="text-xs">
          {isAnonymous ? 'Anonymous' : 'Public'}
        </Badge>
      </div>
      
      <div className="grid grid-cols-4 gap-2">
        {SOCIAL_PLATFORMS.map((platform) => (
          <Button
            key={platform.id}
            variant="outline"
            size="sm"
            onClick={() => handleSocialShare(platform)}
            className="flex flex-col items-center justify-center h-16 p-2 hover:scale-105 transition-transform"
            style={{ borderColor: platform.color }}
          >
            <span className="text-xl mb-1">{platform.icon}</span>
            <span className="text-xs font-medium">{platform.name}</span>
          </Button>
        ))}
      </div>
      
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopyText}
          className="flex-1"
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          {copiedText === 'text' ? 'Copied!' : 'Copy Text'}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopyLink}
          className="flex-1"
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          {copiedText === 'link' ? 'Copied!' : 'Copy Link'}
        </Button>
      </div>
    </div>
  );
} 