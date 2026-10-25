import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Check, Package } from 'lucide-react';
import { translations } from '../constants/translations';

/**
 * AddMoreOrCheckoutModal — High-contrast, oversized decision boundary.
 * Shown after all queued items are added. User can either:
 * 1. "Add More Items" (type or speak new items) → loops back to Phase B
 * 2. "Proceed to Checkout" → sends CHECKOUT signal to backend
 */
export function AddMoreOrCheckoutModal({
  lang = 'en',
  isOpen,
  cartSummary = [],
  onCheckout,
  onAddMore,
  isHighContrast,
}) {
  const t = translations[lang] || translations.en;
  const [addMoreText, setAddMoreText] = useState('');
  const [showAddMoreInput, setShowAddMoreInput] = useState(false);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setAddMoreText('');
      setShowAddMoreInput(false);
    }
  }, [isOpen]);

  // Escape key to close via checkout
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onCheckout();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCheckout]);

  if (!isOpen) return null;

  const handleAddMoreSubmit = () => {
    const trimmed = addMoreText.trim();
    if (trimmed) {
      onAddMore(trimmed);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-more-modal-title"
      onClick={(e) => { if (e.target === e.currentTarget) onCheckout(); }}
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
            <h2 id="add-more-modal-title" className="text-xl md:text-2xl font-black">
              {t.addMoreOrCheckoutTitle}
            </h2>
            <p className="text-sm font-semibold opacity-80">
              {t.addMoreOrCheckoutSubtitle}
            </p>
          </div>
        </div>

        {/* Cart Summary */}
        {cartSummary.length > 0 && (
          <div className={`mt-4 p-4 rounded-2xl border-2 ${
            isHighContrast
              ? 'bg-zinc-900 border-yellow-400/30 text-yellow-200'
              : 'bg-slate-50 border-slate-200 text-slate-800'
          }`}>
            <h3 className="text-sm font-bold mb-2 flex items-center gap-2">
              <Package className="w-4 h-4" />
              {t.cartSummaryTitle} ({cartSummary.length} {t.itemsFound})
            </h3>
            <div className="space-y-1.5">
              {cartSummary.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-sm font-bold">
                  <span className="truncate flex-1">
                    ✅ {item.name}{item.qty > 1 ? ` ×${item.qty}` : ''}
                  </span>
                  <span className="ml-2 opacity-70">{item.price}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add More Input (toggled) */}
        {showAddMoreInput && (
          <div className="mt-4">
            <input
              type="text"
              value={addMoreText}
              onChange={(e) => setAddMoreText(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleAddMoreSubmit(); }}
              placeholder={t.addMoreInputPlaceholder}
              autoFocus
              className={`w-full px-4 py-3 rounded-2xl text-lg font-bold border-2 outline-none transition-all ${
                isHighContrast
                  ? 'bg-zinc-900 text-yellow-300 border-yellow-400 placeholder-yellow-600 focus:border-yellow-300'
                  : 'bg-white text-slate-900 border-emerald-300 placeholder-slate-400 focus:border-emerald-500'
              }`}
              aria-label={t.addMoreInputPlaceholder}
            />
            <button
              type="button"
              onClick={handleAddMoreSubmit}
              disabled={!addMoreText.trim()}
              className={`mt-2 w-full touch-target py-3 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all shadow-md border-2 ${
                !addMoreText.trim()
                  ? 'opacity-50 cursor-not-allowed'
                  : ''
              } ${
                isHighContrast
                  ? 'bg-yellow-400 text-black border-yellow-300 hover:bg-yellow-300'
                  : 'bg-emerald-600 text-white border-emerald-700 hover:bg-emerald-700'
              }`}
              aria-label={t.addMoreItems}
            >
              <Plus className="w-6 h-6" />
              <span>{lang === 'ta' ? 'சேர்' : 'Add These Items'}</span>
            </button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          {/* Add More */}
          {!showAddMoreInput && (
            <button
              type="button"
              onClick={() => setShowAddMoreInput(true)}
              className={`flex-1 touch-target py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all shadow-md border-2 ${
                isHighContrast
                  ? 'bg-zinc-900 text-yellow-300 border-yellow-400 hover:bg-zinc-800'
                  : 'bg-slate-100 text-slate-800 border-slate-300 hover:bg-slate-200'
              }`}
              aria-label={t.addMoreItems}
            >
              <Plus className="w-6 h-6" />
              <span>{t.addMoreItems}</span>
            </button>
          )}

          {/* Checkout */}
          <button
            type="button"
            onClick={onCheckout}
            className={`flex-1 touch-target py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all shadow-lg border-2 ${
              isHighContrast
                ? 'bg-yellow-400 text-black border-yellow-300 hover:bg-yellow-300'
                : 'bg-emerald-600 text-white border-emerald-700 hover:bg-emerald-700'
            }`}
            aria-label={t.proceedCheckout}
          >
            <Check className="w-7 h-7" />
            <span>{t.proceedCheckout}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
