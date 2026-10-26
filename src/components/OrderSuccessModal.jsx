import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  CheckCircle2,
  PartyPopper,
  Clock,
  ShieldCheck,
  ShoppingBag,
} from 'lucide-react';
import { SpeakButton, speakGlobal, stopAllSpeech } from './SpeakButton';
import {
  getLocalizedItemName,
  getLocalizedWeight,
} from './AddMoreOrCheckoutModal';
import { fetchTamilTranslation } from '../utils/translator';

/**
 * OrderSuccessModal — Celebratory Order Placed Successfully screen
 * Displayed immediately after OTP is entered and verified in the live browser.
 */
export function OrderSuccessModal({
  isOpen,
  onClose,
  orderId,
  cartSummary = [],
  messages = [],
  lang = 'en',
  isHighContrast = false,
}) {
  const wasOpenRef = useRef(false);
  const [dynamicTranslations, setDynamicTranslations] = useState({});

  // Background fetch Tamil translation for items missing localized names
  useEffect(() => {
    if (!isOpen || lang !== 'ta' || !cartSummary || cartSummary.length === 0) return;

    let isMounted = true;
    cartSummary.forEach((item) => {
      const rawName = item.name || '';
      if (!rawName) return;
      if (item.name_localized && /[\u0B80-\u0BFF]/.test(item.name_localized)) return;

      fetchTamilTranslation(rawName).then((translated) => {
        if (isMounted && translated && /[\u0B80-\u0BFF]/.test(translated)) {
          setDynamicTranslations((prev) => ({
            ...prev,
            [rawName]: translated,
          }));
        }
      });
    });

    return () => {
      isMounted = false;
    };
  }, [isOpen, lang, cartSummary]);

  const resolveItemName = useCallback(
    (item) => {
      return getLocalizedItemName(item, lang, messages, dynamicTranslations);
    },
    [lang, messages, dynamicTranslations]
  );

  const displayOrderId = orderId || `EE-${Math.floor(100000 + Math.random() * 900000)}`;

  const totalUnits = cartSummary.reduce(
    (acc, item) => acc + (parseInt(item.qty, 10) || 1),
    0
  );

  const estimatedTotal = cartSummary.reduce((acc, item) => {
    const rawPrice = item.price;
    if (typeof rawPrice === 'number') return acc + rawPrice;
    if (typeof rawPrice === 'string') {
      const num = parseFloat(rawPrice.replace(/[^0-9.]/g, ''));
      const qty = parseInt(item.qty, 10) || 1;
      return acc + (isNaN(num) ? 0 : num * qty);
    }
    return acc;
  }, 0);

  const buildSpokenSummary = useCallback(() => {
    if (lang === 'ta') {
      const itemsSpeech =
        cartSummary.length > 0
          ? cartSummary
              .map((item, i) => {
                const itemName = resolveItemName(item);
                const itemWeight = getLocalizedWeight(item.weight, 'ta');
                const weightText = itemWeight ? `அளவு ${itemWeight}, ` : '';
                const qtyText = item.qty > 1 ? `${item.qty} எண்ணிக்கை, ` : '';
                const priceText = item.price ? `விலை ${String(item.price).replace('₹', '')} ரூபாய்.` : '';
                return `பொருள் ${i + 1}: ${itemName}, ${weightText}${qtyText}${priceText}`;
              })
              .join(' ')
          : '';
      const totalSpeech =
        estimatedTotal > 0 ? ` மொத்த விலை ${estimatedTotal} ரூபாய்.` : '';
      return `வாழ்த்துக்கள்! உங்கள் ஆர்டர் வெற்றிகரமாக பதிவு செய்யப்பட்டது. ஆர்டர் எண் ${displayOrderId}. மொத்தம் ${totalUnits} பொருட்கள். ${itemsSpeech}${totalSpeech} உங்கள் பொருட்கள் 10 நிமிடங்களில் உங்கள் வீட்டிற்கு டெலிவரி செய்யப்படும்.`;
    }
    return `Congratulations! Your order has been placed successfully. Order ID ${displayOrderId}. Total items: ${totalUnits}.${
      estimatedTotal > 0 ? ` Total amount: ${estimatedTotal} rupees.` : ''
    } Your groceries will be delivered to your doorstep in 10 minutes.`;
  }, [cartSummary, displayOrderId, estimatedTotal, lang, resolveItemName, totalUnits]);

  // Auto-announce on mount when opened
  useEffect(() => {
    if (isOpen) {
      wasOpenRef.current = true;
      const timer = setTimeout(() => {
        speakGlobal(buildSpokenSummary(), lang, 'modal-order-success');
      }, 350);
      return () => clearTimeout(timer);
    } else if (wasOpenRef.current) {
      wasOpenRef.current = false;
      stopAllSpeech();
    }
  }, [isOpen, buildSpokenSummary, lang]);

  if (!isOpen) return null;

  const handleFinish = () => {
    stopAllSpeech();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="order-success-title"
    >
      <div
        className={`w-full max-w-xl rounded-t-3xl sm:rounded-3xl max-h-[92dvh] overflow-y-auto p-4 sm:p-8 shadow-2xl border-t-4 sm:border-4 transition-all my-auto ${
          isHighContrast
            ? 'bg-zinc-950 text-yellow-300 border-yellow-400 shadow-yellow-400/10'
            : 'bg-white text-slate-900 border-emerald-500'
        }`}
      >
        <div className="text-center space-y-5">
          {/* Top Speaker Row */}
          <div className="flex justify-end">
            <SpeakButton
              text={buildSpokenSummary()}
              lang={lang}
              id="modal-order-success"
              isHighContrast={isHighContrast}
              size="md"
              idleLabel={lang === 'ta' ? 'சத்தமாகக் கேட்க' : 'Listen'}
              activeLabel={lang === 'ta' ? 'நிறுத்து' : 'Stop'}
            />
          </div>

          {/* Celebration Icon */}
          <div
            className={`w-20 h-20 mx-auto rounded-3xl flex items-center justify-center shadow-lg border-4 ${
              isHighContrast
                ? 'bg-yellow-400 text-black border-yellow-200'
                : 'bg-emerald-600 text-white border-emerald-200'
            }`}
          >
            <PartyPopper className="w-11 h-11" />
          </div>

          <div>
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider px-3.5 py-1 rounded-full mb-2 ${
                isHighContrast
                  ? 'bg-yellow-400/20 text-yellow-300 border border-yellow-400'
                  : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              {lang === 'ta'
                ? 'ஆர்டர் உறுதி செய்யப்பட்டது'
                : 'Order Confirmed (Demo)'}
            </span>
            <h2
              id="order-success-title"
              className="text-2xl sm:text-3xl font-black"
            >
              {lang === 'ta'
                ? 'ஆர்டர் வெற்றிகரமாகப் பதிவு செய்யப்பட்டது!'
                : 'Order Placed Successfully!'}
            </h2>
            <p
              className={`text-base font-bold mt-1 ${
                isHighContrast ? 'text-yellow-100/90' : 'text-slate-600'
              }`}
            >
              {lang === 'ta'
                ? `ஆர்டர் எண்: #${displayOrderId}`
                : `Order ID: #${displayOrderId}`}
            </p>
          </div>

          {/* 10-Minute Delivery ETA Pill */}
          <div
            className={`p-4 rounded-2xl border-2 flex items-center justify-center gap-3 font-black text-lg ${
              isHighContrast
                ? 'bg-zinc-900 border-yellow-400 text-yellow-300'
                : 'bg-amber-50 border-amber-300 text-amber-950'
            }`}
          >
            <Clock className="w-6 h-6 shrink-0" />
            <span>
              {lang === 'ta'
                ? '⚡ 10 நிமிடங்களில் உங்கள் வீட்டிற்கு டெலிவரி செய்யப்படும்!'
                : '⚡ Arriving at your doorstep in 10 minutes!'}
            </span>
          </div>

          {/* Final Itemized Receipt */}
          {cartSummary.length > 0 && (
            <div
              className={`text-left rounded-2xl border-2 overflow-hidden ${
                isHighContrast
                  ? 'bg-zinc-900 border-yellow-400/40'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="p-3 sm:p-4 max-h-40 sm:max-h-48 overflow-y-auto space-y-2">
                {cartSummary.map((item, idx) => {
                  const itemName = lang === 'ta' ? resolveItemName(item) : item.name;
                  const itemWeight = getLocalizedWeight(item.weight, lang);
                  return (
                    <div
                      key={idx}
                      className="flex justify-between items-center text-sm sm:text-base font-extrabold"
                    >
                      <span className="truncate flex-1">
                        ✅ {itemName}
                        {itemWeight ? ` (${itemWeight})` : ''}
                        {item.qty > 1 ? ` ×${item.qty}` : ''}
                      </span>
                      <span className="ml-3 shrink-0">{item.price || ''}</span>
                    </div>
                  );
                })}
              </div>
              <div
                className={`px-4 py-3 flex justify-between items-center border-t font-black text-base sm:text-lg ${
                  isHighContrast
                    ? 'bg-black border-yellow-400/30 text-yellow-300'
                    : 'bg-emerald-50 border-slate-200 text-emerald-950'
                }`}
              >
                <span>
                  {lang === 'ta'
                    ? 'மொத்தத் தொகை (Cash on Delivery):'
                    : 'Total Amount (Pay on Delivery):'}
                </span>
                <span className="text-lg sm:text-xl">
                  {estimatedTotal > 0 ? `₹${estimatedTotal}` : 'Paid'}
                </span>
              </div>
            </div>
          )}

          {/* Done / Complete Button */}
          <button
            type="button"
            onClick={handleFinish}
            className={`w-full min-h-[56px] sm:min-h-[64px] py-3.5 sm:py-4 rounded-2xl font-black text-lg sm:text-xl flex items-center justify-center gap-3 transition-all shadow-lg border-2 ${
              isHighContrast
                ? 'bg-yellow-400 text-black border-yellow-300 hover:bg-yellow-300'
                : 'bg-emerald-600 text-white border-emerald-700 hover:bg-emerald-700'
            }`}
          >
            <CheckCircle2 className="w-6 h-6 sm:w-7 sm:h-7" />
            <span>
              {lang === 'ta' ? 'முடிக்கவும் (Done)' : 'Done & Close'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
