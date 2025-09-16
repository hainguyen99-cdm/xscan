'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  SOCIAL_PLATFORMS, 
  SocialShareData, 
  openSocialShare, 
  shareContent, 
  copyToClipboard,
  generateQRCodeUrl,
  supportsNativeSharing 
} from '@/lib/socialSharing';
import { 
  Share2, 
  Copy, 
  Check, 
  QrCode, 
  Smartphone,
  ExternalLink,
  MessageCircle
} from 'lucide-react';

interface DonorSocialSharingProps {
  streamerName: string;
  amount: number;
  currency: string;
  message?: string;
  isAnonymous?: boolean;
  className?: string;
}

export function DonorSocialSharing({
  streamerName,
  amount,
  currency,
  message,
  isAnonymous = false,
  className = ''
}: DonorSocialSharingProps) {
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [showQRCode, setShowQRCode] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const shareData = {
    title: `Just donated to ${streamerName}!`,
    description: message 
      ? `"${message}" - Supporting amazing creators! 💝`
      : `Supporting amazing creators! 💝`,
    url: `${window.location.origin}/discover`,
    hashtags: [
      'supportcreators',
      'donation',
      'streaming',
      'contentcreation',
      'supportartists',
      ...(isAnonymous ? ['anonymousdonation'] : [])
    ]
  };

  const handleSocialShare = async (platform: typeof SOCIAL_PLATFORMS[0]) => {
    if (platform.id === 'discord') {
      // For Discord, copy the content to clipboard
      const shareText = `${shareData.title} ${shareData.description} ${shareData.url}`;
      const success = await copyToClipboard(shareText);
      if (success) {
        setCopiedText('discord');
        setTimeout(() => setCopiedText(null), 2000);
      }
      return;
    }

    openSocialShare(platform, shareData);
  };

  const handleNativeShare = async () => {
    setIsSharing(true);
    try {
      const success = await shareContent(shareData);
      if (success) {
        // Native sharing was successful
        console.log('Content shared successfully via native sharing');
      }
    } catch (error) {
      console.error('Native sharing failed:', error);
    } finally {
      setIsSharing(false);
    }
  };

  const handleCopyLink = async () => {
    const success = await copyToClipboard(shareData.url);
    if (success) {
      setCopiedText('link');
      setTimeout(() => setCopiedText(null), 2000);
    }
  };

  const handleCopyText = async () => {
    const shareText = `${shareData.title} ${shareData.description} ${shareData.url}`;
    const success = await copyToClipboard(shareText);
    if (success) {
      setCopiedText('text');
      setTimeout(() => setCopiedText(null), 2000);
    }
  };

  const toggleQRCode = () => {
    setShowQRCode(!showQRCode);
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <Card className={`${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Share2 className="w-5 h-5" />
          Share Your Support
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Donation Summary */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">You just donated</p>
            <p className="text-2xl font-bold text-green-600 mb-1">
              {formatAmount(amount, currency)}
            </p>
            <p className="text-gray-700">
              to <span className="font-semibold">{streamerName}</span>
            </p>
            {message && (
              <div className="mt-2 p-2 bg-white rounded border">
                <p className="text-sm text-gray-600 italic">"{message}"</p>
              </div>
            )}
            {isAnonymous && (
              <Badge variant="secondary" className="mt-2">
                Anonymous Donation
              </Badge>
            )}
          </div>
        </div>

        {/* Native Share Button (Mobile) */}
        {supportsNativeSharing() && (
          <div className="text-center">
            <Button
              onClick={handleNativeShare}
              disabled={isSharing}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
              size="lg"
            >
              <Smartphone className="w-4 h-4 mr-2" />
              {isSharing ? 'Sharing...' : 'Share via Device'}
            </Button>
            <p className="text-xs text-gray-500 mt-1">
              Share to any app on your device
            </p>
          </div>
        )}

        {/* Social Media Platforms */}
        <div>
          <h4 className="font-semibold text-gray-700 mb-3">Share on Social Media</h4>
          <div className="grid grid-cols-4 gap-3">
            {SOCIAL_PLATFORMS.map((platform) => (
              <Button
                key={platform.id}
                onClick={() => handleSocialShare(platform)}
                variant="outline"
                className="flex flex-col items-center justify-center h-20 p-2 hover:scale-105 transition-transform"
                style={{ borderColor: platform.color }}
              >
                <span className="text-2xl mb-1">{platform.icon}</span>
                <span className="text-xs font-medium">{platform.name}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-700">Quick Actions</h4>
          
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={handleCopyLink}
              variant="outline"
              className="flex items-center justify-center gap-2"
            >
              <Copy className="w-4 h-4" />
              {copiedText === 'link' ? (
                <>
                  <Check className="w-4 h-4 text-green-600" />
                  Copied!
                </>
              ) : (
                'Copy Link'
              )}
            </Button>

            <Button
              onClick={handleCopyText}
              variant="outline"
              className="flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              {copiedText === 'text' ? (
                <>
                  <Check className="w-4 h-4 text-green-600" />
                  Copied!
                </>
              ) : (
                'Copy Text'
              )}
            </Button>
          </div>

          <Button
            onClick={toggleQRCode}
            variant="outline"
            className="w-full flex items-center justify-center gap-2"
          >
            <QrCode className="w-4 h-4" />
            {showQRCode ? 'Hide QR Code' : 'Show QR Code'}
          </Button>
        </div>

        {/* QR Code */}
        {showQRCode && (
          <div className="text-center p-4 bg-gray-50 rounded-lg border">
            <h5 className="font-medium text-gray-700 mb-3">Scan to Share</h5>
            <img
              src={generateQRCodeUrl(`${shareData.title} ${shareData.description} ${shareData.url}`)}
              alt="QR Code for sharing"
              className="mx-auto w-32 h-32 border-2 border-white shadow-lg"
            />
            <p className="text-xs text-gray-500 mt-2">
              Scan with your phone to share this donation
            </p>
          </div>
        )}

        {/* Share Stats */}
        <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-700">
            <strong>Did you know?</strong> Sharing your support helps creators grow their community and encourages others to support amazing content!
          </p>
        </div>

        {/* Platform-specific Tips */}
        <div className="text-xs text-gray-500 space-y-1">
          <p>💡 <strong>Twitter:</strong> Great for reaching a wide audience</p>
          <p>💡 <strong>Facebook:</strong> Perfect for friends and family</p>
          <p>💡 <strong>LinkedIn:</strong> Professional networking and business connections</p>
          <p>💡 <strong>WhatsApp/Telegram:</strong> Direct sharing with close contacts</p>
        </div>
      </CardContent>
    </Card>
  );
} 