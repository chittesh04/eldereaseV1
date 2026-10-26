import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CheckCircle2, ShoppingCart, Search, Lock, User, Bot, Sparkles, Phone } from 'lucide-react';
import { ProductSelectionCard } from './ProductSelectionCard';
import { SpeakButton, buildBotMessageSpeechText } from './SpeakButton';
import { translations } from '../constants/translations';

export function MessageBubble({
  message,
  isHighContrast,
  onSpeak,
  isCurrentlySpeaking,
  onSelectProduct,
  lang = 'en',
}) {
  const t = translations[lang] || translations.en;
  const isUser = message.sender === 'user';
  const isBot = !isUser;
  const hasResults = Array.isArray(message.results) && message.results.length > 0;

  const getActionBadge = () => {
    if (!message.action) return null;

    switch (message.action) {
      case 'searching':
        return (
          <div className="flex items-center gap-1.5 text-xs md:text-sm font-bold px-2.5 py-1 rounded-md bg-blue-100 text-blue-900 border border-blue-300 w-fit mb-2">
            <Search className="w-4 h-4 animate-spin" />
            <span>{t.searchingBadge}</span>
          </div>
        );
      case 'step_progress':
        return null;
      case 'command_ready':
        return (
          <div className="flex items-center gap-1.5 text-xs md:text-sm font-bold px-2.5 py-1 rounded-md bg-indigo-100 text-indigo-900 border border-indigo-300 w-fit mb-2">
            <Sparkles className="w-4 h-4 text-indigo-700" />
            <span>Command Dispatched to Web Agent</span>
          </div>
        );
      case 'input_phone':
        return (
          <div className="flex items-center gap-1.5 text-xs md:text-sm font-bold px-2.5 py-1 rounded-md bg-blue-100 text-blue-950 border border-blue-300 w-fit mb-2">
            <Phone className="w-4 h-4 text-blue-700" />
            <span>Phone Verification Required</span>
          </div>
        );
      case 'cart_update':
        return (
          <div className="flex items-center gap-1.5 text-xs md:text-sm font-bold px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-900 border border-emerald-300 w-fit mb-2">
            <ShoppingCart className="w-4 h-4" />
            <span>{t.cartUpdatedBadge}</span>
          </div>
        );
      case 'ask_user':
      case 'otp_requested':
        return (
          <div className="flex items-center gap-1.5 text-xs md:text-sm font-bold px-2.5 py-1 rounded-md bg-amber-100 text-amber-900 border border-amber-400 w-fit mb-2 animate-bounce">
            <Lock className="w-4 h-4" />
            <span>{t.otpRequiredBadge}</span>
          </div>
        );
      case 'order_success':
        return (
          <div className="flex items-center gap-1.5 text-xs md:text-sm font-bold px-2.5 py-1 rounded-md bg-green-100 text-green-950 border border-green-400 w-fit mb-2">
            <CheckCircle2 className="w-4 h-4 text-green-700" />
            <span>{t.orderConfirmedBadge}</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={`flex w-full my-3 ${isUser ? 'justify-end' : 'justify-start'}`}
      role="article"
      aria-label={`${isUser ? 'Your message' : 'Assistant message'} at ${message.timestamp || t.justNow}`}
    >
      <div
        className={`flex gap-2 sm:gap-3 ${hasResults
            ? 'w-full max-w-full sm:max-w-[92%]'
            : 'max-w-[95%] sm:max-w-[85%]'
          } ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
      >

        {/* Avatar (hidden on mobile when showing wide Top-5 product cards to maximize card width) */}
        <div
          className={`${hasResults ? 'hidden sm:flex' : 'flex'} flex-shrink-0 w-8 h-8 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl items-center justify-center font-bold text-sm sm:text-lg shadow-sm border ${isUser
              ? isHighContrast
                ? 'bg-yellow-400 text-black border-yellow-300'
                : 'bg-blue-700 text-white border-blue-800'
              : isHighContrast
                ? 'bg-zinc-800 text-yellow-300 border-yellow-400'
                : 'bg-emerald-700 text-white border-emerald-800'
            }`}
          aria-hidden="true"
        >
          {isUser ? <User className="w-4 h-4 sm:w-6 sm:h-6" /> : <Bot className="w-4 h-4 sm:w-6 sm:h-6" />}
        </div>

        {/* Bubble Content */}
        <div
          className={`${hasResults ? 'w-full' : ''} min-w-0 rounded-2xl px-3 py-3 sm:px-5 sm:py-4 shadow-md text-elder-base md:text-elder-lg border transition-all ${isUser
              ? isHighContrast
                ? 'bg-zinc-900 text-white border-2 border-yellow-400 rounded-tr-none'
                : 'bg-blue-800 text-white border-blue-900 rounded-tr-none'
              : isHighContrast
                ? 'bg-black text-yellow-200 border-2 border-yellow-400 rounded-tl-none'
                : 'bg-white text-slate-900 border-2 border-slate-300 rounded-tl-none'
            }`}
        >
          {/* Action indicator tag */}
          {getActionBadge()}

          {/* Message Markdown Body */}
          <div className="prose prose-slate max-w-none break-words font-medium leading-relaxed">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                p: ({ children }) => <p className={`mb-2 last:mb-0 ${isUser ? 'text-white' : isHighContrast ? 'text-yellow-200' : 'text-slate-900'}`}>{children}</p>,
                strong: ({ children }) => <strong className={`font-black ${isUser ? 'text-yellow-200' : isHighContrast ? 'text-yellow-400' : 'text-blue-900 font-extrabold'}`}>{children}</strong>,
                code: ({ children }) => <code className="px-2 py-0.5 rounded bg-slate-200 dark:bg-zinc-800 font-mono text-sm font-bold">{children}</code>,
                ul: ({ children }) => <ul className="list-disc pl-5 my-2 space-y-1">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal pl-5 my-2 space-y-1">{children}</ol>,
                li: ({ children }) => <li className="my-0.5">{children}</li>,
                table: ({ children }) => <div className="overflow-x-auto my-2"><table className="min-w-full border border-slate-400 text-left text-sm">{children}</table></div>,
                th: ({ children }) => <th className="border border-slate-400 p-2 font-bold bg-slate-100 dark:bg-zinc-800">{children}</th>,
                td: ({ children }) => <td className="border border-slate-400 p-2">{children}</td>,
              }}
            >
              {message.text}
            </ReactMarkdown>
          </div>

          {/* Interactive Product Selection Grid (if show_results) */}
          {hasResults && (
            <ProductSelectionCard
              results={message.results}
              onSelectProduct={onSelectProduct}
              isHighContrast={isHighContrast}
              lang={lang}
            />
          )}

          {/* Footer: Timestamp & Audio Replay Button */}
          <div className="flex items-center justify-between gap-2 sm:gap-4 mt-3 pt-2 border-t border-black/10 dark:border-white/10 text-xs font-semibold">
            <span className={`opacity-80 ${isUser ? 'text-blue-100' : isHighContrast ? 'text-yellow-400' : 'text-slate-500'}`}>
              {message.timestamp || t.justNow}
            </span>

            {/* Read Aloud Button for Bot messages with Listen <-> Stop toggle */}
            {isBot && (
              <SpeakButton
                text={buildBotMessageSpeechText(message, lang)}
                lang={lang}
                id={`msg-${message.id}`}
                isHighContrast={isHighContrast}
                size="sm"
              />
            )}
          </div>

        </div>

      </div>
    </div>
  );
}