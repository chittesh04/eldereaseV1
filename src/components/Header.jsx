import React from 'react';
import { 
  Volume2, 
  VolumeX, 
  Sun, 
  Moon, 
  RotateCcw, 
  HelpCircle, 
  ShoppingBag,
  Languages
} from 'lucide-react';
import { translations } from '../constants/translations';

export function Header({
  lang = 'en',
  onToggleLanguage,
  status,
  fontScale,
  setFontScale,
  isHighContrast,
  setIsHighContrast,
  ttsEnabled,
  setTtsEnabled,
  onResetChat,
  onOpenHelp,
}) {
  const t = translations[lang] || translations.en;

  const getStatusBadge = () => {
    switch (status) {
      case 'connected':
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-100 text-green-800 border border-green-300 font-bold text-sm" role="status" aria-label={`Server status: ${t.statusOnline}`}>
            <span className="w-3 h-3 rounded-full bg-green-600 animate-pulse"></span>
            <span>{t.statusOnline}</span>
          </div>
        );
      case 'connecting':
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 font-bold text-sm" role="status" aria-label={`Server status: ${t.statusConnecting}`}>
            <span className="w-3 h-3 rounded-full bg-amber-600 animate-ping"></span>
            <span>{t.statusConnecting}</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-100 text-red-800 border border-red-300 font-bold text-sm" role="status" aria-label={`Server status: ${t.statusOffline}`}>
            <span className="w-3 h-3 rounded-full bg-red-600"></span>
            <span>{t.statusOffline}</span>
          </div>
        );
    }
  };

  const handleFontIncrease = () => {
    setFontScale((prev) => Math.min(prev + 0.15, 1.45));
  };

  const handleFontDecrease = () => {
    setFontScale((prev) => Math.max(prev - 0.15, 0.9));
  };

  const handleFontReset = () => {
    setFontScale(1.0);
  };

  return (
    <header 
      className={`border-b shadow-sm sticky top-0 z-30 transition-colors ${
        isHighContrast 
          ? 'bg-black text-yellow-300 border-yellow-400' 
          : 'bg-white text-slate-900 border-slate-200'
      }`}
      role="banner"
    >
      <div className="max-w-5xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        
        {/* Brand & Connection State */}
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-2xl ${isHighContrast ? 'bg-yellow-400 text-black' : 'bg-blue-700 text-white'} shadow-md`}>
            <ShoppingBag className="w-7 h-7" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black tracking-tight flex items-center gap-2">
              {t.appName}
              <span className="text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-900 border border-blue-300 dark:bg-zinc-800 dark:text-yellow-300 dark:border-yellow-400">
                {t.agentBadge}
              </span>
            </h1>
            <p className={`text-xs md:text-sm font-semibold ${isHighContrast ? 'text-white' : 'text-slate-600'}`}>
              {t.appTagline}
            </p>
          </div>
        </div>

        {/* Status Indicator */}
        <div className="flex items-center gap-2">
          {getStatusBadge()}
        </div>

        {/* Accessibility & Quick Controls Toolbar */}
        <div className="flex items-center gap-2 flex-wrap" role="toolbar" aria-label="Accessibility settings toolbar">
          
          {/* Language Switcher Button (English <-> தமிழ்) */}
          <button
            onClick={onToggleLanguage}
            className={`touch-target px-3.5 py-2 rounded-xl font-extrabold flex items-center gap-2 border-2 transition-all shadow-sm ${
              isHighContrast
                ? 'bg-zinc-900 text-yellow-300 border-yellow-400 hover:bg-yellow-400 hover:text-black'
                : 'bg-indigo-50 text-indigo-900 border-indigo-300 hover:bg-indigo-100 hover:border-indigo-500'
            }`}
            title={t.langSwitchTitle}
            aria-label={t.langSwitchTitle}
          >
            <Languages className="w-5 h-5" />
            <span className="text-base font-black">
              {t.langSwitch}
            </span>
          </button>

          {/* Font Resizing Controls */}
          <div className="flex items-center bg-slate-100 rounded-xl p-1 border border-slate-300 dark:bg-zinc-800 dark:border-zinc-700">
            <button
              onClick={handleFontDecrease}
              className="touch-target px-3 py-1 font-extrabold text-base hover:bg-slate-200 dark:hover:bg-zinc-700 rounded-lg transition-colors"
              title={t.decreaseFont}
              aria-label={t.decreaseFont}
            >
              A-
            </button>
            <button
              onClick={handleFontReset}
              className="touch-target px-3 py-1 font-black text-base hover:bg-slate-200 dark:hover:bg-zinc-700 rounded-lg transition-colors"
              title={t.resetFont}
              aria-label={t.resetFont}
            >
              A
            </button>
            <button
              onClick={handleFontIncrease}
              className="touch-target px-3 py-1 font-black text-lg text-blue-700 dark:text-yellow-400 hover:bg-slate-200 dark:hover:bg-zinc-700 rounded-lg transition-colors"
              title={t.increaseFont}
              aria-label={t.increaseFont}
            >
              A+
            </button>
          </div>

          {/* High Contrast Toggle */}
          <button
            onClick={() => setIsHighContrast(!isHighContrast)}
            className={`touch-target px-3 py-2 rounded-xl font-bold flex items-center gap-2 border transition-all ${
              isHighContrast
                ? 'bg-yellow-400 text-black border-yellow-300 hover:bg-yellow-300'
                : 'bg-slate-100 text-slate-800 border-slate-300 hover:bg-slate-200'
            }`}
            title={isHighContrast ? t.highContrastOn : t.highContrastOff}
            aria-label={isHighContrast ? t.highContrastOn : t.highContrastOff}
          >
            {isHighContrast ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            <span className="hidden sm:inline text-sm font-extrabold">
              {isHighContrast ? t.highContrastOn : t.highContrastOff}
            </span>
          </button>

          {/* Speech / Voice Narration (TTS) Toggle */}
          <button
            onClick={() => setTtsEnabled(!ttsEnabled)}
            className={`touch-target px-3 py-2 rounded-xl font-bold flex items-center gap-2 border transition-all ${
              ttsEnabled
                ? 'bg-blue-700 text-white border-blue-800 hover:bg-blue-800'
                : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
            }`}
            title={ttsEnabled ? t.voiceOn : t.voiceMuted}
            aria-label={ttsEnabled ? t.voiceMuted : t.voiceOn}
          >
            {ttsEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            <span className="hidden sm:inline text-sm">
              {ttsEnabled ? t.voiceOn : t.voiceMuted}
            </span>
          </button>

          {/* Reset Conversation */}
          <button
            onClick={onResetChat}
            className="touch-target p-2.5 rounded-xl border border-slate-300 hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors"
            title={t.resetChat}
            aria-label={t.resetChat}
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          {/* Help modal */}
          <button
            onClick={onOpenHelp}
            className="touch-target p-2.5 rounded-xl border border-slate-300 hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors"
            title={t.helpGuide}
            aria-label={t.helpGuide}
          >
            <HelpCircle className="w-5 h-5" />
          </button>

        </div>
      </div>
    </header>
  );
}
