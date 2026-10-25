import React from 'react';
import { ShoppingCart, CheckCircle, Loader } from 'lucide-react';
import { translations } from '../constants/translations';

/**
 * QueueProgressBanner — Displays "Shopping Item 2 of 3: bread" progress bar
 * during multi-item Playwright shopping loop.
 */
export function QueueProgressBanner({
  lang = 'en',
  queueProgress,
  cartSummary = [],
  isHighContrast,
}) {
  const t = translations[lang] || translations.en;

  if (!queueProgress) return null;

  const { currentIndex, totalItems, currentItem } = queueProgress;
  const progressPercent = Math.round((currentIndex / totalItems) * 100);

  return (
    <div
      className={`mx-2 mb-2 rounded-2xl border-2 overflow-hidden transition-all ${
        isHighContrast
          ? 'bg-zinc-900 border-yellow-400 text-yellow-300'
          : 'bg-emerald-50 border-emerald-300 text-emerald-900'
      }`}
      role="status"
      aria-live="polite"
      aria-label={`${t.shoppingItem} ${currentIndex} ${t.ofTotal} ${totalItems}: ${currentItem}`}
    >
      {/* Progress Bar */}
      <div className={`h-2 ${isHighContrast ? 'bg-zinc-800' : 'bg-emerald-100'}`}>
        <div
          className={`h-full transition-all duration-700 ease-out rounded-r-full ${
            isHighContrast ? 'bg-yellow-400' : 'bg-emerald-500'
          }`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Status Row */}
      <div className="flex items-center gap-3 px-4 py-3">
        <div className={`p-2 rounded-xl ${
          isHighContrast ? 'bg-yellow-400 text-black' : 'bg-emerald-500 text-white'
        }`}>
          <ShoppingCart className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold truncate">
            {t.shoppingItem} {currentIndex} {t.ofTotal} {totalItems}
          </p>
          <p className="text-base font-black truncate flex items-center gap-2">
            <Loader className="w-4 h-4 animate-spin" />
            {currentItem}
          </p>
        </div>
        {/* Mini cart count badge */}
        {cartSummary.length > 0 && (
          <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-bold ${
            isHighContrast
              ? 'bg-yellow-400/20 text-yellow-300'
              : 'bg-emerald-200 text-emerald-800'
          }`}>
            <CheckCircle className="w-4 h-4" />
            {cartSummary.length}
          </div>
        )}
      </div>

      {/* Mini Cart Summary (collapsed) */}
      {cartSummary.length > 0 && (
        <div className={`px-4 pb-3 flex flex-wrap gap-1.5`}>
          {cartSummary.map((item, idx) => (
            <span
              key={idx}
              className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold ${
                isHighContrast
                  ? 'bg-zinc-800 text-yellow-200 border border-yellow-400/30'
                  : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
              }`}
            >
              ✅ {item.name}{item.qty > 1 ? ` ×${item.qty}` : ''}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
