import React, { useRef, useEffect } from 'react';
import { MessageBubble } from './MessageBubble';
import { Volume2, ShoppingBag } from 'lucide-react';
import { translations } from '../constants/translations';

export function ChatContainer({
  lang = 'en',
  messages,
  isHighContrast,
  onSpeakMessage,
  speakingMessageId,
  onSelectPrompt,
  onSelectProduct,
  hasAudioUnlocked,
  onUnlockAudio,
}) {
  const t = translations[lang] || translations.en;
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);

  // Auto-scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <main 
      ref={containerRef}
      className={`flex-1 overflow-y-auto p-4 md:p-6 transition-colors ${
        isHighContrast ? 'bg-black' : 'bg-slate-50'
      }`}
      role="log"
      aria-live="polite"
      aria-relevant="additions"
      aria-label={`Conversation with ${t.appName} Assistant`}
    >
      <div className="max-w-4xl mx-auto space-y-4">
        
        {/* Gotcha 1: Audio Autoplay Permission Banner */}
        {!hasAudioUnlocked && (
          <div 
            className="p-4 rounded-2xl bg-blue-50 border-2 border-blue-400 text-blue-950 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md"
            role="alert"
          >
            <div className="flex items-center gap-3 text-left">
              <div className="p-2.5 rounded-xl bg-blue-600 text-white">
                <Volume2 className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <p className="font-extrabold text-base">{t.audioGateTitle}</p>
                <p className="text-xs md:text-sm font-semibold opacity-90">
                  {t.audioGateDesc}
                </p>
              </div>
            </div>
            <button
              onClick={onUnlockAudio}
              className="touch-target px-5 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-black text-sm transition-all shadow"
              aria-label={t.audioGateTitle}
            >
              {t.audioGateButton}
            </button>
          </div>
        )}

        {/* Welcome Card & Starter Prompts if only welcome message or empty */}
        {messages.length <= 1 && (
          <div 
            className={`p-6 md:p-8 rounded-3xl text-center border-2 shadow-sm transition-all ${
              isHighContrast
                ? 'bg-zinc-900 border-yellow-400 text-yellow-300'
                : 'bg-white border-slate-200 text-slate-800'
            }`}
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-blue-100 dark:bg-zinc-800 flex items-center justify-center text-blue-700 dark:text-yellow-400">
              <ShoppingBag className="w-10 h-10" />
            </div>
            <h2 className="text-2xl md:text-3xl font-black mb-2">
              {t.welcomeTitle}
            </h2>
            <p className="text-base md:text-lg font-semibold max-w-xl mx-auto mb-6 opacity-90">
              {t.welcomeSubtitle}
            </p>

            {/* Quick action chips */}
            <div className="text-left mt-6">
              <p className="text-xs uppercase font-extrabold tracking-wider mb-3 opacity-75">
                {t.quickSuggestionsTitle}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {t.starterPrompts.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => onSelectPrompt(item.text)}
                    className={`touch-target p-3 rounded-xl border-2 text-left font-bold text-base transition-all ${
                      isHighContrast
                        ? 'bg-black text-yellow-200 border-yellow-400 hover:bg-yellow-400 hover:text-black'
                        : 'bg-slate-50 text-slate-900 border-slate-300 hover:bg-blue-50 hover:border-blue-500'
                    }`}
                    aria-label={`Order ${item.label}`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Message Bubble Feed */}
        {messages.map((msg, index) => (
          <MessageBubble
            key={msg.id || index}
            message={msg}
            isHighContrast={isHighContrast}
            onSpeak={onSpeakMessage}
            isCurrentlySpeaking={speakingMessageId === (msg.id || index)}
            onSelectProduct={onSelectProduct}
            lang={lang}
          />
        ))}

        {/* Anchor element for smooth auto-scroll */}
        <div ref={messagesEndRef} aria-hidden="true" />

      </div>
    </main>
  );
}
