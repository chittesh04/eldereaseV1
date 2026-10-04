import React, { useEffect } from 'react';
import { ShoppingCart, Check, X, AlertTriangle } from 'lucide-react';
import { translations } from '../constants/translations';

export function PurchaseConfirmationModal({
  lang = 'en',
  isOpen,
  onConfirm,
  onCancel,
  summary = '',
  isHighContrast,
}) {
  const t = translations[lang] || translations.en;

  // Escape key to cancel
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div
        className={`w-full max-w-lg rounded-3xl p-6 md:p-8 shadow-2xl border-4 transition-all ${
          isHighContrast
            ? 'bg-black text-yellow-300 border-yellow-400'
            : 'bg-white text-slate-900 border-emerald-600'
        }`}
      >
        {/* Header */}
        <div className="flex items-center gap-4 pb-4 border-b border-slate-200 dark:border-zinc-700">
          <div className={`p-3 rounded-2xl ${
            isHighContrast ? 'bg-yellow-400 text-black' : 'bg-emerald-600 text-white'
          }`}>
            <ShoppingCart className="w-8 h-8" />
          </div>
          <div>
            <h2 id="confirm-modal-title" className="text-xl md:text-2xl font-black">
              {lang === 'ta' ? '\u0b86\u0bb0\u0bcd\u0b9f\u0bb0\u0bc8 \u0b89\u0bb1\u0bc1\u0ba4\u0bbf\u0b9a\u0bc6\u0baf\u0bcd\u0baf\u0bb5\u0bc1\u0bae\u0bcd' : 'Confirm Your Order'}
            </h2>
            <p className="text-sm font-semibold opacity-80">
              {lang === 'ta' ? '\u0b86\u0bb0\u0bcd\u0b9f\u0bb0\u0bc8 \u0b9a\u0bc6\u0baf\u0bcd\u0baf \u0bae\u0bc1\u0ba9\u0bcd\u0baa\u0bc1 \u0b9a\u0bb0\u0bbf\u0baa\u0bbe\u0bb0\u0bcd\u0b95\u0bcd\u0b95\u0bb5\u0bc1\u0bae\u0bcd' : 'Please review before placing the order'}
            </p>
          </div>
        </div>

        {/* Warning */}
        <div className={`flex items-start gap-3 mt-4 p-4 rounded-2xl border-2 ${
          isHighContrast
            ? 'bg-zinc-900 border-yellow-400/50 text-yellow-200'
          : 'bg-amber-50 border-amber-300 text-amber-900'
        }`}>
          <AlertTriangle className="w-6 h-6 shrink-0 mt-0.5" />
          <p className="text-sm md:text-base font-bold leading-relaxed">
            {lang === 'ta'
              ? '\u0b87\u0ba4\u0bc1 \u0b92\u0bb0\u0bc1 \u0bae\u0bc0\u0bb3 \u0bae\u0bc1\u0b9f\u0bbf\u0baf\u0bbe\u0ba4 \u0b9a\u0bc6\u0baf\u0bb2\u0bcd. \u0b89\u0bb1\u0bc1\u0ba4\u0bbf\u0b9a\u0bc6\u0baf\u0bcd\u0ba4 \u0baa\u0bbf\u0bb1\u0b95\u0bc1 \u0b86\u0bb0\u0bcd\u0b9f\u0bb0\u0bcd \u0bb0\u0ba4\u0bcd\u0ba4\u0bc1 \u0b9a\u0bc6\u0baf\u0bcd\u0baf \u0bae\u0bc1\u0b9f\u0bbf\u0baf\u0bbe\u0ba4\u0bc1.'
              : 'This action cannot be undone. Once confirmed, the order will be placed and payment will be processed.'}
          </p>
        </div>

        {/* Order Summary */}
        {summary && (
          <div className={`mt-4 p-4 rounded-2xl border-2 ${
            isHighContrast
              ? 'bg-zinc-900 border-yellow-400/30 text-yellow-200'
              : 'bg-slate-50 border-slate-200 text-slate-800'
          }`}>
            <p className="text-base md:text-lg font-bold leading-relaxed whitespace-pre-wrap">
              {summary}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          {/* Cancel */}
          <button
            type="button"
            onClick={onCancel}
            className={`flex-1 touch-target py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all shadow-md border-2 ${
              isHighContrast
                ? 'bg-zinc-900 text-yellow-300 border-yellow-400 hover:bg-zinc-800'
                : 'bg-slate-100 text-slate-800 border-slate-300 hover:bg-slate-200'
            }`}
            aria-label={lang === 'ta' ? '\u0bb0\u0ba4\u0bcd\u0ba4\u0bc1 \u0b9a\u0bc6\u0baf\u0bcd' : 'Cancel Order'}
          >
            <X className="w-6 h-6" />
            <span>{lang === 'ta' ? '\u0bb0\u0ba4\u0bcd\u0ba4\u0bc1 \u0b9a\u0bc6\u0baf\u0bcd' : 'Cancel'}</span>
          </button>

          {/* Confirm */}
          <button
            type="button"
            onClick={onConfirm}
            className={`flex-1 touch-target py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all shadow-lg border-2 ${
              isHighContrast
                ? 'bg-yellow-400 text-black border-yellow-300 hover:bg-yellow-300'
                : 'bg-emerald-600 text-white border-emerald-700 hover:bg-emerald-700'
            }`}
            aria-label={lang === 'ta' ? '\u0b86\u0bb0\u0bcd\u0b9f\u0bb0\u0bcd \u0b9a\u0bc6\u0baf\u0bcd' : 'Place Order'}
          >
            <Check className="w-7 h-7" />
            <span>{lang === 'ta' ? '\u0b86\u0bb0\u0bcd\u0b9f\u0bb0\u0bcd \u0b9a\u0bc6\u0baf\u0bcd' : 'Place Order'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
