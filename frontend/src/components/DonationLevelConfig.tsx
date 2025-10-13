'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import ResultModal from './ui/result-modal';
import { DonationLevel, OBSSettings } from '../types';
import { Upload, Play, Volume2, Image as ImageIcon, Music, Settings, Eye, Save, TestTube, Plus, Trash2, Edit3, Monitor, Info, Palette } from 'lucide-react';

interface DonationLevelConfigProps {
  settings?: OBSSettings;
  onSave: (levels: DonationLevel[]) => Promise<void>;
  onTest: (level: DonationLevel) => Promise<void>;
}

const DonationLevelConfig: React.FC<DonationLevelConfigProps> = ({
  settings,
  onSave,
  onTest
}) => {
  const [donationLevels, setDonationLevels] = useState<DonationLevel[]>([]);
  const [editingLevel, setEditingLevel] = useState<DonationLevel | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewLevel, setPreviewLevel] = useState<DonationLevel | null>(null);
  const [showWidgetInfo, setShowWidgetInfo] = useState(false);
  const [showFullEditor, setShowFullEditor] = useState(false);
  const levelRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const lastEditedLevelIdRef = useRef<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Modal state for file size warnings
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    details?: string;
  }>({
    isOpen: false,
    type: 'warning',
    title: '',
    message: ''
  });

  // Initialize donation levels from settings
  useEffect(() => {
    console.log('🔄 DonationLevelConfig: Settings changed:', settings);
    console.log('📝 DonationLevelConfig: Donation levels in settings:', settings?.donationLevels);
    if (settings?.donationLevels) {
      console.log('✅ DonationLevelConfig: Setting donation levels:', settings.donationLevels);
      setDonationLevels(settings.donationLevels);
    } else {
      console.log('❌ DonationLevelConfig: No donation levels found in settings');
    }
  }, [settings]);

  const generateLevelId = () => {
    return `level_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const createNewLevel = (): DonationLevel => {
    return {
      levelId: generateLevelId(),
      levelName: '',
      minAmount: 0,
      maxAmount: 100000,
      currency: 'VND',
      isEnabled: true,
      configuration: {
        imageSettings: {
          enabled: true,
          mediaType: 'image',
          width: 300,
          height: 200,
          borderRadius: 8,
          shadow: true,
          shadowColor: '#000000',
          shadowBlur: 10,
          shadowOffsetX: 2,
          shadowOffsetY: 2,
        },
        soundSettings: {
          enabled: true,
          volume: 80,
          fadeIn: 0,
          fadeOut: 0,
          loop: false,
        },
        animationSettings: {
          enabled: true,
          animationType: 'fade',
          duration: 500,
          easing: 'ease-out',
          direction: 'right',
          bounceIntensity: 20,
          zoomScale: 1.2,
        },
        styleSettings: {
          backgroundColor: '#1a1a1a',
          textColor: '#ffffff',
          accentColor: '#00ff00',
          borderColor: '#333333',
          borderWidth: 2,
          borderStyle: 'solid',
          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
          fontSize: 16,
          fontWeight: 'normal',
          fontStyle: 'normal',
          textShadow: true,
          textShadowColor: '#000000',
          textShadowBlur: 3,
          textShadowOffsetX: 1,
          textShadowOffsetY: 1,
        },
        positionSettings: {
          x: 100,
          y: 100,
          anchor: 'top-left',
          zIndex: 1000,
          responsive: true,
          mobileScale: 0.8,
        },
        displaySettings: {
          duration: 5000,
          fadeInDuration: 300,
          fadeOutDuration: 300,
          autoHide: true,
          showProgress: false,
          progressColor: '#00ff00',
          progressHeight: 3,
        },
        generalSettings: {
          enabled: true,
          maxAlerts: 3,
          alertSpacing: 20,
          cooldown: 1000,
          priority: 'medium',
        },
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  };

  const handleAddLevel = () => {
    const newLevel = createNewLevel();
    setEditingLevel(newLevel);
    setShowFullEditor(true);
    lastEditedLevelIdRef.current = newLevel.levelId;
    // Smooth scroll to bottom editor for a nice look
    requestAnimationFrame(() => {
      const bottomEditor = document.getElementById('new-level-editor');
      if (bottomEditor && typeof bottomEditor.scrollIntoView === 'function') {
        bottomEditor.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  };

  const handleEditLevel = (level: DonationLevel) => {
    setEditingLevel({ ...level });
    setShowFullEditor(false);
    lastEditedLevelIdRef.current = level.levelId;
    // Scroll the edited level into view so the editor appears right below it
    requestAnimationFrame(() => {
      const container = levelRefs.current[level.levelId];
      if (container && typeof container.scrollIntoView === 'function') {
        container.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  };

  const handleDeleteLevel = (levelId: string) => {
    setDonationLevels(prev => prev.filter(level => level.levelId !== levelId));
  };

  const handleSaveLevel = async () => {
    if (!editingLevel) return;

    if (!editingLevel.levelName.trim()) {
      setSaveMessage({ type: 'error', text: 'Level name is required' });
      setShowToast(true);
      return;
    }

    if (editingLevel.minAmount >= editingLevel.maxAmount) {
      setSaveMessage({ type: 'error', text: 'Max amount must be greater than min amount' });
      setShowToast(true);
      return;
    }

    try {
      // Compute updated levels synchronously to avoid relying on async state updates
      const existingIndex = donationLevels.findIndex(level => level.levelId === editingLevel.levelId);
      const updatedLevel: DonationLevel = { ...editingLevel, updatedAt: new Date() } as DonationLevel;
      const updatedLevels: DonationLevel[] = existingIndex >= 0
        ? donationLevels.map((lvl, idx) => (idx === existingIndex ? updatedLevel : lvl))
        : [...donationLevels, updatedLevel];

      // For editing existing levels, only save the specific level being edited
      // For new levels, save all levels (including the new one)
      if (existingIndex >= 0) {
        // Editing existing level - only save this specific level
        await onSave([updatedLevel]);
      } else {
        // Adding new level - save all levels including the new one
        await onSave(updatedLevels);
      }

      // Update local state after successful save
      setDonationLevels(updatedLevels);
      setSaveMessage({ type: 'success', text: 'Level saved successfully!' });
      setShowToast(true);
      setEditingLevel(null);
      setShowFullEditor(false);
      // After saving, scroll back to the saved level's position
      const targetId = lastEditedLevelIdRef.current;
      if (targetId) {
        requestAnimationFrame(() => {
          setTimeout(() => {
            const container = levelRefs.current[targetId!];
            if (container && typeof container.scrollIntoView === 'function') {
              container.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }, 200);
        });
      }
    } catch (err) {
      console.error('Failed to save level:', err);
      setSaveMessage({ type: 'error', text: 'Failed to save level. Please try again.' });
      setShowToast(true);
    }
  };

  const handleCancelEdit = () => {
    const wasNewLevel = editingLevel ? !donationLevels.some(l => l.levelId === editingLevel.levelId) : false;
    setEditingLevel(null);
    setShowFullEditor(false);
    // After cancel, scroll back to last edited level if exists, else scroll top if it was a new level
    const targetId = lastEditedLevelIdRef.current;
    requestAnimationFrame(() => {
      setTimeout(() => {
        const container = targetId ? levelRefs.current[targetId] : null;
        if (container && typeof container.scrollIntoView === 'function') {
          container.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else if (wasNewLevel && typeof window !== 'undefined') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 200);
    });
  };

  const handleSave = async () => {
    setIsLoading(true);
    setSaveMessage(null);
    
    try {
      await onSave(donationLevels);
      setSaveMessage({ type: 'success', text: 'Donation levels saved successfully!' });
      setShowToast(true);
      
      setTimeout(() => {
        setSaveMessage(null);
        setShowToast(false);
      }, 5000);
      
    } catch (error) {
      console.error('Failed to save donation levels:', error);
      setSaveMessage({ type: 'error', text: 'Failed to save donation levels. Please try again.' });
      setShowToast(true);
      
      setTimeout(() => {
        setSaveMessage(null);
        setShowToast(false);
      }, 8000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTest = async (level: DonationLevel) => {
    try {
      await onTest(level);
    } catch (error) {
      console.error('Failed to test level:', error);
    }
  };

  const handlePreviewLevel = (level: DonationLevel) => {
    setPreviewLevel(level);
    setShowPreview(true);
  };

  const handleShowWidgetInfo = () => {
    setShowWidgetInfo(true);
  };

  const generateWidgetUrl = (level: DonationLevel) => {
    if (!settings?.widgetUrl) return '';
    return `${settings.widgetUrl}?level=${level.levelId}`;
  };

  const generateAlertToken = (level: DonationLevel) => {
    if (!settings?.alertToken) return '';
    return `${settings.alertToken}_${level.levelId}`;
  };

  const playSound = (soundUrl: string) => {
    if (audioRef.current) {
      audioRef.current.src = soundUrl;
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    }
  };

  const playVideo = (videoUrl: string) => {
    if (videoRef.current) {
      videoRef.current.src = videoUrl;
      videoRef.current.currentTime = 0;
      videoRef.current.play();
    }
  };

  const formatAmount = (amount: number, currency: string) => {
    if (currency === 'VND') {
      return `${amount.toLocaleString('vi-VN')} VND`;
    }
    return `${amount.toLocaleString()} ${currency}`;
  };

  const isEditingExisting = !!(editingLevel && donationLevels.some(l => l.levelId === editingLevel.levelId));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Donation Levels</h2>
          <p className="text-gray-600">Configure different alert settings for different donation amounts</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleShowWidgetInfo}
            className="text-gray-600 border-gray-200 hover:bg-gray-50"
          >
            <Info className="w-4 h-4 mr-2" />
            Widget Info
          </Button>
          <Button
            onClick={handleAddLevel}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Level
          </Button>
        </div>
      </div>

      {/* Donation Levels List */}
      <div className="grid gap-4">
        {donationLevels.map((level) => (
          <div
            key={level.levelId}
            ref={(el) => { levelRefs.current[level.levelId] = el; }}
            id={`level-${level.levelId}`}
          >
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{level.levelName}</CardTitle>
                  <CardDescription>
                    {formatAmount(level.minAmount, level.currency)} - {formatAmount(level.maxAmount, level.currency)}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePreviewLevel(level)}
                    className="text-blue-600 border-blue-200 hover:bg-blue-50"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Preview
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleTest(level)}
                    className="text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                  >
                    <TestTube className="w-4 h-4 mr-1" />
                    Test
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditLevel(level)}
                    className="text-gray-600 border-gray-200 hover:bg-gray-50"
                  >
                    <Edit3 className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteLevel(level.levelId)}
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-600">Status:</span>
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                    level.isEnabled 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {level.isEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Animation:</span>
                  <span className="ml-2">{level.configuration.animationSettings?.animationType || 'fade'}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Duration:</span>
                  <span className="ml-2">{Math.round((level.configuration.displaySettings?.duration || 5000) / 1000)}s</span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Position:</span>
                  <span className="ml-2">{level.configuration.positionSettings?.anchor || 'top-left'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Inline Edit Form: render directly below the level being edited */}
          {editingLevel && editingLevel.levelId === level.levelId && (
            <Card className="border-2 border-indigo-200 shadow-lg mt-2">
              <CardHeader className="bg-gradient-to-r from-indigo-600 to-cyan-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-3 text-white">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Settings className="w-5 h-5" />
                  </div>
                  {editingLevel.levelId.startsWith('level_') ? 'Add New Level' : 'Edit Level'}
                </CardTitle>
                <CardDescription className="text-indigo-100">
                  Configure alert settings for this donation range
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">Level Name</Label>
                    <Input
                      value={editingLevel.levelName}
                      onChange={(e) => setEditingLevel(prev => prev ? { ...prev, levelName: e.target.value } : null)}
                      placeholder="e.g., Small Donation, Big Donation"
                      className="border-gray-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">Currency</Label>
                    <select
                      value={editingLevel.currency}
                      onChange={(e) => setEditingLevel(prev => prev ? { ...prev, currency: e.target.value } : null)}
                      className="w-full p-3 border border-gray-200 rounded-lg bg-white focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                    >
                      <option value="VND">VND</option>
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                    </select>
                  </div>
                </div>
                {/* Amount Range */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">Minimum Amount</Label>
                    <Input
                      type="number"
                      min="0"
                      value={editingLevel.minAmount}
                      onChange={(e) => setEditingLevel(prev => prev ? { ...prev, minAmount: parseFloat(e.target.value) || 0 } : null)}
                      className="border-gray-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">Maximum Amount</Label>
                    <Input
                      type="number"
                      min="0"
                      value={editingLevel.maxAmount}
                      onChange={(e) => setEditingLevel(prev => prev ? { ...prev, maxAmount: parseFloat(e.target.value) || 0 } : null)}
                      className="border-gray-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>
                </div>

                {/* Media Settings */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-800">Media Settings</h4>
                  {/* Image/Video Upload */}
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold text-gray-700">Alert Media</Label>
                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 rounded-lg">
                          <Upload className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div className="flex-1">
                          <Input
                            type="file"
                            accept="image/*,video/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                if (file.size > 10 * 1024 * 1024) {
                                  setModalState({
                                    isOpen: true,
                                    type: 'warning',
                                    title: 'File Too Large',
                                    message: 'File size must be under 10MB.',
                                    details: 'Please choose a smaller file to continue.'
                                  });
                                  return;
                                }
                                const reader = new FileReader();
                                reader.onload = (e) => {
                                  setEditingLevel(prev => prev ? {
                                    ...prev,
                                    configuration: {
                                      ...prev.configuration,
                                      imageSettings: {
                                        ...prev.configuration.imageSettings,
                                        url: e.target?.result as string,
                                        mediaType: file.type.startsWith('video/') ? 'video' : file.type === 'image/gif' ? 'gif' : 'image'
                                      }
                                    }
                                  } : null);
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                            className="border-0 bg-transparent p-0 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-600 file:text-white hover:file:bg-indigo-700"
                          />
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">Maximum file size: 10MB. Supported formats: Images (JPG, PNG, GIF), Videos (MP4, WebM)</p>
                    </div>
                  </div>

                  {/* Sound Upload */}
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold text-gray-700">Alert Sound</Label>
                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 rounded-lg">
                          <Music className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div className="flex-1">
                          <Input
                            type="file"
                            accept="audio/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                if (file.size > 10 * 1024 * 1024) {
                                  setModalState({
                                    isOpen: true,
                                    type: 'warning',
                                    title: 'File Too Large',
                                    message: 'File size must be under 10MB.',
                                    details: 'Please choose a smaller file to continue.'
                                  });
                                  return;
                                }
                                const reader = new FileReader();
                                reader.onload = (e) => {
                                  setEditingLevel(prev => prev ? {
                                    ...prev,
                                    configuration: {
                                      ...prev.configuration,
                                      soundSettings: {
                                        ...prev.configuration.soundSettings,
                                        url: e.target?.result as string
                                      }
                                    }
                                  } : null);
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                            className="border-0 bg-transparent p-0 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-600 file:text-white hover:file:bg-indigo-700"
                          />
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => playSound(editingLevel.configuration.soundSettings?.url || '')}
                          disabled={!editingLevel.configuration.soundSettings?.url}
                          className="border-indigo-300 text-indigo-600 hover:bg-indigo-50 disabled:opacity-50"
                        >
                          <Play className="w-4 h-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">Maximum file size: 10MB. Supported formats: MP3, WAV, OGG</p>
                    </div>
                  </div>
                </div>

                {/* Display Settings */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-800">Display Settings</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-gray-700">Duration (milliseconds)</Label>
                      <Input
                        type="number"
                        min="1000"
                        max="30000"
                        value={editingLevel.configuration?.displaySettings?.duration || 5000}
                        onChange={(e) => setEditingLevel(prev => prev ? {
                          ...prev,
                          configuration: {
                            ...prev.configuration,
                            displaySettings: {
                              ...prev.configuration.displaySettings,
                              duration: parseInt(e.target.value) || 5000
                            }
                          }
                        } : null)}
                        className="border-gray-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-gray-700">Animation Type</Label>
                      <select
                        value={editingLevel.configuration?.animationSettings?.animationType || 'fade'}
                        onChange={(e) => setEditingLevel(prev => prev ? {
                          ...prev,
                          configuration: {
                            ...prev.configuration,
                            animationSettings: {
                              ...prev.configuration.animationSettings,
                              animationType: e.target.value as 'fade' | 'slide' | 'bounce' | 'zoom' | 'none'
                            }
                          }
                        } : null)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-md focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                      >
                        <option value="fade">Fade</option>
                        <option value="slide">Slide</option>
                        <option value="bounce">Bounce</option>
                        <option value="zoom">Zoom</option>
                        <option value="none">None</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-gray-700">Position</Label>
                      <select
                        value={editingLevel.configuration?.positionSettings?.anchor || 'top-right'}
                        onChange={(e) => setEditingLevel(prev => prev ? {
                          ...prev,
                          configuration: {
                            ...prev.configuration,
                            positionSettings: {
                              ...prev.configuration.positionSettings,
                              anchor: e.target.value as 'top-left' | 'top-center' | 'top-right' | 'middle-left' | 'middle-center' | 'middle-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'
                            }
                          }
                        } : null)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-md focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                      >
                        <option value="top-left">Top Left</option>
                        <option value="top-center">Top Center</option>
                        <option value="top-right">Top Right</option>
                        <option value="middle-left">Middle Left</option>
                        <option value="middle-center">Middle Center</option>
                        <option value="middle-right">Middle Right</option>
                        <option value="bottom-left">Bottom Left</option>
                        <option value="bottom-center">Bottom Center</option>
                        <option value="bottom-right">Bottom Right</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-gray-700">Auto Hide</Label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={editingLevel.configuration?.displaySettings?.autoHide !== false}
                          onChange={(e) => setEditingLevel(prev => prev ? {
                            ...prev,
                            configuration: {
                              ...prev.configuration,
                              displaySettings: {
                                ...prev.configuration.displaySettings,
                                autoHide: e.target.checked
                              }
                            }
                          } : null)}
                          className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        />
                        <span className="text-sm text-gray-600">Automatically hide after duration</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Style Settings */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-800">Style Settings</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-gray-700">Background Color</Label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={editingLevel.configuration?.styleSettings?.backgroundColor || '#1a1a1a'}
                          onChange={(e) => setEditingLevel(prev => prev ? {
                            ...prev,
                            configuration: {
                              ...prev.configuration,
                              styleSettings: {
                                ...prev.configuration.styleSettings,
                                backgroundColor: e.target.value
                              }
                            }
                          } : null)}
                          className="w-12 h-10 border border-gray-200 rounded cursor-pointer"
                        />
                        <Input
                          value={editingLevel.configuration?.styleSettings?.backgroundColor || '#1a1a1a'}
                          onChange={(e) => setEditingLevel(prev => prev ? {
                            ...prev,
                            configuration: {
                              ...prev.configuration,
                              styleSettings: {
                                ...prev.configuration.styleSettings,
                                backgroundColor: e.target.value
                              }
                            }
                          } : null)}
                          className="border-gray-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-gray-700">Text Color</Label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={editingLevel.configuration?.styleSettings?.textColor || '#ffffff'}
                          onChange={(e) => setEditingLevel(prev => prev ? {
                            ...prev,
                            configuration: {
                              ...prev.configuration,
                              styleSettings: {
                                ...prev.configuration.styleSettings,
                                textColor: e.target.value
                              }
                            }
                          } : null)}
                          className="w-12 h-10 border border-gray-200 rounded cursor-pointer"
                        />
                        <Input
                          value={editingLevel.configuration?.styleSettings?.textColor || '#ffffff'}
                          onChange={(e) => setEditingLevel(prev => prev ? {
                            ...prev,
                            configuration: {
                              ...prev.configuration,
                              styleSettings: {
                                ...prev.configuration.styleSettings,
                                textColor: e.target.value
                              }
                            }
                          } : null)}
                          className="border-gray-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-gray-700">Font Family</Label>
                      <select
                        value={editingLevel.configuration?.styleSettings?.fontFamily || 'Inter'}
                        onChange={(e) => setEditingLevel(prev => prev ? {
                          ...prev,
                          configuration: {
                            ...prev.configuration,
                            styleSettings: {
                              ...prev.configuration.styleSettings,
                              fontFamily: e.target.value
                            }
                          }
                        } : null)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-md focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                      >
                        <option value="Inter">Inter</option>
                        <option value="Arial">Arial</option>
                        <option value="Helvetica">Helvetica</option>
                        <option value="Times New Roman">Times New Roman</option>
                        <option value="Georgia">Georgia</option>
                        <option value="Verdana">Verdana</option>
                        <option value="Courier New">Courier New</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-gray-700">Font Size (px)</Label>
                      <Input
                        type="number"
                        min="8"
                        max="72"
                        value={editingLevel.configuration?.styleSettings?.fontSize || 16}
                        onChange={(e) => setEditingLevel(prev => prev ? {
                          ...prev,
                          configuration: {
                            ...prev.configuration,
                            styleSettings: {
                              ...prev.configuration.styleSettings,
                              fontSize: parseInt(e.target.value) || 16
                            }
                          }
                        } : null)}
                        className="border-gray-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                      />
                    </div>
                  </div>
                </div>

                {/* Live Preview */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-800">Live Preview</h4>
                  <div className="bg-gray-100 p-4 rounded-lg min-h-[200px] relative overflow-hidden">
                    <div className="text-sm text-gray-600 mb-2">Preview of how your alert will appear:</div>
                    <div className="relative">
                      <div
                        className={`absolute transition-all duration-500 ${
                          editingLevel.configuration?.animationSettings?.animationType === 'fade' ? 'animate-fade-in' :
                          editingLevel.configuration?.animationSettings?.animationType === 'slide' ? 'animate-slide-in' :
                          editingLevel.configuration?.animationSettings?.animationType === 'bounce' ? 'animate-bounce' : ''
                        }`}
                        style={{
                          left: (editingLevel.configuration?.positionSettings?.anchor === 'top-left' || editingLevel.configuration?.positionSettings?.anchor === 'bottom-left') ? '20px' : undefined,
                          top: (editingLevel.configuration?.positionSettings?.anchor === 'top-left' || editingLevel.configuration?.positionSettings?.anchor === 'top-right') ? '20px' : undefined,
                          right: editingLevel.configuration?.positionSettings?.anchor === 'top-right' || editingLevel.configuration?.positionSettings?.anchor === 'bottom-right' ? '20px' : undefined,
                          bottom: editingLevel.configuration?.positionSettings?.anchor === 'bottom-left' || editingLevel.configuration?.positionSettings?.anchor === 'bottom-right' ? '20px' : undefined,
                          backgroundColor: editingLevel.configuration?.styleSettings?.backgroundColor || '#1a1a1a',
                          color: editingLevel.configuration?.styleSettings?.textColor || '#ffffff',
                          fontFamily: editingLevel.configuration?.styleSettings?.fontFamily || 'Inter',
                          fontSize: `${editingLevel.configuration?.styleSettings?.fontSize || 16}px`,
                          fontWeight: 'normal',
                          maxWidth: '250px',
                          padding: '12px',
                          borderRadius: '6px',
                          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                          zIndex: 1000
                        }}
                      >
                        {editingLevel.configuration?.imageSettings?.url && (
                          <div className="mb-2">
                            {editingLevel.configuration.imageSettings.mediaType === 'video' ? (
                              <video
                                src={editingLevel.configuration.imageSettings.url}
                                className="w-full h-16 object-cover rounded"
                                muted
                                autoPlay
                                loop
                              />
                            ) : (
                              <img
                                src={editingLevel.configuration.imageSettings.url}
                                alt="Alert media"
                                className="w-full h-16 object-cover rounded"
                              />
                            )}
                          </div>
                        )}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-sm">John Doe</span>
                            <span className="text-xs opacity-75">
                              {formatAmount(editingLevel.minAmount, editingLevel.currency)}
                            </span>
                          </div>
                          <p className="text-xs opacity-90">Thank you for the stream!</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4 border-t border-gray-200">
                  <Button
                    onClick={handleSaveLevel}
                    className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Level
                  </Button>
                  {/* Removed Advanced settings button: full editor now opens directly when editing */}
                  <Button
                    variant="outline"
                    onClick={handleCancelEdit}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
          </div>
        ))}

        {donationLevels.length === 0 && (
          <Card className="border-2 border-dashed border-gray-300">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="text-gray-400 mb-4">
                <Settings className="w-12 h-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No donation levels configured</h3>
              <p className="text-gray-600 text-center mb-4">
                Create different alert configurations for different donation amounts
              </p>
              <Button
                onClick={handleAddLevel}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add First Level
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Bottom Edit Form (only for new levels not yet in the list) */}
      {editingLevel && !isEditingExisting && (
        <Card id="new-level-editor" className="border-2 border-indigo-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-indigo-600 to-cyan-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-3 text-white">
              <div className="p-2 bg-white/20 rounded-lg">
                <Settings className="w-5 h-5" />
              </div>
              {editingLevel.levelId.startsWith('level_') ? 'Add New Level' : 'Edit Level'}
            </CardTitle>
            <CardDescription className="text-indigo-100">
              Configure alert settings for this donation range
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700">Level Name</Label>
                <Input
                  value={editingLevel.levelName}
                  onChange={(e) => setEditingLevel(prev => prev ? { ...prev, levelName: e.target.value } : null)}
                  placeholder="e.g., Small Donation, Big Donation"
                  className="border-gray-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700">Currency</Label>
                <select
                  value={editingLevel.currency}
                  onChange={(e) => setEditingLevel(prev => prev ? { ...prev, currency: e.target.value } : null)}
                  className="w-full p-3 border border-gray-200 rounded-lg bg-white focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                >
                  <option value="VND">VND</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
            </div>

            {/* Amount Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700">Minimum Amount</Label>
                <Input
                  type="number"
                  min="0"
                  value={editingLevel.minAmount}
                  onChange={(e) => setEditingLevel(prev => prev ? { ...prev, minAmount: parseFloat(e.target.value) || 0 } : null)}
                  className="border-gray-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700">Maximum Amount</Label>
                <Input
                  type="number"
                  min="0"
                  value={editingLevel.maxAmount}
                  onChange={(e) => setEditingLevel(prev => prev ? { ...prev, maxAmount: parseFloat(e.target.value) || 0 } : null)}
                  className="border-gray-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                />
              </div>
            </div>

            {/* Media Settings */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-800">Media Settings</h4>
              
              {/* Image/Video Upload */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-700">Alert Media</Label>
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                      <Upload className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div className="flex-1">
                      <Input
                        type="file"
                        accept="image/*,video/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            if (file.size > 10 * 1024 * 1024) {
                              setModalState({
                                isOpen: true,
                                type: 'warning',
                                title: 'File Too Large',
                                message: 'File size must be under 10MB.',
                                details: 'Please choose a smaller file to continue.'
                              });
                              return;
                            }
                            const reader = new FileReader();
                            reader.onload = (e) => {
                              setEditingLevel(prev => prev ? {
                                ...prev,
                                configuration: {
                                  ...prev.configuration,
                                  imageSettings: {
                                    ...prev.configuration.imageSettings,
                                    url: e.target?.result as string,
                                    mediaType: file.type.startsWith('video/') ? 'video' : file.type === 'image/gif' ? 'gif' : 'image'
                                  }
                                }
                              } : null);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="border-0 bg-transparent p-0 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-600 file:text-white hover:file:bg-indigo-700"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Maximum file size: 10MB. Supported formats: Images (JPG, PNG, GIF), Videos (MP4, WebM)</p>
                </div>
              </div>

              {/* Sound Upload */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-700">Alert Sound</Label>
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                      <Music className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div className="flex-1">
                      <Input
                        type="file"
                        accept="audio/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            if (file.size > 10 * 1024 * 1024) {
                              setModalState({
                                isOpen: true,
                                type: 'warning',
                                title: 'File Too Large',
                                message: 'File size must be under 10MB.',
                                details: 'Please choose a smaller file to continue.'
                              });
                              return;
                            }
                            const reader = new FileReader();
                            reader.onload = (e) => {
                              setEditingLevel(prev => prev ? {
                                ...prev,
                                configuration: {
                                  ...prev.configuration,
                                  soundSettings: {
                                    ...prev.configuration.soundSettings,
                                    url: e.target?.result as string
                                  }
                                }
                              } : null);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="border-0 bg-transparent p-0 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-600 file:text-white hover:file:bg-indigo-700"
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => playSound(editingLevel.configuration.soundSettings?.url || '')}
                      disabled={!editingLevel.configuration.soundSettings?.url}
                      className="border-indigo-300 text-indigo-600 hover:bg-indigo-50 disabled:opacity-50"
                    >
                      <Play className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Maximum file size: 10MB. Supported formats: MP3, WAV, OGG</p>
                </div>
              </div>
            </div>

            {/* Display Settings */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-800">Display Settings</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">Duration (milliseconds)</Label>
                  <Input
                    type="number"
                    min="1000"
                    max="30000"
                    value={editingLevel.configuration?.displaySettings?.duration || 5000}
                    onChange={(e) => setEditingLevel(prev => prev ? {
                      ...prev,
                      configuration: {
                        ...prev.configuration,
                        displaySettings: {
                          ...prev.configuration.displaySettings,
                          duration: parseInt(e.target.value) || 5000
                        }
                      }
                    } : null)}
                    className="border-gray-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">Animation Type</Label>
                  <select
                    value={editingLevel.configuration?.animationSettings?.animationType || 'fade'}
                    onChange={(e) => setEditingLevel(prev => prev ? {
                      ...prev,
                      configuration: {
                        ...prev.configuration,
                        animationSettings: {
                          ...prev.configuration.animationSettings,
                          animationType: e.target.value as 'fade' | 'slide' | 'bounce' | 'zoom' | 'none'
                        }
                      }
                    } : null)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-md focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                  >
                    <option value="fade">Fade</option>
                    <option value="slide">Slide</option>
                    <option value="bounce">Bounce</option>
                    <option value="zoom">Zoom</option>
                    <option value="none">None</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">Position</Label>
                  <select
                    value={editingLevel.configuration?.positionSettings?.anchor || 'top-right'}
                    onChange={(e) => setEditingLevel(prev => prev ? {
                      ...prev,
                      configuration: {
                        ...prev.configuration,
                        positionSettings: {
                          ...prev.configuration.positionSettings,
                          anchor: e.target.value as 'top-left' | 'top-center' | 'top-right' | 'middle-left' | 'middle-center' | 'middle-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'
                        }
                      }
                    } : null)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-md focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                  >
                    <option value="top-left">Top Left</option>
                    <option value="top-center">Top Center</option>
                    <option value="top-right">Top Right</option>
                    <option value="middle-left">Middle Left</option>
                    <option value="middle-center">Middle Center</option>
                    <option value="middle-right">Middle Right</option>
                    <option value="bottom-left">Bottom Left</option>
                    <option value="bottom-center">Bottom Center</option>
                    <option value="bottom-right">Bottom Right</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">Auto Hide</Label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={editingLevel.configuration?.displaySettings?.autoHide !== false}
                      onChange={(e) => setEditingLevel(prev => prev ? {
                        ...prev,
                        configuration: {
                          ...prev.configuration,
                          displaySettings: {
                            ...prev.configuration.displaySettings,
                            autoHide: e.target.checked
                          }
                        }
                      } : null)}
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-600">Automatically hide after duration</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Style Settings */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-800">Style Settings</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">Background Color</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={editingLevel.configuration?.styleSettings?.backgroundColor || '#1a1a1a'}
                      onChange={(e) => setEditingLevel(prev => prev ? {
                        ...prev,
                        configuration: {
                          ...prev.configuration,
                          styleSettings: {
                            ...prev.configuration.styleSettings,
                            backgroundColor: e.target.value
                          }
                        }
                      } : null)}
                      className="w-12 h-10 border border-gray-200 rounded cursor-pointer"
                    />
                    <Input
                      value={editingLevel.configuration?.styleSettings?.backgroundColor || '#1a1a1a'}
                      onChange={(e) => setEditingLevel(prev => prev ? {
                        ...prev,
                        configuration: {
                          ...prev.configuration,
                          styleSettings: {
                            ...prev.configuration.styleSettings,
                            backgroundColor: e.target.value
                          }
                        }
                      } : null)}
                      className="border-gray-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">Text Color</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={editingLevel.configuration?.styleSettings?.textColor || '#ffffff'}
                      onChange={(e) => setEditingLevel(prev => prev ? {
                        ...prev,
                        configuration: {
                          ...prev.configuration,
                          styleSettings: {
                            ...prev.configuration.styleSettings,
                            textColor: e.target.value
                          }
                        }
                      } : null)}
                      className="w-12 h-10 border border-gray-200 rounded cursor-pointer"
                    />
                    <Input
                      value={editingLevel.configuration?.styleSettings?.textColor || '#ffffff'}
                      onChange={(e) => setEditingLevel(prev => prev ? {
                        ...prev,
                        configuration: {
                          ...prev.configuration,
                          styleSettings: {
                            ...prev.configuration.styleSettings,
                            textColor: e.target.value
                          }
                        }
                      } : null)}
                      className="border-gray-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">Font Family</Label>
                  <select
                    value={editingLevel.configuration?.styleSettings?.fontFamily || 'Inter'}
                    onChange={(e) => setEditingLevel(prev => prev ? {
                      ...prev,
                      configuration: {
                        ...prev.configuration,
                        styleSettings: {
                          ...prev.configuration.styleSettings,
                          fontFamily: e.target.value
                        }
                      }
                    } : null)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-md focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                  >
                    <option value="Inter">Inter</option>
                    <option value="Arial">Arial</option>
                    <option value="Helvetica">Helvetica</option>
                    <option value="Times New Roman">Times New Roman</option>
                    <option value="Georgia">Georgia</option>
                    <option value="Verdana">Verdana</option>
                    <option value="Courier New">Courier New</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">Font Size (px)</Label>
                  <Input
                    type="number"
                    min="8"
                    max="72"
                    value={editingLevel.configuration?.styleSettings?.fontSize || 16}
                    onChange={(e) => setEditingLevel(prev => prev ? {
                      ...prev,
                      configuration: {
                        ...prev.configuration,
                        styleSettings: {
                          ...prev.configuration.styleSettings,
                          fontSize: parseInt(e.target.value) || 16
                        }
                      }
                    } : null)}
                    className="border-gray-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
              </div>
            </div>

            {/* Live Preview */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-800">Live Preview</h4>
              <div className="bg-gray-100 p-4 rounded-lg min-h-[200px] relative overflow-hidden">
                <div className="text-sm text-gray-600 mb-2">Preview of how your alert will appear:</div>
                <div className="relative">
                  {/* Preview Alert */}
                  <div
                    className={`absolute transition-all duration-500 ${
                      editingLevel.configuration?.animationSettings?.animationType === 'fade' ? 'animate-fade-in' :
                      editingLevel.configuration?.animationSettings?.animationType === 'slide' ? 'animate-slide-in' :
                      editingLevel.configuration?.animationSettings?.animationType === 'bounce' ? 'animate-bounce' : ''
                    }`}
                    style={{
                      left: (editingLevel.configuration?.positionSettings?.anchor === 'top-left' || editingLevel.configuration?.positionSettings?.anchor === 'bottom-left') ? '20px' : undefined,
                      top: (editingLevel.configuration?.positionSettings?.anchor === 'top-left' || editingLevel.configuration?.positionSettings?.anchor === 'top-right') ? '20px' : undefined,
                      right: editingLevel.configuration?.positionSettings?.anchor === 'top-right' || editingLevel.configuration?.positionSettings?.anchor === 'bottom-right' ? '20px' : undefined,
                      bottom: editingLevel.configuration?.positionSettings?.anchor === 'bottom-left' || editingLevel.configuration?.positionSettings?.anchor === 'bottom-right' ? '20px' : undefined,
                      backgroundColor: editingLevel.configuration?.styleSettings?.backgroundColor || '#1a1a1a',
                      color: editingLevel.configuration?.styleSettings?.textColor || '#ffffff',
                      fontFamily: editingLevel.configuration?.styleSettings?.fontFamily || 'Inter',
                      fontSize: `${editingLevel.configuration?.styleSettings?.fontSize || 16}px`,
                      fontWeight: 'normal',
                      maxWidth: '250px',
                      padding: '12px',
                      borderRadius: '6px',
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                      zIndex: 1000
                    }}
                  >
                    {/* Media Display */}
                    {editingLevel.configuration?.imageSettings?.url && (
                      <div className="mb-2">
                        {editingLevel.configuration.imageSettings.mediaType === 'video' ? (
                          <video
                            src={editingLevel.configuration.imageSettings.url}
                            className="w-full h-16 object-cover rounded"
                            muted
                            autoPlay
                            loop
                          />
                        ) : (
                          <img
                            src={editingLevel.configuration.imageSettings.url}
                            alt="Alert media"
                            className="w-full h-16 object-cover rounded"
                          />
                        )}
                      </div>
                    )}

                    {/* Alert Content */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm">John Doe</span>
                        <span className="text-xs opacity-75">
                          {formatAmount(editingLevel.minAmount, editingLevel.currency)}
                        </span>
                      </div>
                      <p className="text-xs opacity-90">Thank you for the stream!</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4 border-t border-gray-200">
              <Button
                onClick={handleSaveLevel}
                className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Level
              </Button>
              <Button
                variant="outline"
                onClick={handleCancelEdit}
                className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Save All Button */}
      {donationLevels.length > 0 && (
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={isLoading}
            className={`bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
              isLoading ? 'animate-pulse' : ''
            }`}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving Levels...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save All Levels
              </>
            )}
          </Button>
        </div>
      )}

      {/* Messages */}
      {saveMessage && (
        <div className={`mt-4 p-4 rounded-xl border-2 shadow-lg animate-fade-in ${
          saveMessage.type === 'success' 
            ? 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-900 border-green-300' 
            : 'bg-gradient-to-r from-red-50 to-rose-50 text-red-900 border-red-300'
        }`}>
          <div className="flex items-center">
            {saveMessage.type === 'success' ? (
              <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            ) : (
              <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
            )}
            <div className="flex-1">
              <p className="font-semibold text-sm">{saveMessage.text}</p>
            </div>
          </div>
        </div>
      )}

      {/* Hidden Audio/Video Elements for Preview */}
      <audio ref={audioRef} />
      <video ref={videoRef} muted />

      {/* File Size Warning Modal */}
      <ResultModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState(prev => ({ ...prev, isOpen: false }))}
        type={modalState.type}
        title={modalState.title}
        message={modalState.message}
        details={modalState.details}
      />

      {/* Toast Notification */}
      {showToast && saveMessage && (
        <div className={`fixed top-4 right-4 z-50 max-w-sm w-full transform transition-all duration-300 ease-in-out ${
          showToast ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
        }`}>
          <div className={`p-4 rounded-lg shadow-lg border-l-4 ${
            saveMessage.type === 'success' 
              ? 'bg-green-50 border-green-400 text-green-800' 
              : 'bg-red-50 border-red-400 text-red-800'
          }`}>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                {saveMessage.type === 'success' ? (
                  <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">{saveMessage.text}</p>
              </div>
              <div className="ml-auto pl-3">
                <button
                  onClick={() => {
                    setShowToast(false);
                    setSaveMessage(null);
                  }}
                  className={`inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    saveMessage.type === 'success' 
                      ? 'text-green-500 hover:bg-green-100 focus:ring-green-600' 
                      : 'text-red-500 hover:bg-red-100 focus:ring-red-600'
                  }`}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && previewLevel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Preview: {previewLevel.levelName}</h3>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Level Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Level Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Range:</span>
                    <span className="ml-2 font-medium">
                      {formatAmount(previewLevel.minAmount, previewLevel.currency)} - {formatAmount(previewLevel.maxAmount, previewLevel.currency)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Status:</span>
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                      previewLevel.isEnabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {previewLevel.isEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Media Preview */}
              {previewLevel.configuration?.imageSettings?.url && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Image Preview</h4>
                  <div className="flex justify-center">
                    <img
                      src={previewLevel.configuration.imageSettings.url}
                      alt="Level preview"
                      className="max-w-full h-32 object-cover rounded-lg"
                    />
                  </div>
                </div>
              )}

              {/* Sound Preview */}
              {previewLevel.configuration?.soundSettings?.url && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Sound Preview</h4>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => playSound(previewLevel.configuration.soundSettings.url)}
                      className="text-blue-600 border-blue-200 hover:bg-blue-50"
                    >
                      <Volume2 className="w-4 h-4 mr-1" />
                      Play
                    </Button>
                    <span className="text-sm text-gray-600">
                      Volume: {previewLevel.configuration.soundSettings.volume || 80}%
                    </span>
                  </div>
                </div>
              )}

              {/* Display Settings */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Display Settings</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Duration:</span>
                    <span className="ml-2 font-medium">
                      {previewLevel.configuration?.displaySettings?.duration || 5000}ms
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Animation:</span>
                    <span className="ml-2 font-medium">
                      {previewLevel.configuration?.animationSettings?.animationType || 'fade'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Position:</span>
                    <span className="ml-2 font-medium">
                      {previewLevel.configuration?.positionSettings?.anchor || 'top-right'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Auto Hide:</span>
                    <span className="ml-2 font-medium">
                      {previewLevel.configuration?.displaySettings?.autoHide ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Style Settings */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Style Settings</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Background:</span>
                    <span className="ml-2 font-medium">
                      {previewLevel.configuration?.styleSettings?.backgroundColor || '#1a1a1a'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Text Color:</span>
                    <span className="ml-2 font-medium">
                      {previewLevel.configuration?.styleSettings?.textColor || '#ffffff'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Font:</span>
                    <span className="ml-2 font-medium">
                      {previewLevel.configuration?.styleSettings?.fontFamily || 'Inter'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Font Size:</span>
                    <span className="ml-2 font-medium">
                      {previewLevel.configuration?.styleSettings?.fontSize || 16}px
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowPreview(false)}
              >
                Close
              </Button>
              <Button
                onClick={() => {
                  setShowPreview(false);
                  handleTest(previewLevel);
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                <TestTube className="w-4 h-4 mr-2" />
                Test This Level
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Widget Information Modal */}
      {showWidgetInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Widget Information</h3>
              <button
                onClick={() => setShowWidgetInfo(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-6">
              {/* General Widget Info */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-3 flex items-center">
                  <Monitor className="w-5 h-5 mr-2" />
                  General Widget Information
                </h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-blue-800 font-medium">Base Widget URL:</span>
                    <div className="mt-1 p-2 bg-white rounded border font-mono text-xs break-all">
                      {settings?.widgetUrl || 'Not configured'}
                    </div>
                  </div>
                  <div>
                    <span className="text-blue-800 font-medium">Base Alert Token:</span>
                    <div className="mt-1 p-2 bg-white rounded border font-mono text-xs break-all">
                      {settings?.alertToken || 'Not configured'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Level-Specific URLs */}
              {donationLevels.length > 0 && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-3 flex items-center">
                    <Palette className="w-5 h-5 mr-2" />
                    Level-Specific Widget URLs
                  </h4>
                  <div className="space-y-4">
                    {donationLevels.map((level) => (
                      <div key={level.levelId} className="bg-white p-3 rounded border">
                        <div className="flex justify-between items-start mb-2">
                          <h5 className="font-medium text-gray-900">{level.levelName}</h5>
                          <span className="text-xs text-gray-500">
                            {formatAmount(level.minAmount, level.currency)} - {formatAmount(level.maxAmount, level.currency)}
                          </span>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="text-gray-600">Widget URL:</span>
                            <div className="mt-1 p-2 bg-gray-50 rounded border font-mono text-xs break-all">
                              {generateWidgetUrl(level)}
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-600">Alert Token:</span>
                            <div className="mt-1 p-2 bg-gray-50 rounded border font-mono text-xs break-all">
                              {generateAlertToken(level)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* OBS Setup Instructions */}
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-medium text-yellow-900 mb-3">OBS Setup Instructions</h4>
                <div className="text-sm text-yellow-800 space-y-2">
                  <p>1. In OBS Studio, add a new "Browser Source"</p>
                  <p>2. Set the URL to one of the level-specific widget URLs above</p>
                  <p>3. Set the width to 1920 and height to 1080 (or your stream resolution)</p>
                  <p>4. Check "Shutdown source when not visible" and "Refresh browser when scene becomes active"</p>
                  <p>5. The widget will automatically show alerts based on donation amounts</p>
                </div>
              </div>

              {/* API Integration */}
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-medium text-purple-900 mb-3">API Integration</h4>
                <div className="text-sm text-purple-800 space-y-2">
                  <p>To trigger alerts programmatically, send a POST request to:</p>
                  <div className="mt-2 p-2 bg-white rounded border font-mono text-xs">
                    POST /api/donations/trigger-alert
                  </div>
                  <p className="mt-2">With the following payload:</p>
                  <div className="mt-2 p-2 bg-white rounded border font-mono text-xs">
                    {`{
  "donorName": "John Doe",
  "amount": "50000",
  "currency": "VND",
  "message": "Thank you for the stream!",
  "levelId": "level_1" // Optional: specify level ID
}`}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <Button
                variant="outline"
                onClick={() => setShowWidgetInfo(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DonationLevelConfig;
