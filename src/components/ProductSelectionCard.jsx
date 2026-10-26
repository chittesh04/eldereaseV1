import React, { useMemo } from 'react';
import { ShoppingCart } from 'lucide-react';
import { SpeakButton } from './SpeakButton';
import { translations } from '../constants/translations';

export function ProductSelectionCard({
  results = [],
  onSelectProduct,
  isHighContrast,
  lang = 'en',
}) {
  const t = translations[lang] || translations.en;

  const allOptionsText = useMemo(() => {
    if (!results || results.length === 0) return '';
    return results
      .map((product, idx) => {
        const itemNumber = idx + 1;
        const name = product.name_localized || product.name;
        const weight = product.weight ? `, ${product.weight}` : '';
        if (lang === 'ta') {
          return `விருப்பம் ${itemNumber}: ${name}, விலை ${product.price} ரூபாய்${weight}`;
        }
        return `Option ${itemNumber}: ${name}, price ${product.price} rupees${weight}`;
      })
      .join('. ');
  }, [results, lang]);

  if (!results || results.length === 0) return null;

  return (
    <div
      className="mt-3 space-y-3 w-full"
      role="region"
      aria-label={lang === 'ta' ? "தயாரிப்பு பட்டியல்" : "Product search results"}
    >
      {/* Header with Title and "Read All Options / Stop" SpeakButton */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs md:text-sm font-extrabold opacity-90 mb-1">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span>{lang === 'ta' ? "தேர்ந்தெடுக்க வேண்டிய பொருள் (1-5):" : "Tap an item or say the number (1-5):"}</span>
          <span className={`font-black ${isHighContrast ? 'text-yellow-400' : 'text-blue-700'}`}>
            ({results.length} {lang === 'ta' ? "பொருட்கள்" : "items"})
          </span>
        </div>
        <SpeakButton
          text={allOptionsText}
          lang={lang}
          id="read-all-search-options"
          isHighContrast={isHighContrast}
          size="sm"
          idleLabel={lang === 'ta' ? 'அனைத்தையும் கேட்க' : 'Read All Options'}
          activeLabel={lang === 'ta' ? 'நிறுத்து' : 'Stop'}
        />
      </div>

      <div className="grid grid-cols-1 gap-2.5 sm:gap-3">
        {results.map((product, idx) => {
          const itemNumber = idx + 1;
          const qtyNeeded = product.qty_needed || 1;
          const weight = product.weight || '';
          const displayName = product.name_localized || product.name;
          const itemSpeech = lang === 'ta'
            ? `விருப்பம் ${itemNumber}: ${displayName}, விலை ${product.price} ரூபாய்${weight ? `, ${weight}` : ''}${qtyNeeded > 1 ? `, ${qtyNeeded} எண்ணிக்கை` : ''}`
            : `Option ${itemNumber}: ${displayName}, price ${product.price} rupees${weight ? `, ${weight}` : ''}${qtyNeeded > 1 ? `, ${qtyNeeded} units` : ''}`;

          return (
            <div
              key={idx}
              role="button"
              tabIndex={0}
              onClick={() => onSelectProduct(itemNumber, product.name)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectProduct(itemNumber, product.name);
                }
              }}
              className={`w-full touch-target p-3 sm:p-4 rounded-2xl border-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4 text-left transition-all shadow-sm active:scale-[0.99] cursor-pointer ${isHighContrast
                  ? 'bg-zinc-900 border-yellow-400 text-yellow-300 hover:bg-zinc-800 hover:border-yellow-300'
                  : 'bg-slate-50 border-slate-300 text-slate-900 hover:bg-blue-50 hover:border-blue-500'
                }`}
              aria-label={`Select item ${itemNumber}: ${displayName}, price ${product.price}${weight ? `, weight ${weight}` : ''}${qtyNeeded > 1 ? `, ${qtyNeeded} units needed` : ''}`}
            >
              {/* TOP SECTION ON MOBILE / LEFT SECTION ON DESKTOP: Badge + Product Name + Weight Pills */}
              <div className="flex items-start sm:items-center gap-2.5 sm:gap-3.5 min-w-0 w-full sm:flex-1">
                {/* Number Badge */}
                <div
                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center font-black text-sm sm:text-lg shrink-0 border mt-0.5 sm:mt-0 ${isHighContrast
                      ? 'bg-yellow-400 text-black border-yellow-300'
                      : 'bg-blue-700 text-white border-blue-800'
                    }`}
                >
                  {itemNumber}
                </div>

                {/* Product Name & Weight/Pack Metadata */}
                <div className="min-w-0 flex-1">
                  <div className="font-extrabold text-sm sm:text-base md:text-lg leading-snug break-words">
                    {displayName}
                  </div>

                  {/* Weight & Pack Math Badges */}
                  {(weight || qtyNeeded > 1) && (
                    <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                      {weight && (
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${isHighContrast
                            ? 'bg-yellow-900/80 text-yellow-200 border border-yellow-500/40'
                            : 'bg-slate-200 text-slate-800'
                          }`}>
                          {weight}
                        </span>
                      )}

                      {qtyNeeded > 1 && (
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${isHighContrast
                            ? 'bg-orange-950 text-orange-300 border border-orange-400/50'
                            : 'bg-amber-100 text-amber-900 border border-amber-300'
                          }`}>
                          {lang === 'ta'
                            ? `${weight ? `${weight} × ` : ''}${qtyNeeded} சேர்க்கப்படும்`
                            : `Adds ${qtyNeeded}${weight ? ` × ${weight}` : ' packs'}`
                          }
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* BOTTOM BAR ON MOBILE / RIGHT SECTION ON DESKTOP: Price + Listen + Add Button */}
              <div
                className={`flex items-center justify-between sm:justify-end gap-2 sm:gap-3 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 shrink-0 ${isHighContrast ? 'border-yellow-400/30' : 'border-slate-200/90'
                  }`}
              >
                {/* Prominent Price */}
                <div className={`text-base sm:text-lg font-black whitespace-nowrap ${isHighContrast ? 'text-yellow-400' : 'text-emerald-700'
                  }`}>
                  {t.priceLabel} {product.price}
                </div>

                {/* Action cluster: SpeakButton + Add Button */}
                <div className="shrink-0 flex items-center gap-2">
                  <SpeakButton
                    text={itemSpeech}
                    lang={lang}
                    id={`prod-${idx}-${product.name?.replace(/\s+/g, '-')}`}
                    isHighContrast={isHighContrast}
                    size="sm"
                    title={lang === 'ta' ? `${displayName} விவரத்தைக் கேட்க` : `Listen to ${product.name}`}
                  />

                  <div className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl font-black text-xs sm:text-sm shadow relative ${isHighContrast
                      ? 'bg-yellow-400 text-black hover:bg-yellow-300'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    }`}>
                    <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span>{lang === 'ta' ? 'சேர்' : 'Add'}</span>
                    {qtyNeeded > 1 && (
                      <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[11px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-md border border-white">
                        {qtyNeeded}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}