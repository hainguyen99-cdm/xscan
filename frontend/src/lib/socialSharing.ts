/**
 * Social sharing utilities for the Donation Platform
 */

export interface SocialShareData {
  title: string;
  description: string;
  url: string;
  image?: string;
  hashtags?: string[];
}

export interface SocialPlatform {
  id: string;
  name: string;
  icon: string;
  color: string;
  shareUrl: string;
  mobileShareUrl?: string;
}

export const SOCIAL_PLATFORMS: SocialPlatform[] = [
  {
    id: 'twitter',
    name: 'Twitter',
    icon: '🐦',
    color: '#1DA1F2',
    shareUrl: 'https://twitter.com/intent/tweet',
  },
  {
    id: 'facebook',
    name: 'Facebook',
    icon: '📘',
    color: '#1877F2',
    shareUrl: 'https://www.facebook.com/sharer/sharer.php',
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: '💼',
    color: '#0A66C2',
    shareUrl: 'https://www.linkedin.com/sharing/share-offsite',
  },
  {
    id: 'reddit',
    name: 'Reddit',
    icon: '🤖',
    color: '#FF4500',
    shareUrl: 'https://reddit.com/submit',
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    icon: '💬',
    color: '#25D366',
    shareUrl: 'https://wa.me',
    mobileShareUrl: 'whatsapp://send',
  },
  {
    id: 'telegram',
    name: 'Telegram',
    icon: '📱',
    color: '#0088CC',
    shareUrl: 'https://t.me/share/url',
  },
  {
    id: 'discord',
    name: 'Discord',
    icon: '🎮',
    color: '#5865F2',
    shareUrl: 'https://discord.com/channels/@me',
  },
  {
    id: 'email',
    name: 'Email',
    icon: '📧',
    color: '#EA4335',
    shareUrl: 'mailto:',
  },
];

/**
 * Generate social share URLs for different platforms
 */
export function generateSocialShareUrl(platform: SocialPlatform, data: SocialShareData): string {
  const { title, description, url, hashtags = [] } = data;
  
  switch (platform.id) {
    case 'twitter':
      const twitterText = `${title} ${description}`;
      const twitterHashtags = hashtags.length > 0 ? ` ${hashtags.map(tag => `#${tag}`).join(' ')}` : '';
      return `${platform.shareUrl}?text=${encodeURIComponent(twitterText + twitterHashtags)}&url=${encodeURIComponent(url)}`;
    
    case 'facebook':
      return `${platform.shareUrl}?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(description)}`;
    
    case 'linkedin':
      return `${platform.shareUrl}?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}&summary=${encodeURIComponent(description)}`;
    
    case 'reddit':
      return `${platform.shareUrl}?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`;
    
    case 'whatsapp':
      const whatsappText = `${title} ${description} ${url}`;
      return `${platform.shareUrl}?text=${encodeURIComponent(whatsappText)}`;
    
    case 'telegram':
      const telegramText = `${title} ${description}`;
      return `${platform.shareUrl}?url=${encodeURIComponent(url)}&text=${encodeURIComponent(telegramText)}`;
    
    case 'discord':
      // Discord doesn't have a direct share URL, so we'll use the webhook approach
      return `${platform.shareUrl}`;
    
    case 'email':
      const emailSubject = title;
      const emailBody = `${description}\n\n${url}`;
      return `${platform.shareUrl}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    
    default:
      return url;
  }
}

/**
 * Check if the current device supports native sharing
 */
export function supportsNativeSharing(): boolean {
  return 'navigator' in window && 'share' in navigator;
}

/**
 * Use native sharing if available, otherwise fall back to URL sharing
 */
export async function shareContent(data: SocialShareData): Promise<boolean> {
  if (supportsNativeSharing()) {
    try {
      await navigator.share({
        title: data.title,
        text: data.description,
        url: data.url,
      });
      return true;
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Native sharing failed:', error);
      }
      return false;
    }
  }
  return false;
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if ('navigator' in window && 'clipboard' in navigator) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const result = document.execCommand('copy');
      document.body.removeChild(textArea);
      return result;
    }
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}

/**
 * Generate donation-specific share data
 */
export function generateDonationShareData(
  streamerName: string,
  amount: number,
  currency: string,
  message?: string,
  isAnonymous: boolean = false
): SocialShareData {
  const title = `Just donated to ${streamerName}!`;
  const description = message 
    ? `"${message}" - Supporting amazing creators!`
    : `Supporting amazing creators!`;
  
  // Generate a shareable URL (this would be the donation page or streamer profile)
  const url = `${window.location.origin}/discover`;
  
  const hashtags = [
    'supportcreators',
    'donation',
    'streaming',
    'contentcreation',
    'supportartists'
  ];
  
  if (isAnonymous) {
    hashtags.push('anonymousdonation');
  }
  
  return {
    title,
    description: `${description} 💝`,
    url,
    hashtags,
  };
}

/**
 * Open social share in a popup window
 */
export function openSocialShare(platform: SocialPlatform, data: SocialShareData): void {
  const shareUrl = generateSocialShareUrl(platform, data);
  
  if (platform.id === 'discord') {
    // Discord doesn't support direct sharing, so we'll copy the content
    const shareText = `${data.title} ${data.description} ${data.url}`;
    copyToClipboard(shareText);
    return;
  }
  
  const popup = window.open(
    shareUrl,
    `${platform.name} Share`,
    'width=600,height=400,scrollbars=yes,resizable=yes'
  );
  
  if (popup) {
    popup.focus();
  }
}

/**
 * Generate QR code for sharing
 */
export function generateQRCodeUrl(text: string): string {
  // Using a free QR code service
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(text)}`;
} 