'use client';

import { useState, useEffect, useRef } from 'react';
import { DonationLink } from '@/types';

interface QRCodeModalProps {
  donationLink: DonationLink;
  onClose: () => void;
}

export function QRCodeModal({ donationLink, onClose }: QRCodeModalProps) {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    generateQRCode();
  }, [donationLink]);

  const generateQRCode = async () => {
    setIsGenerating(true);
    
    try {
      // For now, we'll generate a simple QR code using a canvas
      // In a real implementation, you'd use a QR code library like qrcode.js
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Generate a simple QR code pattern (this is a placeholder)
      // In production, use a proper QR code library
      const qrSize = 200;
      const cellSize = 4;
      const cells = qrSize / cellSize;

      // Fill background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, qrSize, qrSize);

      // Generate a simple pattern (this is not a real QR code)
      ctx.fillStyle = '#000000';
      for (let i = 0; i < cells; i++) {
        for (let j = 0; j < cells; j++) {
          // Create a simple pattern based on position
          if ((i + j) % 3 === 0 || (i * j) % 7 === 0) {
            ctx.fillRect(i * cellSize, j * cellSize, cellSize, cellSize);
          }
        }
      }

      // Add positioning squares (QR code corner markers)
      const markerSize = 8;
      ctx.fillRect(0, 0, markerSize * cellSize, markerSize * cellSize);
      ctx.fillRect(qrSize - markerSize * cellSize, 0, markerSize * cellSize, markerSize * cellSize);
      ctx.fillRect(0, qrSize - markerSize * cellSize, markerSize * cellSize, markerSize * cellSize);

      // Convert to data URL
      const dataUrl = canvas.toDataURL('image/png');
      setQrCodeDataUrl(dataUrl);
    } catch (error) {
      console.error('Error generating QR code:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadQRCode = () => {
    if (!qrCodeDataUrl) return;

    const link = document.createElement('a');
    link.download = `qr-${donationLink.slug}.png`;
    link.href = qrCodeDataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyLink = () => {
    const baseUrl = window.location.origin;
    const donationPageUrl = `${baseUrl}/donate/${donationLink.customUrl}`;
    navigator.clipboard.writeText(donationPageUrl);
    // You could add a toast notification here
  };

  const openLink = () => {
    const baseUrl = window.location.origin;
    const donationPageUrl = `${baseUrl}/donate/${donationLink.customUrl}`;
    window.open(donationPageUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-cyan-600 px-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white">QR Code</h3>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Link Info */}
          <div className="mb-6">
            <h4 className="font-semibold text-gray-900 mb-2">{donationLink.title}</h4>
            <p className="text-sm text-gray-600 mb-3">{donationLink.description}</p>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm font-mono text-gray-700 break-all">
                {`${window.location.origin}/donate/${donationLink.customUrl}`}
              </p>
            </div>
          </div>

          {/* QR Code Display */}
          <div className="text-center mb-6">
            {isGenerating ? (
              <div className="flex items-center justify-center h-48">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            ) : (
              <div className="inline-block p-4 bg-white border-2 border-gray-200 rounded-lg">
                <canvas
                  ref={canvasRef}
                  width={200}
                  height={200}
                  className="block"
                />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={downloadQRCode}
              disabled={!qrCodeDataUrl}
              className="w-full flex items-center justify-center px-4 py-2 bg-gradient-to-r from-indigo-600 to-cyan-600 text-white rounded-lg hover:from-indigo-700 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download QR Code
            </button>

            <button
              onClick={copyLink}
              className="w-full flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy Link
            </button>

            <button
              onClick={openLink}
              className="w-full flex items-center justify-center px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Open Link
            </button>
          </div>

          {/* Usage Instructions */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h5 className="font-medium text-blue-900 mb-2">How to use:</h5>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Download the QR code and print it</li>
              <li>• Display it on your stream overlay</li>
              <li>• Share it on social media</li>
              <li>• Add it to your stream description</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 