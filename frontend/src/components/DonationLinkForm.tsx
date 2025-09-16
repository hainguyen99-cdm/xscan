'use client';

import { useState, useEffect } from 'react';
import { DonationLinkFormData } from '@/types';

interface DonationLinkFormProps {
  initialData?: Partial<DonationLinkFormData>;
  onSubmit: (data: DonationLinkFormData) => void;
  isLoading?: boolean;
  submitButtonText?: string;
}

const defaultTheme = {
  primaryColor: '#3B82F6',
  secondaryColor: '#1E40AF',
  backgroundColor: '#FFFFFF',
  textColor: '#1F2937',
};

export function DonationLinkForm({ 
  initialData, 
  onSubmit, 
  isLoading = false,
  submitButtonText = 'Save Changes'
}: DonationLinkFormProps) {
  const [formData, setFormData] = useState<DonationLinkFormData>({
    title: '',
    description: '',
    customUrl: '',
    isActive: true,
    allowAnonymous: true,
    theme: defaultTheme,
    ...initialData,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isUrlAvailable, setIsUrlAvailable] = useState<boolean | null>(null);
  const [isCheckingUrl, setIsCheckingUrl] = useState(false);

  // Check URL availability when customUrl changes
  useEffect(() => {
    const checkUrlAvailability = async () => {
      if (!formData.customUrl || formData.customUrl.length < 3) {
        setIsUrlAvailable(null);
        return;
      }

      setIsCheckingUrl(true);
      try {
        const response = await fetch(`/api/donation-links/check-url?url=${encodeURIComponent(formData.customUrl)}`);
        const data = await response.json();
        setIsUrlAvailable(data.available);
      } catch (error) {
        setIsUrlAvailable(null);
      } finally {
        setIsCheckingUrl(false);
      }
    };

    const timeoutId = setTimeout(checkUrlAvailability, 500);
    return () => clearTimeout(timeoutId);
  }, [formData.customUrl]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.customUrl.trim()) {
      newErrors.customUrl = 'Custom URL is required';
    } else if (formData.customUrl.length < 3) {
      newErrors.customUrl = 'Custom URL must be at least 3 characters long';
    } else if (!/^[a-zA-Z0-9-]+$/.test(formData.customUrl)) {
      newErrors.customUrl = 'Custom URL can only contain letters, numbers, and hyphens';
    } else if (isUrlAvailable === false) {
      newErrors.customUrl = 'This URL is already taken';
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleInputChange = (field: keyof DonationLinkFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleThemeChange = (field: keyof typeof formData.theme, value: string) => {
    setFormData(prev => ({
      ...prev,
      theme: { ...prev.theme, [field]: value }
    }));
  };

  const generateRandomUrl = () => {
    const randomString = Math.random().toString(36).substring(2, 8);
    setFormData(prev => ({ ...prev, customUrl: randomString }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
          Basic Information
        </h3>
        
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Title *
          </label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
              errors.title ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="e.g., Support My Gaming Stream"
          />
          {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Tell your audience why they should support you..."
          />
          <p className="mt-1 text-sm text-gray-500">
            {formData.description?.length || 0}/500 characters
          </p>
        </div>

        <div>
          <label htmlFor="customUrl" className="block text-sm font-medium text-gray-700 mb-1">
            Custom URL *
          </label>
          <div className="flex">
            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
              /
            </span>
            <input
              type="text"
              id="customUrl"
              value={formData.customUrl}
              onChange={(e) => handleInputChange('customUrl', e.target.value)}
              className={`flex-1 px-3 py-2 border rounded-r-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                errors.customUrl ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="my-stream"
            />
          </div>
          <div className="mt-1 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {isCheckingUrl && (
                <div className="flex items-center text-sm text-gray-500">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-500 mr-2"></div>
                  Checking availability...
                </div>
              )}
              {isUrlAvailable === true && (
                <div className="flex items-center text-sm text-green-600">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  URL available
                </div>
              )}
              {isUrlAvailable === false && (
                <div className="flex items-center text-sm text-red-600">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  URL taken
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={generateRandomUrl}
              className="text-sm text-indigo-600 hover:text-indigo-500"
            >
              Generate random
            </button>
          </div>
          {errors.customUrl && <p className="mt-1 text-sm text-red-600">{errors.customUrl}</p>}
          <p className="mt-1 text-sm text-gray-500">
            Your donation page will be available at: <code className="bg-gray-100 px-1 py-0.5 rounded text-xs">/donate/{formData.customUrl || 'your-url'}</code>
          </p>
        </div>
      </div>

      {/* Settings */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
          Settings
        </h3>
        
        <div className="space-y-3">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => handleInputChange('isActive', e.target.checked)}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
              Active (donation page is live and accepting donations)
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="allowAnonymous"
              checked={formData.allowAnonymous}
              onChange={(e) => handleInputChange('allowAnonymous', e.target.checked)}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="allowAnonymous" className="ml-2 block text-sm text-gray-900">
              Allow anonymous donations
            </label>
          </div>
        </div>
      </div>

      {/* Theme Customization */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
          Theme Customization
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="primaryColor" className="block text-sm font-medium text-gray-700 mb-1">
              Primary Color
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                id="primaryColor"
                value={formData.theme.primaryColor}
                onChange={(e) => handleThemeChange('primaryColor', e.target.value)}
                className="h-10 w-16 border border-gray-300 rounded cursor-pointer"
              />
              <input
                type="text"
                value={formData.theme.primaryColor}
                onChange={(e) => handleThemeChange('primaryColor', e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="#3B82F6"
              />
            </div>
          </div>

          <div>
            <label htmlFor="secondaryColor" className="block text-sm font-medium text-gray-700 mb-1">
              Secondary Color
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                id="secondaryColor"
                value={formData.theme.secondaryColor}
                onChange={(e) => handleThemeChange('secondaryColor', e.target.value)}
                className="h-10 w-16 border border-gray-300 rounded cursor-pointer"
              />
              <input
                type="text"
                value={formData.theme.secondaryColor}
                onChange={(e) => handleThemeChange('secondaryColor', e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="#1E40AF"
              />
            </div>
          </div>

          <div>
            <label htmlFor="backgroundColor" className="block text-sm font-medium text-gray-700 mb-1">
              Background Color
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                id="backgroundColor"
                value={formData.theme.backgroundColor}
                onChange={(e) => handleThemeChange('backgroundColor', e.target.value)}
                className="h-10 w-16 border border-gray-300 rounded cursor-pointer"
              />
              <input
                type="text"
                value={formData.theme.backgroundColor}
                onChange={(e) => handleThemeChange('backgroundColor', e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="#FFFFFF"
              />
            </div>
          </div>

          <div>
            <label htmlFor="textColor" className="block text-sm font-medium text-gray-700 mb-1">
              Text Color
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                id="textColor"
                value={formData.theme.textColor}
                onChange={(e) => handleThemeChange('textColor', e.target.value)}
                className="h-10 w-16 border border-gray-300 rounded cursor-pointer"
              />
              <input
                type="text"
                value={formData.theme.textColor}
                onChange={(e) => handleThemeChange('textColor', e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="#1F2937"
              />
            </div>
          </div>
        </div>

        {/* Theme Preview */}
        <div className="mt-4 p-4 border border-gray-200 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Theme Preview</h4>
          <div 
            className="p-4 rounded-lg"
            style={{ 
              backgroundColor: formData.theme.backgroundColor,
              color: formData.theme.textColor 
            }}
          >
            <div className="space-y-2">
              <div 
                className="px-3 py-2 rounded text-center font-medium"
                style={{ backgroundColor: formData.theme.primaryColor, color: '#FFFFFF' }}
              >
                Primary Button
              </div>
              <div 
                className="px-3 py-2 rounded text-center font-medium"
                style={{ backgroundColor: formData.theme.secondaryColor, color: '#FFFFFF' }}
              >
                Secondary Button
              </div>
              <p className="text-sm">Sample text with your chosen colors</p>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-6 border-t border-gray-200">
        <button
          type="submit"
          disabled={isLoading || isCheckingUrl}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Creating...
            </div>
          ) : (
            submitButtonText
          )}
        </button>
      </div>
    </form>
  );
} 