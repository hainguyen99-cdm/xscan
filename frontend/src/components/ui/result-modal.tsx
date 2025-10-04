import React from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, Copy, ExternalLink } from 'lucide-react';
import { Button } from './button';

interface ResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  details?: string;
  alertId?: string;
  widgetUrl?: string;
  connectedWidgets?: number;
  testAlertSent?: boolean;
}

const ResultModal: React.FC<ResultModalProps> = ({
  isOpen,
  onClose,
  type,
  title,
  message,
  details,
  alertId,
  widgetUrl,
  connectedWidgets,
  testAlertSent
}) => {
  if (!isOpen) return null;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-8 h-8 text-green-500" />;
      case 'error':
        return <XCircle className="w-8 h-8 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-8 h-8 text-amber-500" />;
      case 'info':
        return <Info className="w-8 h-8 text-blue-500" />;
      default:
        return <Info className="w-8 h-8 text-blue-500" />;
    }
  };

  const getHeaderColor = () => {
    switch (type) {
      case 'success':
        return 'bg-gradient-to-r from-green-500 to-emerald-600';
      case 'error':
        return 'bg-gradient-to-r from-red-500 to-rose-600';
      case 'warning':
        return 'bg-gradient-to-r from-amber-500 to-orange-600';
      case 'info':
        return 'bg-gradient-to-r from-blue-500 to-indigo-600';
      default:
        return 'bg-gradient-to-r from-blue-500 to-indigo-600';
    }
  };

  const getTextColor = () => {
    switch (type) {
      case 'success':
        return 'text-green-800';
      case 'error':
        return 'text-red-800';
      case 'warning':
        return 'text-amber-800';
      case 'info':
        return 'text-blue-800';
      default:
        return 'text-blue-800';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity backdrop-blur-sm"
          onClick={onClose}
        />
        
        {/* Modal */}
        <div 
          className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-auto border border-gray-200"
          onKeyDown={handleKeyDown}
        >
          {/* Header */}
          <div className={`${getHeaderColor()} text-white rounded-t-2xl p-6`}>
            <div className="flex items-center gap-4">
              {getIcon()}
              <div>
                <h3 className="text-xl font-bold">{title}</h3>
                <p className="text-white/90 text-sm mt-1">{message}</p>
              </div>
            </div>
          </div>
          
          {/* Body */}
          <div className="p-6 space-y-4">
            {details && (
              <div className={`p-4 rounded-xl bg-gray-50 border border-gray-200`}>
                <h4 className="font-semibold text-gray-900 mb-2">Details</h4>
                <p className="text-sm text-gray-700 whitespace-pre-line">{details}</p>
              </div>
            )}

            {/* Alert ID */}
            {alertId && (
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                  <span>🆔</span>
                  Alert ID
                </h4>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-sm bg-white p-2 rounded border border-blue-200 font-mono">
                    {alertId}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopyToClipboard(alertId)}
                    className="border-blue-200 text-blue-700 hover:bg-blue-50"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Widget URL */}
            {widgetUrl && (
              <div className="p-4 rounded-xl bg-green-50 border border-green-200">
                <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                  <span>🔗</span>
                  Widget URL
                </h4>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-sm bg-white p-2 rounded border border-green-200 font-mono break-all">
                    {widgetUrl}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopyToClipboard(widgetUrl)}
                    className="border-green-200 text-green-700 hover:bg-green-50"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(widgetUrl, '_blank')}
                    className="border-green-200 text-green-700 hover:bg-green-50"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Connection Status */}
            {(connectedWidgets !== undefined || testAlertSent !== undefined) && (
              <div className="p-4 rounded-xl bg-purple-50 border border-purple-200">
                <h4 className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
                  <span>📊</span>
                  Connection Status
                </h4>
                <div className="space-y-2 text-sm">
                  {connectedWidgets !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-purple-700">Connected widgets:</span>
                      <span className="font-medium text-purple-900">{connectedWidgets}</span>
                    </div>
                  )}
                  {testAlertSent !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-purple-700">Test alert sent:</span>
                      <span className={`font-medium ${testAlertSent ? 'text-green-600' : 'text-red-600'}`}>
                        {testAlertSent ? 'Yes' : 'No'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Instructions for Success */}
            {type === 'success' && (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                <h4 className="font-semibold text-amber-900 mb-2 flex items-center gap-2">
                  <span>📺</span>
                  To see the alert:
                </h4>
                <ul className="text-sm text-amber-800 space-y-1">
                  <li>• Make sure you have the widget URL open in OBS Studio</li>
                  <li>• The widget must be visible in OBS</li>
                  <li>• Check your OBS Studio for the alert animation</li>
                  <li>• If you don't see the alert, check the OBS setup guide above</li>
                </ul>
              </div>
            )}

            {/* Troubleshooting for Errors */}
            {type === 'error' && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200">
                <h4 className="font-semibold text-red-900 mb-2 flex items-center gap-2">
                  <span>🔧</span>
                  Troubleshooting:
                </h4>
                <ul className="text-sm text-red-800 space-y-1">
                  <li>• Check if the backend is running</li>
                  <li>• Verify your authentication token</li>
                  <li>• Check browser console for more details</li>
                  <li>• Ensure OBS Studio is running and widget is visible</li>
                </ul>
              </div>
            )}
          </div>
          
          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 rounded-b-2xl flex justify-end">
            <Button
              onClick={onClose}
              className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultModal;







