import React from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';
import { translations } from '../constants/translations';

export function ConnectionBanner({
  lang = 'en',
  status,
  retryCount,
  onReconnect,
  isHighContrast,
}) {
  const t = translations[lang] || translations.en;
  const [isRetrying, setIsRetrying] = React.useState(false);

  const handleReconnect = () => {
    if (isRetrying) return;
    setIsRetrying(true);
    onReconnect();
    setTimeout(() => setIsRetrying(false), 3000);
  };

  if (status === 'connected') return null;

  return (
    <div 
      className={`border-b px-4 py-2.5 shadow-sm transition-all ${
        isHighContrast 
          ? 'bg-red-950 text-yellow-300 border-red-500' 
          : 'bg-red-50 text-red-950 border-red-200'
      }`}
      role="alert"
    >
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-red-600 text-white shrink-0">
            <WifiOff className="w-5 h-5" />
          </div>
          <div>
            <p className="font-extrabold text-sm md:text-base">
              {status === 'connecting' ? t.connectingTitle : t.disconnectedTitle}
            </p>
            <p className="text-xs font-semibold opacity-90">
              {status === 'connecting'
                ? `${t.reconnectingDesc} (${retryCount} retries)...`
                : t.disconnectedDesc}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap justify-center">
          <button
            onClick={handleReconnect}
            disabled={isRetrying}
            className="touch-target px-5 py-2 rounded-xl bg-red-700 hover:bg-red-800 text-white font-black text-sm flex items-center gap-2 transition-all shadow"
            aria-label={t.retryConnection}
          >
            <RefreshCw className={`w-4 h-4 ${status === 'connecting' ? 'animate-spin' : ''}`} />
            <span>{t.retryConnection}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
