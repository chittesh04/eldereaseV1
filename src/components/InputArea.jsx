import React, { useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Hash, Loader2, Phone } from 'lucide-react';
import { stopAllSpeech } from './SpeakButton';
import { translations } from '../constants/translations';

export function InputArea({
  lang = 'en',
  inputText,
  setInputText,
  onSendMessage,
  isBotThinking,
  isWaitingForOTP,
  isWaitingForPhone,
  defaultPhone = '',
  isListening,
  onStartVoice,
  onStopVoice,
  isVoiceSupported,
  voiceError,
  onOpenOtpKeypad,
  isHighContrast,
}) {
  const t = translations[lang] || translations.en;
  const inputRef = useRef(null);

  // Only auto-focus on desktop devices with a physical keyboard (never pop up virtual keyboard on mobile/touch)
  useEffect(() => {
    const isTouchOrMobile =
      typeof window !== 'undefined' &&
      (window.matchMedia?.('(pointer: coarse)').matches ||
        'ontouchstart' in window ||
        window.innerWidth < 768);

    if (!isTouchOrMobile && !isBotThinking && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isBotThinking, isWaitingForOTP, isWaitingForPhone]);

  const handleMicToggle = () => {
    // Ensure mobile keyboard stays closed when using voice mic
    inputRef.current?.blur();
    if (isListening) {
      onStopVoice();
    } else {
      stopAllSpeech();
      onStartVoice();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputText.trim() || isBotThinking) return;
    stopAllSpeech();
    // Dismiss mobile virtual keyboard after sending message
    inputRef.current?.blur();
    onSendMessage(inputText.trim());
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <footer
      className={`border-t p-2.5 pb-3 sm:p-4 sticky bottom-0 z-20 transition-colors ${isHighContrast
          ? 'bg-black border-yellow-400'
          : 'bg-white border-slate-200'
        }`}
      role="region"
      aria-label="Message Input Section"
    >
      <div className="max-w-4xl mx-auto space-y-2">

        {/* Active Listening Visual Banner */}
        {isListening && (
          <div className="flex items-center justify-between px-3.5 py-1.5 sm:px-4 sm:py-2 bg-red-100 border-2 border-red-500 rounded-xl text-red-900 animate-pulse-recording">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <span className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-red-600 animate-ping"></span>
              <span className="font-extrabold text-sm sm:text-base md:text-lg">
                {t.listeningBanner}
              </span>
            </div>
            <button
              type="button"
              onClick={onStopVoice}
              className="touch-target px-3 py-1 sm:px-4 sm:py-1.5 rounded-lg bg-red-700 text-white font-black hover:bg-red-800 text-xs sm:text-sm"
              aria-label={t.doneSpeaking}
            >
              {t.doneSpeaking}
            </button>
          </div>
        )}

        {/* Voice Error Notice (Gotcha 2 fallback) */}
        {voiceError && !isListening && (
          <div className="px-3 py-1.5 text-xs md:text-sm font-semibold rounded-lg bg-amber-50 text-amber-900 border border-amber-300 flex items-center justify-between">
            <span>⚠️ {voiceError}</span>
          </div>
        )}

        {/* Phone Verification Special Notice */}
        {isWaitingForPhone && (
          <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2 sm:px-4 sm:py-2.5 bg-blue-50 border-2 border-blue-500 rounded-xl text-blue-950">
            <div className="font-bold text-xs sm:text-sm md:text-base flex items-center gap-2">
              <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-blue-700 shrink-0" />
              <span>📱 <strong>{lang === 'ta' ? 'தொலைபேசி எண் சரிபார்ப்பு:' : 'Phone Required:'}</strong> {lang === 'ta' ? 'உள்நுழைய மொபைல் எண்ணை உள்ளிடவும்' : 'Enter mobile number to log in'}</span>
            </div>
            <button
              type="button"
              onClick={() => {
                inputRef.current?.blur();
                onSendMessage(defaultPhone);
              }}
              className="touch-target px-3 py-1 sm:px-4 sm:py-1.5 rounded-lg bg-blue-700 text-white font-black text-xs sm:text-sm hover:bg-blue-800 shadow transition-all"
              aria-label={`Use default phone ${defaultPhone}`}
            >
              ✓ {lang === 'ta' ? `இயல்பு எண்: ${defaultPhone}` : `Confirm: ${defaultPhone}`}
            </button>
          </div>
        )}

        {/* OTP Special Notice when bot requests verification */}
        {isWaitingForOTP && (
          <div className="flex items-center justify-between px-3.5 py-1.5 sm:px-4 sm:py-2 bg-amber-50 border-2 border-amber-500 rounded-xl text-amber-950">
            <div className="font-bold text-xs sm:text-sm md:text-base">
              🔒 <strong>{t.otpRequiredBadge}:</strong> {t.otpNoticeText}
            </div>
            {onOpenOtpKeypad && (
              <button
                type="button"
                onClick={() => {
                  inputRef.current?.blur();
                  onOpenOtpKeypad();
                }}
                className="touch-target px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg bg-amber-700 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 hover:bg-amber-800"
                aria-label={t.openBigKeypad}
              >
                <Hash className="w-4 h-4" />
                <span>{t.openBigKeypad}</span>
              </button>
            )}
          </div>
        )}

        {/* Main Input Form */}
        <form onSubmit={handleSubmit} className="flex items-center gap-2 sm:gap-3">

          {/* Voice Input Microphone Button */}
          {isVoiceSupported ? (
            <button
              type="button"
              onClick={handleMicToggle}
              disabled={isBotThinking}
              className={`touch-target w-12 h-12 sm:w-14 sm:h-14 shrink-0 rounded-2xl flex items-center justify-center font-bold transition-all shadow-md ${isListening
                  ? 'bg-red-600 text-white border-4 border-red-300 animate-pulse scale-105'
                  : isHighContrast
                    ? 'bg-yellow-400 text-black border-2 border-yellow-300 hover:bg-yellow-300'
                    : 'bg-emerald-600 text-white border-2 border-emerald-700 hover:bg-emerald-700'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              title={isListening ? t.micStopTitle : t.micButtonTitle}
              aria-label={isListening ? t.micStopTitle : t.micButtonTitle}
            >
              {isListening ? (
                <MicOff className="w-6 h-6 sm:w-7 sm:h-7" aria-hidden="true" />
              ) : (
                <Mic className="w-6 h-6 sm:w-7 sm:h-7" aria-hidden="true" />
              )}
            </button>
          ) : (
            <div
              className="touch-target w-12 h-12 sm:w-14 sm:h-14 shrink-0 rounded-2xl bg-slate-200 text-slate-500 flex items-center justify-center cursor-not-allowed"
              title={t.micUnsupported}
              aria-label={t.micUnsupported}
            >
              <MicOff className="w-5 h-5 sm:w-6 sm:h-6 opacity-40" />
            </div>
          )}

          {/* Text / Phone / OTP Input Field */}
          <div className="relative flex-1 min-w-0">
            <input
              ref={inputRef}
              type={isWaitingForOTP || isWaitingForPhone ? 'tel' : 'text'}
              /* Gotcha 3: Native SMS OTP Auto-fill on iOS & Android */
              autoComplete={isWaitingForOTP ? 'one-time-code' : isWaitingForPhone ? 'tel' : 'off'}
              inputMode={isWaitingForOTP || isWaitingForPhone ? 'numeric' : 'text'}
              pattern={isWaitingForOTP || isWaitingForPhone ? '[0-9]*' : undefined}
              maxLength={isWaitingForOTP ? 8 : isWaitingForPhone ? 12 : 500}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isBotThinking}
              placeholder={
                isBotThinking
                  ? t.inputBotThinkingPlaceholder
                  : isWaitingForOTP
                    ? t.inputOtpPlaceholder
                    : isWaitingForPhone
                      ? (lang === 'ta' ? 'மொபைல் எண் உள்ளிடவும்...' : 'Type your mobile number...')
                      : t.inputPlaceholder
              }
              className={`w-full touch-target px-3.5 py-2.5 sm:px-4 sm:py-3.5 rounded-2xl text-base sm:text-lg md:text-elder-lg font-semibold border-2 transition-all outline-none shadow-inner ${isHighContrast
                  ? 'bg-black text-yellow-200 border-yellow-400 placeholder:text-yellow-700 focus:border-yellow-300'
                  : 'bg-slate-50 text-slate-900 border-slate-300 placeholder:text-slate-500 focus:border-blue-600 focus:bg-white'
                } disabled:bg-slate-200 disabled:text-slate-500 disabled:cursor-wait`}
              aria-label={isWaitingForOTP ? t.otpModalTitle : isWaitingForPhone ? 'Mobile number' : t.inputPlaceholder}
            />
          </div>

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputText.trim() || isBotThinking}
            className={`touch-target w-12 h-12 sm:w-auto sm:px-5 sm:py-3.5 shrink-0 rounded-2xl flex items-center justify-center gap-2 font-black text-base sm:text-elder-base transition-all shadow-md ${isHighContrast
                ? 'bg-yellow-400 text-black border-2 border-yellow-300 hover:bg-yellow-300'
                : 'bg-blue-700 text-white border-2 border-blue-800 hover:bg-blue-800'
              } disabled:opacity-40 disabled:cursor-not-allowed`}
            title={t.sendButton}
            aria-label={t.sendButton}
          >
            {isBotThinking ? (
              <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" aria-hidden="true" />
            ) : (
              <>
                <Send className="w-5 h-5 sm:w-6 sm:h-6" aria-hidden="true" />
                <span className="hidden sm:inline">{t.sendButton}</span>
              </>
            )}
          </button>

        </form>

        {/* Bot Thinking Active Indicator */}
        {isBotThinking && (
          <div className="flex items-center justify-center gap-2 text-sm font-extrabold text-blue-900 dark:text-yellow-300 py-1" aria-live="polite">
            <Loader2 className="w-4 h-4 animate-spin text-blue-700" />
            <span>{t.botThinkingStatus}</span>
          </div>
        )}

      </div>
    </footer>
  );
}