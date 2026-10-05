import React from 'react';
import { ShoppingCart, Check, Sparkles } from 'lucide-react';
import { translations } from '../constants/translations';

export function ProductSelectionCard({
  results = [],
  onSelectProduct,
  isHighContrast,
  lang = 'en',
}) {
  const t = translations[lang] || translations.en;

  if (!results || results.length === 0) return null;

  return (
    <div 
      className="mt-3 space-y-3"
      role="region"
      aria-label={lang === 'ta' ? "தயாரிப்பு பட்டியல்" : "Product search results"}
    >
      <div className="flex items-center justify-between text-xs md:text-sm font-extrabold opacity-80 mb-1">
        <span>{lang === 'ta' ? "தேர்ந்தெடுக்க வேண்டிய பொருள் (1-5):" : "Tap an item or say the number (1-5):"}</span>
        <span className="text-blue-700 dark:text-yellow-400 font-black">
          {results.length} {lang === 'ta' ? "பொருட்கள்" : "items found"}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-2.5">
        {results.map((product, idx) => {
          const itemNumber = idx + 1;
          const qtyNeeded = product.qty_needed || 1;
          const weight = product.weight || '';
          return (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectProduct(itemNumber, product.name)}
              className={`w-full touch-target p-3.5 md:p-4 rounded-2xl border-2 flex items-center justify-between gap-3 text-left transition-all shadow-sm active:scale-[0.99] ${
                isHighContrast
                  ? 'bg-zinc-900 border-yellow-400 text-yellow-300 hover:bg-yellow-400 hover:text-black'
                  : 'bg-slate-50 border-slate-300 text-slate-900 hover:bg-blue-50 hover:border-blue-500'
              }`}
              aria-label={`Select item ${itemNumber}: ${product.name}, price ${product.price}${weight ? `, weight ${weight}` : ''}${qtyNeeded > 1 ? `, ${qtyNeeded} units needed` : ''}`}
            >
              <div className="flex items-center gap-3.5 min-w-0">
                {/* Number Badge */}
                <div 
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg shrink-0 border ${
                    isHighContrast
                      ? 'bg-yellow-400 text-black border-yellow-300'
                      : 'bg-blue-700 text-white border-blue-800'
                  }`}
                >
                  {itemNumber}
                </div>

                {/* Product Name, Weight & Price */}
                <div className="truncate">
                  <div className="font-extrabold text-base md:text-lg leading-tight truncate">
                    {product.name}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-2 mt-0.5">
                    <span className="text-sm font-black text-emerald-700 dark:text-yellow-400">
                      {t.priceLabel} {product.price}
                    </span>
                    {weight && (
                      <span className={`text-xs font-bold px-1.5 py-0.5 rounded-md ${
                        isHighContrast
                          ? 'bg-yellow-900 text-yellow-300'
                          : 'bg-slate-200 text-slate-700'
                      }`}>
                        {weight}
                      </span>
                    )}
                  </div>
                  {qtyNeeded > 1 && (
                    <div className={`text-xs font-bold mt-1 px-2 py-0.5 rounded-lg inline-block ${
                      isHighContrast
                        ? 'bg-orange-900 text-orange-300'
                        : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}>
                      {lang === 'ta'
                        ? `${weight} × ${qtyNeeded} சேர்க்கப்படும்`
                        : `Will add ${qtyNeeded} × ${weight} to match your order`
                      }
                    </div>
                  )}
                </div>
              </div>

              {/* Add Button with quantity badge */}
              <div className="shrink-0 flex items-center gap-1 px-3 py-2 rounded-xl font-black text-sm bg-emerald-600 hover:bg-emerald-700 text-white shadow relative">
                <ShoppingCart className="w-4 h-4" />
                <span>{lang === 'ta' ? 'சேர்' : 'Add'}</span>
                {qtyNeeded > 1 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-black w-5 h-5 rounded-full flex items-center justify-center shadow-md">
                    {qtyNeeded}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

