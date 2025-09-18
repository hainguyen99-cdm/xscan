'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import ResultModal from './ui/result-modal';
import { OBSSettings, OBSSettingsForm } from '../types';
import { Upload, Play, Volume2, Image as ImageIcon, Music, Settings, Eye, Save, TestTube } from 'lucide-react';

interface OBSSettingsConfigProps {
  settings?: OBSSettings;
  onSave: (settings: OBSSettingsForm) => Promise<void>;
  onTest: (settings: OBSSettings) => Promise<void>;
}

const OBSSettingsConfig: React.FC<OBSSettingsConfigProps> = ({
  settings,
  onSave,
  onTest
}) => {
  const [formData, setFormData] = useState<OBSSettingsForm>({
    // alertToken is read-only and managed by the backend
    customization: {
      image: undefined,
      sound: undefined,
      text: {
        font: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
        fontSize: 16,
        color: '#ffffff',
        backgroundColor: '#1a1a1a',
        animation: 'fade'
      },
      position: 'top-right',
      duration: 5 // Use seconds as default (5 seconds) - will be converted to milliseconds when saving
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showToast, setShowToast] = useState(false);
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

  // Initialize form with existing settings
  useEffect(() => {
    if (settings) {
      // Use the legacy customization format if available, otherwise convert from new structure
      const customization = settings.customization || {
        image: settings.imageSettings?.url ? {
          url: settings.imageSettings.url,
          type: settings.imageSettings.mediaType,
          duration: 5
        } : undefined,
        sound: settings.soundSettings?.url ? {
          url: settings.soundSettings.url,
          volume: settings.soundSettings.volume,
          duration: 3
        } : undefined,
        text: {
          font: settings.styleSettings?.fontFamily || 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
          fontSize: settings.styleSettings?.fontSize || 16,
          color: settings.styleSettings?.textColor || '#ffffff',
          backgroundColor: settings.styleSettings?.backgroundColor || '#1a1a1a',
          animation: settings.animationSettings?.animationType || 'fade'
        },
        position: settings.positionSettings?.anchor || 'top-right',
        duration: Math.round((settings.displaySettings?.duration || 5000) / 1000) // Convert ms to seconds
      };

      setFormData({
        customization: {
          ...customization,
          image: customization.image || undefined,
          sound: customization.sound || undefined,
          // Convert duration from milliseconds to seconds for the form
          duration: Math.round((customization.duration || 5000) / 1000)
        }
      });
    }
  }, [settings]);

  // Update preview data when form changes
  useEffect(() => {
    setPreviewData({
      donorName: 'Test Donor',
      amount: 25.00,
      currency: 'VND',
      message: 'This is a test alert message to preview your OBS configuration!',
      position: formData.customization.position,
      animation: formData.customization.text?.animation || 'fade',
      image: formData.customization.image,
      sound: formData.customization.sound,
      duration: formData.customization.duration, // Add duration to preview data
      colors: {
        background: formData.customization.text?.backgroundColor || '#1a1a1a',
        text: formData.customization.text?.color || '#ffffff',
        accent: '#3b82f6'
      },
      fonts: {
        family: formData.customization.text?.font || 'Inter',
        size: formData.customization.text?.fontSize || 16,
        weight: 'normal'
      }
    });
  }, [formData]);

  const handleInputChange = useCallback((path: string, value: any) => {
    setFormData(prev => {
      const newData = { ...prev };
      const keys = path.split('.');
      let current: any = newData;
      
      // Navigate to the parent object, creating intermediate objects if they don't exist
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }
      
      // Set the final value
      current[keys[keys.length - 1]] = value;
      return newData;
    });
  }, []);

  const handleFileUpload = useCallback((type: 'image' | 'sound', file: File) => {
    if (type === 'image') {
      const reader = new FileReader();
      reader.onload = (e) => {
        handleInputChange('customization.image.url', e.target?.result);
      };
      reader.readAsDataURL(file);
    } else if (type === 'sound') {
      const reader = new FileReader();
      reader.onload = (e) => {
        handleInputChange('customization.sound.url', e.target?.result);
      };
      reader.readAsDataURL(file);
    }
  }, [handleInputChange]);

  const handleSave = async () => {
    setIsLoading(true);
    setSaveMessage(null); // Clear any previous messages
    
    try {
      // Convert form data to match backend DTO structure
      const updateData: OBSSettingsForm = {
        // Don't send alertToken - it's read-only and managed by the backend
        customization: {
          image: formData.customization.image?.url ? {
            url: formData.customization.image.url,
            type: formData.customization.image.type,
            duration: formData.customization.image.duration
          } : undefined,
          sound: formData.customization.sound?.url ? {
            url: formData.customization.sound.url,
            volume: formData.customization.sound.volume,
            duration: formData.customization.sound.duration
          } : undefined,
          text: formData.customization.text,
          position: formData.customization.position,
          // Convert duration from seconds to milliseconds for the backend
          duration: formData.customization.duration * 1000
        }
      };

      await onSave(updateData);
      
      // Show success feedback
      console.log('✅ OBS settings saved successfully');
      setSaveMessage({ type: 'success', text: '✅ OBS settings saved successfully!' });
      setShowToast(true);
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setSaveMessage(null);
        setShowToast(false);
      }, 5000);
      
    } catch (error) {
      console.error('❌ Failed to save OBS settings:', error);
      
      // Show error feedback with specific error handling
      let errorMessage = 'Failed to save OBS settings. Please try again.';
      
      if (error instanceof Error) {
        if (error.message.includes('413') || error.message.includes('Payload Too Large')) {
          errorMessage = 'File size too large. Please ensure all files are under 10MB.';
        } else if (error.message.includes('401') || error.message.includes('Unauthorized')) {
          errorMessage = 'Authentication required. Please log in again.';
        } else if (error.message.includes('403') || error.message.includes('Forbidden')) {
          errorMessage = 'Access denied. You do not have permission to save OBS settings.';
        } else if (error.message.includes('404') || error.message.includes('Not Found')) {
          errorMessage = 'OBS settings not found. Please create settings first.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setSaveMessage({ type: 'error', text: `❌ ${errorMessage}` });
      setShowToast(true);
      
      // Clear error message after 8 seconds (longer for errors)
      setTimeout(() => {
        setSaveMessage(null);
        setShowToast(false);
      }, 8000);
      
      // Re-throw the error so the parent component can handle it
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleTest = async () => {
    if (!settings) return;
    
    try {
      // Convert form data to match OBSSettings type
      const updatedCustomization = {
        image: formData.customization.image?.url ? {
          url: formData.customization.image.url,
          type: formData.customization.image.type,
          duration: formData.customization.image.duration,
        } : undefined,
        sound: formData.customization.sound?.url ? {
          url: formData.customization.sound.url,
          volume: formData.customization.sound.volume,
          duration: formData.customization.sound.duration,
        } : undefined,
        text: formData.customization.text,
        position: formData.customization.position,
        duration: formData.customization.duration * 1000, // Convert to milliseconds for testing
      };

      await onTest({
        ...settings,
        customization: updatedCustomization
      });
    } catch (error) {
      console.error('Failed to test alert:', error);
    }
  };

  const playSound = () => {
    if (audioRef.current && formData.customization.sound?.url) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    }
  };

  const playVideo = () => {
    if (videoRef.current && formData.customization.image?.url && formData.customization.image.type === 'video') {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
    }
  };

  const fontFamilies = [
    // Popular Sans-serif fonts
    'Inter', 'Arial', 'Helvetica', 'Verdana', 'Tahoma', 'Trebuchet MS', 'Arial Black', 'Impact',
    'Franklin Gothic Medium', 'Gill Sans', 'Lucida Sans Unicode', 'Lucida Grande', 'Geneva',
    'Segoe UI', 'Roboto', 'Open Sans', 'Lato', 'Source Sans Pro', 'Nunito', 'Poppins',
    'Montserrat', 'Raleway', 'Ubuntu', 'PT Sans', 'Droid Sans', 'Liberation Sans',
    
    // Google Fonts - Sans-serif
    'Work Sans', 'DM Sans', 'Manrope', 'Outfit', 'Plus Jakarta Sans', 'Figtree',
    'Space Grotesk', 'Inter Tight', 'Sora', 'Epilogue', 'Cabinet Grotesk', 'Satoshi',
    'Geist', 'SF Pro Display', 'SF Pro Text', 'Circular', 'Proxima Nova', 'Avenir',
    'Futura', 'Gotham', 'Brandon Grotesque', 'Neue Haas Grotesk', 'Helvetica Neue',
    
    // Serif fonts
    'Times New Roman', 'Georgia', 'Times', 'Palatino', 'Book Antiqua', 'Garamond',
    'Minion Pro', 'Baskerville', 'Hoefler Text', 'Bodoni MT', 'Didot', 'American Typewriter',
    'Courier', 'Courier New', 'Monaco', 'Menlo', 'Consolas', 'Liberation Mono',
    'PT Serif', 'Crimson Text', 'Lora', 'Merriweather', 'Playfair Display', 'Libre Baskerville',
    
    // Google Fonts - Serif
    'Source Serif Pro', 'Crimson Pro', 'Libre Baskerville', 'Lora', 'Merriweather',
    'Playfair Display', 'PT Serif', 'Crimson Text', 'EB Garamond', 'Libre Caslon Text',
    'Cormorant Garamond', 'Old Standard TT', 'Alegreya', 'Lusitana', 'Vollkorn',
    'Crimson Pro', 'Source Serif 4', 'Fraunces', 'Recoleta', 'Charter', 'Iowan Old Style',
    
    // Display/Decorative fonts
    'Comic Sans MS', 'Papyrus', 'Chalkduster', 'Bradley Hand', 'Brush Script MT',
    'Marker Felt', 'Trattatello', 'Zapfino', 'Snell Roundhand', 'Apple Chancery',
    'Lucida Handwriting', 'Kalam', 'Caveat', 'Dancing Script', 'Pacifico', 'Lobster',
    'Bebas Neue', 'Oswald', 'Anton', 'Fjalla One', 'Righteous', 'Fredoka One',
    
    // Google Fonts - Display
    'Bebas Neue', 'Oswald', 'Anton', 'Fjalla One', 'Righteous', 'Fredoka One',
    'Bungee', 'Bungee Shade', 'Creepster', 'Fascinate', 'Fascinate Inline', 'Faster One',
    'Flamenco', 'Freckle Face', 'Frijole', 'Fruktur', 'Fugaz One', 'Gravitas One',
    'Iceberg', 'Iceland', 'Jolly Lodger', 'Knewave', 'Lemon', 'Londrina Outline',
    'Londrina Shadow', 'Londrina Sketch', 'Londrina Solid', 'Love Ya Like A Sister',
    'Luckiest Guy', 'Macondo', 'Macondo Swash Caps', 'Merienda', 'Merienda One',
    'Metal', 'Metal Mania', 'Miltonian', 'Miltonian Tattoo', 'Miniver', 'Monofett',
    'Monoton', 'Mountains of Christmas', 'Mouse Memoirs', 'Mystery Quest', 'Nerko One',
    'New Rocker', 'Nosifer', 'Notable', 'Nova Cut', 'Nova Flat', 'Nova Mono',
    'Nova Oval', 'Nova Round', 'Nova Script', 'Nova Slim', 'Nova Square', 'Numans',
    'Orbitron', 'Oregano', 'Original Surfer', 'Overlock', 'Overlock SC', 'Ovo',
    'Oxanium', 'Oxygen', 'Oxygen Mono', 'PT Mono', 'Pacifico', 'Padauk',
    'Palanquin', 'Palanquin Dark', 'Pangolin', 'Paprika', 'Parisienne', 'Passero One',
    'Passion One', 'Pathway Gothic One', 'Patrick Hand', 'Patrick Hand SC', 'Pattaya',
    'Patua One', 'Pavanam', 'Paytone One', 'Peddana', 'Peralta', 'Permanent Marker',
    'Petit Formal Script', 'Petrona', 'Philosopher', 'Piedra', 'Pinyon Script',
    'Pirata One', 'Plaster', 'Play', 'Playball', 'Playfair Display', 'Playfair Display SC',
    'Podkova', 'Poiret One', 'Poller One', 'Poly', 'Pompiere', 'Pontano Sans',
    'Poppins', 'Port Lligat Sans', 'Port Lligat Slab', 'Potta One', 'Pragati Narrow',
    'Prata', 'Preahvihear', 'Press Start 2P', 'Pridi', 'Princess Sofia', 'Prociono',
    'Prompt', 'Prosto One', 'Proza Libre', 'Puritan', 'Purple Purse', 'Quando',
    'Quantico', 'Quattrocento', 'Quattrocento Sans', 'Questrial', 'Quicksand',
    'Quintessential', 'Qwigley', 'Racing Sans One', 'Radley', 'Rajdhani', 'Rakkas',
    'Raleway', 'Raleway Dots', 'Ramabhadra', 'Ramaraja', 'Rambla', 'Rammetto One',
    'Ranchers', 'Rancho', 'Ranga', 'Rasa', 'Rationale', 'Ravi Prakash', 'Recursive',
    'Red Hat Display', 'Red Hat Mono', 'Red Hat Text', 'Red Rose', 'Redressed',
    'Reem Kufi', 'Reenie Beanie', 'Reggae One', 'Revalia', 'Rhodium Libre', 'Ribeye',
    'Ribeye Marrow', 'Righteous', 'Risque', 'Roboto', 'Roboto Condensed', 'Roboto Mono',
    'Roboto Slab', 'Rochester', 'Rock Salt', 'RocknRoll One', 'Rokkitt', 'Romanesco',
    'Ropa Sans', 'Rosario', 'Rosarivo', 'Rouge Script', 'Rowdies', 'Rozha One',
    'Rubik', 'Rubik Beastly', 'Rubik Bubbles', 'Rubik Glitch', 'Rubik Microbe',
    'Rubik Mono One', 'Rubik Moonrocks', 'Rubik Puddles', 'Rubik Wet Paint',
    'Ruda', 'Rufina', 'Ruge Boogie', 'Ruluko', 'Rum Raisin', 'Ruslan Display',
    'Russo One', 'Ruthie', 'Rye', 'Sacramento', 'Sahitya', 'Sail', 'Saira',
    'Saira Condensed', 'Saira Extra Condensed', 'Saira Semi Condensed', 'Saira Stencil One',
    'Salsa', 'Sanchez', 'Sancreek', 'Sansita', 'Sansita Swashed', 'Sarabun',
    'Sarala', 'Sarina', 'Sarpanch', 'Satisfy', 'Sawarabi Gothic', 'Sawarabi Mincho',
    'Scada', 'Scheherazade New', 'Schoolbell', 'Scope One', 'Seaweed Script',
    'Secular One', 'Sedgwick Ave', 'Sedgwick Ave Display', 'Sen', 'Sevillana',
    'Seymour One', 'Shadows Into Light', 'Shadows Into Light Two', 'Shanti',
    'Share', 'Share Tech', 'Share Tech Mono', 'Shippori Antique', 'Shippori Antique B1',
    'Shippori Mincho', 'Shippori Mincho B1', 'Shizuru', 'Shojumaru', 'Short Stack',
    'Shrikhand', 'Siemreap', 'Sigmar One', 'Signika', 'Signika Negative', 'Simonetta',
    'Single Day', 'Sintony', 'Sirin Stencil', 'Six Caps', 'Skranji', 'Slabo 13px',
    'Slabo 27px', 'Slackey', 'Smokum', 'Smooch', 'Smooch Sans', 'Smythe',
    'Sniglet', 'Snippet', 'Snowburst One', 'Sofadi One', 'Sofia', 'Solway',
    'Song Myung', 'Sonsie One', 'Sora', 'Sorts Mill Goudy', 'Source Code Pro',
    'Source Sans 3', 'Source Sans Pro', 'Source Serif 4', 'Source Serif Pro',
    'Space Grotesk', 'Space Mono', 'Special Elite', 'Spectral', 'Spectral SC',
    'Spicy Rice', 'Spinnaker', 'Spirax', 'Squada One', 'Square Peg', 'Sree Krushnadevaraya',
    'Sriracha', 'Srisakdi', 'Staatliches', 'Stalemate', 'Stalinist One', 'Stardos Stencil',
    'Stick', 'Stick No Bills', 'Stint Ultra Condensed', 'Stint Ultra Expanded', 'Stoke',
    'Strait', 'Style Script', 'Stylish', 'Sue Ellen Francisco', 'Suez One', 'Sulphur Point',
    'Sumana', 'Sunflower', 'Sunshiney', 'Supermercado One', 'Sura', 'Suranna',
    'Suravaram', 'Suwannaphum', 'Swanky and Moo Moo', 'Syncopate', 'Syne', 'Syne Mono',
    'Syne Tactile', 'Tajawal', 'Tangerine', 'Taprom', 'Tauri', 'Taviraj',
    'Teko', 'Telex', 'Tenali Ramakrishna', 'Tenor Sans', 'Text Me One', 'Texturina',
    'Thasadith', 'The Girl Next Door', 'The Nautigal', 'Tienne', 'Tillana', 'Timmana',
    'Tinos', 'Titan One', 'Titillium Web', 'Tomorrow', 'Tourney', 'Trade Winds',
    'Train One', 'Trirong', 'Trispace', 'Trocchi', 'Trochut', 'Truculenta',
    'Trykker', 'Tulpen One', 'Turret Road', 'Twinkle Star', 'Ubuntu', 'Ubuntu Condensed',
    'Ubuntu Mono', 'Uchen', 'Ultra', 'Uncial Antiqua', 'Underdog', 'Unica One',
    'UnifrakturCook', 'UnifrakturMaguntia', 'Unkempt', 'Unlock', 'Unna', 'Updock',
    'Urbanist', 'VT323', 'Vampiro One', 'Varela', 'Varela Round', 'Varta',
    'Vast Shadow', 'Vazirmatn', 'Vesper Libre', 'Viaoda Libre', 'Vibes', 'Vibur',
    'Vidaloka', 'Viga', 'Voces', 'Volkhov', 'Vollkorn', 'Vollkorn SC',
    'Voltaire', 'Vujahday Script', 'Waiting for the Sunrise', 'Wallpoet', 'Walter Turncoat',
    'Warnes', 'Water Brush', 'Waterfall', 'Wellfleet', 'Wendy One', 'Whisper',
    'WindSong', 'Wire One', 'Work Sans', 'Xanh Mono', 'Yaldevi', 'Yanone Kaffeesatz',
    'Yantramanav', 'Yatra One', 'Yellowtail', 'Yeon Sung', 'Yeseva One', 'Yesteryear',
    'Yomogi', 'Yrsa', 'Yuji Boku', 'Yuji Mai', 'Yuji Syuku', 'Yusei Magic',
    'ZCOOL KuaiLe', 'ZCOOL QingKe HuangYou', 'ZCOOL XiaoWei', 'Zen Antique',
    'Zen Antique Soft', 'Zen Dots', 'Zen Kaku Gothic Antique', 'Zen Kaku Gothic New',
    'Zen Kurenaido', 'Zen Loop', 'Zen Maru Gothic', 'Zen Old Mincho', 'Zen Tokyo Zoo',
    'Zeyada', 'Zhi Mang Xing', 'Zilla Slab', 'Zilla Slab Highlight',
    
    // Monospace fonts
    'Courier New', 'Monaco', 'Menlo', 'Consolas', 'Liberation Mono', 'DejaVu Sans Mono',
    'Bitstream Vera Sans Mono', 'Andale Mono', 'Lucida Console', 'Monaco', 'Fixed',
    'Fira Code', 'JetBrains Mono', 'Source Code Pro', 'Roboto Mono', 'Space Mono',
    'Ubuntu Mono', 'PT Mono', 'Inconsolata', 'Anonymous Pro', 'Cascadia Code',
    
    // System fonts
    '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', 'sans-serif'
  ];

  const animationOptions = [
    { value: 'none', label: 'None' },
    { value: 'fade', label: 'Fade In/Out' },
    { value: 'slide', label: 'Slide In/Out' },
    { value: 'bounce', label: 'Bounce' }
  ];

  const positionOptions = [
    { value: 'top-left', label: 'Top Left' },
    { value: 'top-right', label: 'Top Right' },
    { value: 'bottom-left', label: 'Bottom Left' },
    { value: 'bottom-right', label: 'Bottom Right' },
    { value: 'center', label: 'Center' },
  ];

  return (
    <div className="space-y-8">
      {/* Row 1: Media Settings (left) + Widget Information (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Media Settings */}
        <div className="space-y-8">
        <Card className="border-0 shadow-lg bg-white">
          <CardHeader className="bg-gradient-to-r from-indigo-600 to-cyan-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-3 text-white">
              <div className="p-2 bg-white/20 rounded-lg">
                <ImageIcon className="w-5 h-5" />
              </div>
              Media Settings
            </CardTitle>
            <CardDescription className="text-indigo-100">
              Configure images, GIFs, videos, and sound for your alerts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Image/Video Upload */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-slate-700">Alert Media</Label>
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 bg-slate-50 hover:bg-slate-100 transition-colors duration-200">
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
                      // Check file size (10MB limit)
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
                      handleFileUpload('image', file);
                          // Determine type based on file
                          const isVideo = file.type.startsWith('video/');
                          const isGif = file.type === 'image/gif';
                          handleInputChange('customization.image.type', isVideo ? 'video' : isGif ? 'gif' : 'image');
                        }
                      }}
                      className="border-0 bg-transparent p-0 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-600 file:text-white hover:file:bg-indigo-700"
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleInputChange('customization.image.url', '')}
                    className="border-slate-300 text-slate-600 hover:bg-slate-100"
                  >
                    Clear
                  </Button>
                </div>
                <p className="text-xs text-slate-500 mt-2">Maximum file size: 10MB. Supported formats: Images (JPG, PNG, GIF), Videos (MP4, WebM)</p>
              </div>
              
              {formData.customization.image?.url && (
                <div className="text-xs text-indigo-700 bg-indigo-50 p-3 rounded-lg border border-indigo-200">
                  <strong>Current file:</strong> {formData.customization.image.url.startsWith('data:') ? 
                    `Base64 encoded (${Math.round(formData.customization.image.url.length * 0.75 / 1024)}KB)` : 
                    formData.customization.image.url
                  }
                </div>
              )}
              
              {formData.customization.image?.type === 'video' && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-600">Video Duration (seconds, max 10)</Label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={formData.customization.image.duration || 5}
                    onChange={(e) => handleInputChange('customization.image.duration', parseInt(e.target.value))}
                    className="border-slate-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
              )}
            </div>

            {/* Sound Upload */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-slate-700">Alert Sound</Label>
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 bg-slate-50 hover:bg-slate-100 transition-colors duration-200">
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
                      // Check file size (10MB limit)
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
                      handleFileUpload('sound', file);
                        }
                      }}
                      className="border-0 bg-transparent p-0 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-600 file:text-white hover:file:bg-indigo-700"
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={playSound}
                    disabled={!formData.customization.sound?.url}
                    className="border-indigo-300 text-indigo-600 hover:bg-indigo-50 disabled:opacity-50"
                  >
                    <Play className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleInputChange('customization.sound.url', '')}
                    className="border-slate-300 text-slate-600 hover:bg-slate-100"
                  >
                    Clear
                  </Button>
                </div>
                <p className="text-xs text-slate-500 mt-2">Maximum file size: 10MB. Supported formats: MP3, WAV, OGG</p>
              </div>
              
              {formData.customization.sound?.url && (
                <div className="text-xs text-indigo-700 bg-indigo-50 p-3 rounded-lg border border-indigo-200">
                  <strong>Current file:</strong> {formData.customization.sound.url.startsWith('data:') ? 
                    `Base64 encoded (${Math.round(formData.customization.sound.url.length * 0.75 / 1024)}KB)` : 
                    formData.customization.sound.url
                  }
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-600">Volume</Label>
                  <div className="space-y-2">
                    <Input
                      type="range"
                      min="0"
                      max="100"
                      value={formData.customization.sound?.volume || 80}
                      onChange={(e) => handleInputChange('customization.sound.volume', parseInt(e.target.value))}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <span className="text-sm font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full inline-block">{formData.customization.sound?.volume || 80}%</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-600">Duration (seconds, max 5)</Label>
                  <Input
                    type="number"
                    min="1"
                    max="5"
                    value={formData.customization.sound?.duration || 3}
                    onChange={(e) => handleInputChange('customization.sound.duration', parseInt(e.target.value))}
                    className="border-slate-200 focus:border-purple-300 focus:ring-2 focus:ring-purple-100"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        </div>

        {/* Widget Information */}
        <div className="space-y-8">
          {settings && (
            <Card className="border-0 shadow-lg bg-white">
              <CardHeader className="bg-gradient-to-r from-indigo-600 to-cyan-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-3 text-white">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  Widget Information
                </CardTitle>
                <CardDescription className="text-green-100">
                  Use this URL in your OBS browser source
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div>
                  <Label className="text-sm font-semibold text-green-800 mb-2 block">Widget URL</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={settings.widgetUrl}
                      readOnly
                      className="font-mono text-sm bg-white/70 border-green-200 focus:border-green-300"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigator.clipboard.writeText(settings.widgetUrl)}
                      className="border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:border-indigo-300 transition-all duration-200"
                    >
                      Copy
                    </Button>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-green-800 mb-2 block">Alert Token</Label>
                  <Input
                    value={settings.alertToken}
                    readOnly
                    className="font-mono text-sm bg-white/70 border-green-200 focus:border-green-300"
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Row 2: Display Settings (left) + Live Preview (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Display Settings */}
        <div className="space-y-8">
          <Card className="border-0 shadow-lg bg-white">
          <CardHeader className="bg-gradient-to-r from-indigo-600 to-cyan-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-3 text-white">
              <div className="p-2 bg-white/20 rounded-lg">
                <Settings className="w-5 h-5" />
              </div>
              Display Settings
            </CardTitle>
            <CardDescription className="text-emerald-100">
              Customize how your alerts appear on screen
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Animation */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-slate-700">Animation Effect</Label>
              <select
                value={formData.customization.text?.animation || 'fade'}
                onChange={(e) => handleInputChange('customization.text.animation', e.target.value)}
                className="w-full p-3 border border-slate-200 rounded-lg bg-white focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 transition-all duration-200"
              >
                {animationOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Colors */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-slate-700">Colors</Label>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-slate-600">Background</Label>
                  <div className="relative">
                    <Input
                      type="color"
                      value={formData.customization.text?.backgroundColor || '#1a1a1a'}
                      onChange={(e) => handleInputChange('customization.text.backgroundColor', e.target.value)}
                      className="w-full h-12 border border-slate-200 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-slate-600">Text</Label>
                  <div className="relative">
                    <Input
                      type="color"
                      value={formData.customization.text?.color || '#ffffff'}
                      onChange={(e) => handleInputChange('customization.text.color', e.target.value)}
                      className="w-full h-12 border border-slate-200 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-slate-600">Accent</Label>
                  <div className="relative">
                    <Input
                      type="color"
                      value={formData.customization.text?.color || '#ffffff'}
                      onChange={(e) => handleInputChange('customization.text.color', e.target.value)}
                      className="w-full h-12 border border-slate-200 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Fonts */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-slate-700">Typography</Label>
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
                <p className="text-xs text-indigo-800">
                  <strong>💡 Tip:</strong> You can use any Google Font by typing its name (e.g., "Roboto", "Open Sans", "Lato"). 
                  The font will be automatically loaded from Google Fonts when used in your alerts.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-slate-600">Font Family</Label>
                  <div className="space-y-2">
                  <select
                      value={formData.customization.text?.font || 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif'}
                    onChange={(e) => handleInputChange('customization.text.font', e.target.value)}
                    className="w-full p-3 border border-slate-200 rounded-lg bg-white focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 transition-all duration-200 text-sm"
                  >
                    {fontFamilies.map(font => (
                      <option key={font} value={font}>
                        {font}
                      </option>
                    ))}
                  </select>
                    <Input
                      type="text"
                      placeholder="Or type a custom font name (e.g., 'Roboto', 'Open Sans')"
                      value={formData.customization.text?.font || ''}
                      onChange={(e) => handleInputChange('customization.text.font', e.target.value)}
                      className="text-xs border-slate-200 focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-slate-600">Size (px)</Label>
                  <Input
                    type="number"
                    min="8"
                    max="48"
                    value={formData.customization.text?.fontSize || 16}
                    onChange={(e) => handleInputChange('customization.text.fontSize', parseInt(e.target.value))}
                    className="border-slate-200 focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 transition-all duration-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-slate-600">Weight</Label>
                  <select
                    value={formData.customization.text?.font || 'Inter'}
                    onChange={(e) => handleInputChange('customization.text.font', e.target.value)}
                    className="w-full p-3 border border-slate-200 rounded-lg bg-white focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 transition-all duration-200 text-sm"
                  >
                    <option value="normal">Normal</option>
                    <option value="bold">Bold</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Position */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-slate-700">Position</Label>
              <select
                value={formData.customization.position}
                onChange={(e) => handleInputChange('customization.position', e.target.value)}
                className="w-full p-3 border border-slate-200 rounded-lg bg-white focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 transition-all duration-200"
              >
                {positionOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Display Duration */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-slate-700">Display Duration (seconds)</Label>
              <div className="space-y-3">
                <Input
                  type="range"
                  min="5"
                  max="15"
                  step="1"
                  value={formData.customization.duration}
                  onChange={(e) => handleInputChange('customization.duration', parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-sm text-slate-600">
                  <span className="font-medium">5s</span>
                  <span className="font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">{formData.customization.duration} seconds</span>
                  <span className="font-medium">15s</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        </div>

        {/* Live Preview */}
        <div className="space-y-8">
          <Card className="border-0 shadow-lg bg-white">
            <CardHeader className="bg-gradient-to-r from-indigo-600 to-cyan-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-3 text-white">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Eye className="w-5 h-5" />
                </div>
                Live Preview
              </CardTitle>
              <CardDescription className="text-amber-100">
                See how your alerts will look in real-time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <Button
                  variant="outline"
                  onClick={() => setShowPreview(!showPreview)}
                  className="w-full border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:border-indigo-300 transition-all duration-200"
                >
                  {showPreview ? 'Hide Preview' : 'Show Preview'}
                </Button>
              </div>

              {showPreview && previewData && (
                <div className="relative border-2 border-dashed border-amber-200 rounded-xl p-6 min-h-[300px] bg-gradient-to-br from-amber-50 to-orange-50 shadow-inner">
                  {/* Preview Alert */}
                  <div
                    className={`absolute transition-all duration-500 ${
                      previewData.animation === 'fade' ? 'animate-fade-in' :
                      previewData.animation === 'slide' ? 'animate-slide-in' :
                      previewData.animation === 'bounce' ? 'animate-bounce' : ''
                    }`}
                    style={{
                      left: previewData.position === 'center' ? '50%' : 
                            (previewData.position === 'top-left' || previewData.position === 'bottom-left') ? '20px' : undefined,
                      top: previewData.position === 'center' ? '50%' : 
                           (previewData.position === 'top-left' || previewData.position === 'top-right') ? '20px' : undefined,
                      right: (previewData.position === 'top-right' || previewData.position === 'bottom-right') ? '20px' : undefined,
                      bottom: (previewData.position === 'bottom-left' || previewData.position === 'bottom-right') ? '20px' : undefined,
                      transform: previewData.position === 'center' ? 'translate(-50%, -50%)' : undefined,
                      backgroundColor: previewData.colors.background,
                      color: previewData.colors.text,
                      fontFamily: previewData.fonts.family,
                      fontSize: `${previewData.fonts.size}px`,
                      fontWeight: previewData.fonts.weight,
                      maxWidth: '300px',
                      padding: '16px',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                      zIndex: 1000
                    }}
                  >
                    {/* Media Preview */}
                    {previewData.image?.url && (
                      <div className="mb-3">
                        {previewData.image.type === 'video' ? (
                          <video
                            ref={videoRef}
                            src={previewData.image.url}
                            className="w-full h-20 object-cover rounded"
                            muted
                            loop
                          />
                        ) : (
                          <img
                            src={previewData.image.url}
                            alt="Alert media"
                            className="w-full h-20 object-cover rounded"
                          />
                        )}
                      </div>
                    )}

                    {/* Alert Content */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">{previewData.donorName}</span>
                      <span className="text-lg font-bold" style={{ color: previewData.colors.accent }}>
                        {previewData.amount}
                      </span>
                        <span className="text-lg font-bold" style={{ color: previewData.colors.accent }}>
                          {previewData.amount}
                        </span>
                      </div>
                      {previewData.message && (
                        <p className="text-sm opacity-90">{previewData.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Preview Controls */}
                  <div className="absolute bottom-4 left-4 space-x-2">
                    {previewData.image?.type === 'video' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={playVideo}
                      >
                        <Play className="w-4 h-4 mr-1" />
                        Play Video
                      </Button>
                    )}
                    {previewData.sound?.url && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={playSound}
                      >
                        <Volume2 className="w-4 h-4 mr-1" />
                        Play Sound
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {/* Preview Info */}
              <div className="mt-6 p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-200">
                <h4 className="font-semibold text-amber-900 mb-3 flex items-center gap-2">
                  <span className="text-lg">📊</span>
                  Preview Information
                </h4>
                <div className="grid grid-cols-2 gap-3 text-sm text-amber-800">
                  <div className="bg-white/50 p-2 rounded-lg">
                    <span className="font-medium">Donor:</span> {previewData?.donorName}
                  </div>
                  <div className="bg-white/50 p-2 rounded-lg">
                    <span className="font-medium">Amount:</span> {'$'}{previewData?.amount} {previewData?.currency}
                  </div>
                  <div className="bg-white/50 p-2 rounded-lg">
                    <span className="font-medium">Animation:</span> {formData.customization.text?.animation || 'fade'}
                  </div>
                  <div className="bg-white/50 p-2 rounded-lg">
                    <span className="font-medium">Position:</span> {formData.customization.position}
                  </div>
                  <div className="bg-white/50 p-2 rounded-lg col-span-2">
                    <span className="font-medium">Duration:</span> {formData.customization.duration}s
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
          <Button
            onClick={handleSave}
            disabled={isLoading}
            className={`flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
              isLoading ? 'animate-pulse' : ''
            }`}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving Configuration...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Configuration
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={handleTest}
            disabled={!settings}
            className="flex-1 border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:border-indigo-300 transition-all duration-200"
          >
            <TestTube className="w-4 h-4 mr-2" />
            Test Alert
          </Button>
      </div>


        {/* Messages */}
        {saveMessage && (
          <div className={`mt-4 p-4 rounded-xl border-2 shadow-lg animate-fade-in ${
            saveMessage.type === 'success' 
              ? 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-900 border-green-300' 
              : 'bg-gradient-to-r from-red-50 to-rose-50 text-red-900 border-red-300'
          }`}>
            <div className="flex items-center">
              {saveMessage.type === 'success' ? (
                <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
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
                {saveMessage.type === 'success' && (
                  <p className="text-xs text-green-700 mt-1">Your configuration is now active and ready to use!</p>
                )}
                {saveMessage.type === 'error' && (
                  <p className="text-xs text-red-700 mt-1">Please check your settings and try again.</p>
                )}
              </div>
            </div>
          </div>
        )}

      {/* Hidden Audio/Video Elements for Preview */}
      <audio ref={audioRef} src={formData.customization.sound?.url} />
      <video ref={videoRef} src={formData.customization.image?.url} muted />

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
              ? 'bg-indigo-50 border-indigo-400 text-indigo-800' 
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
                      ? 'text-indigo-500 hover:bg-indigo-100 focus:ring-indigo-600' 
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
    </div>
  );
};

export default OBSSettingsConfig; 