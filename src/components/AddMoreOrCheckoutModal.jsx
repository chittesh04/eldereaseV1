import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ShoppingCart,
  Plus,
  CheckCircle2,
  PackageCheck,
  Mic,
  MicOff,
  ArrowLeft,
  Sparkles,
  Volume2,
  VolumeX,
  PartyPopper,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { translations } from '../constants/translations';

/**
 * AddMoreOrCheckoutModal — Elderly-first, high-contrast decision boundary
 * with Text-to-Speech (TTS) audio readout AND built-in Simulated Order Success
 * screen for safe college project demonstrations (no real money charged).
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
  const [isOrderSuccess, setIsOrderSuccess] = useState(false);
  const [fakeOrderId, setFakeOrderId] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef(null);

  // Calculate total item count and estimated price
  const totalUnits = cartSummary.reduce(
    (sum, item) => sum + (Number(item.qty) || 1),
    0
  );
  const estimatedTotal = cartSummary.reduce((sum, item) => {
    const rawPrice = String(item.price || '').replace(/[^0-9.]/g, '');
    const numericPrice = parseFloat(rawPrice);
    if (!isNaN(numericPrice)) {
      return sum + numericPrice * (Number(item.qty) || 1);
    }
    return sum;
  }, 0);

  // Speak any text aloud using Web Speech Synthesis API
  const speakText = useCallback(
    (textToSpeak) => {
      if (!('speechSynthesis' in window)) return;

      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = lang === 'ta' ? 'ta-IN' : 'en-IN';
      utterance.rate = 0.92;
      utterance.pitch = 1.0;

      const voices = window.speechSynthesis.getVoices();
      const targetLangPrefix = lang === 'ta' ? 'ta' : 'en';
      const matchingVoice =
        voices.find((v) =>
          v.lang.toLowerCase().startsWith(lang === 'ta' ? 'ta-in' : 'en-in')
        ) || voices.find((v) => v.lang.toLowerCase().startsWith(targetLangPrefix));
      if (matchingVoice) {
        utterance.voice = matchingVoice;
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    },
    [lang]
  );

  // Build natural spoken summary for visually impaired users
  const buildSpokenSummary = useCallback(() => {
    if (isOrderSuccess) {
      if (lang === 'ta') {
        return `வாழ்த்துக்கள்! உங்கள் ஆர்டர் வெற்றிகரமாக பதிவு செய்யப்பட்டது. ஆர்டர் எண் ${fakeOrderId}. மொத்தப் பொருட்கள் ${totalUnits}.${estimatedTotal > 0 ? ` மொத்தத் தொகை ${estimatedTotal} ரூபாய்.` : ''
          } உங்கள் பொருட்கள் 10 நிமிடங்களில் வீட்டிற்கு வந்து சேரும்.`;
      }
      return `Congratulations! Your order has been placed successfully. Order ID ${fakeOrderId}. Total items: ${totalUnits}.${estimatedTotal > 0 ? ` Total amount: ${estimatedTotal} rupees.` : ''
        } Your groceries will be delivered in 10 minutes.`;
    }

    if (lang === 'ta') {
      const itemsSpeech =
        cartSummary.length > 0
          ? cartSummary
            .map(
              (item, i) =>
                `பொருள் ${i + 1}: ${item.name}, ${item.qty > 1 ? `${item.qty} எண்ணிக்கை, ` : ''
                }விலை ${String(item.price || '').replace('₹', '')} ரூபாய்.`
            )
            .join(' ')
          : 'உங்கள் கூடை தயாராக உள்ளது.';
      const totalSpeech =
        estimatedTotal > 0 ? ` மொத்த விலை ${estimatedTotal} ரூபாய்.` : '';
      return `உங்கள் கூடையில் ${totalUnits} பொருட்கள் சேர்க்கப்பட்டுள்ளன. ${itemsSpeech}${totalSpeech} மேலும் பொருட்கள் சேர்க்க வேண்டுமா, அல்லது ஆர்டர் செய்யலாமா?`;
    } else {
      const itemsSpeech =
        cartSummary.length > 0
          ? cartSummary
            .map(
              (item, i) =>
                `Item ${i + 1}: ${item.name}${item.weight ? `, ${item.weight}` : ''
                }${item.qty > 1 ? `, quantity ${item.qty}` : ''}, price ${item.price || 'not available'
                }.`
            )
            .join(' ')
          : 'Your basket is updated.';
      const totalSpeech =
        estimatedTotal > 0
          ? ` Estimated total is ${estimatedTotal} rupees.`
          : '';
      return `You have ${totalUnits} ${totalUnits === 1 ? 'item' : 'items'
        } in your basket. ${itemsSpeech}${totalSpeech} Would you like to proceed to checkout, or add more items?`;
    }
  }, [
    cartSummary,
    estimatedTotal,
    fakeOrderId,
    isOrderSuccess,
    lang,
    totalUnits,
  ]);

  const toggleReadAloud = () => {
    if (!('speechSynthesis' in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      speakText(buildSpokenSummary());
    }
  };

  // Speak a single item card when its mini speaker button is tapped
  const speakSingleItem = (item, idx) => {
    if (lang === 'ta') {
      speakText(
        `பொருள் ${idx + 1}: ${item.name}. ${item.weight ? `அளவு ${item.weight}. ` : ''
        }${item.qty > 1 ? `எண்ணிக்கை ${item.qty}. ` : ''}விலை ${String(
          item.price || ''
        ).replace('₹', '')} ரூபாய்.`
      );
    } else {
      speakText(
        `Item ${idx + 1}: ${item.name}. ${item.weight ? `Weight ${item.weight}. ` : ''
        }${item.qty > 1 ? `Quantity ${item.qty}. ` : ''}Price ${item.price || 'not available'
        }.`
      );
    }
  };

  // Reset state & auto-announce when modal opens
  useEffect(() => {
    if (isOpen) {
      setAddMoreText('');
      setShowAddMoreInput(false);
      setIsOrderSuccess(false);
      setIsListening(false);
      setFakeOrderId(
        `EE-${Math.floor(100000 + Math.random() * 900000)}`
      );
      const timer = setTimeout(() => {
        speakText(buildSpokenSummary());
      }, 350);
      return () => {
        clearTimeout(timer);
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
        }
      };
    } else {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsSpeaking(false);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (_) { }
      }
    }
  }, [isOpen]); // Only run when modal open state toggles

  if (!isOpen && !isOrderSuccess) return null;

  const handleAddMoreSubmit = (e) => {
    if (e) e.preventDefault();
    const trimmed = addMoreText.trim();
    if (trimmed) {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (_) { }
      }
      onAddMore(trimmed);
    }
  };

  // When user clicks "Proceed to Checkout" -> Show Fake Order Success Screen & notify backend!
  const handleCheckoutClick = () => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setIsOrderSuccess(true);

    // Announce fake order success aloud in English or Tamil
    const successSpeech =
      lang === 'ta'
        ? `வாழ்த்துக்கள்! உங்கள் ஆர்டர் வெற்றிகரமாக பதிவு செய்யப்பட்டது. ஆர்டர் எண் ${fakeOrderId}. உங்கள் பொருட்கள் 10 நிமிடங்களில் டெலிவரி செய்யப்படும்.`
        : `Congratulations! Your order has been placed successfully. Order ID ${fakeOrderId}. Your items will be delivered in 10 minutes.`;
    speakText(successSpeech);
  };

  // Close the fake order receipt and finish the flow
  const handleFinishOrder = () => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setIsOrderSuccess(false);
    onCheckout();
  };

  // Built-in voice recognition for "Add More Items"
  const toggleVoiceInput = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(
        lang === 'ta'
          ? 'உங்கள் உலாவியில் குரல் உள்ளீடு ஆதரிக்கப்படவில்லை.'
          : 'Voice input is not supported in this browser.'
      );
      return;
    }

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = lang === 'ta' ? 'ta-IN' : 'en-IN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setAddMoreText((prev) => (prev ? `${prev}, ${transcript}` : transcript));
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-more-modal-title"
    >
      <div
        className={`w-full max-w-xl rounded-3xl p-6 sm:p-8 shadow-2xl border-4 transition-all my-auto ${isHighContrast
            ? 'bg-zinc-950 text-yellow-300 border-yellow-400 shadow-yellow-400/10'
            : 'bg-white text-slate-900 border-emerald-500'
          }`}
      >
        {/* ===================================================================== */}
        {/* SCREEN A: FAKE ORDER PLACED SUCCESSFULLY (COLLEGE PROJECT DEMO MODE) */}
        {/* ===================================================================== */}
        {isOrderSuccess ? (
          <div className="text-center space-y-5">
            {/* Top Speaker Row */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={toggleReadAloud}
                className={`min-h-[48px] px-4 py-2 rounded-2xl font-extrabold text-sm flex items-center gap-2 border-2 transition-all ${isSpeaking
                    ? isHighContrast
                      ? 'bg-yellow-300 text-black border-white animate-pulse'
                      : 'bg-amber-500 text-white border-amber-600 animate-pulse'
                    : isHighContrast
                      ? 'bg-zinc-900 text-yellow-300 border-yellow-400'
                      : 'bg-emerald-50 text-emerald-900 border-emerald-400'
                  }`}
              >
                {isSpeaking ? (
                  <>
                    <VolumeX className="w-5 h-5" />
                    <span>{lang === 'ta' ? 'நிறுத்து' : 'Stop'}</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-5 h-5" />
                    <span>{lang === 'ta' ? 'சத்தமாகக் கேட்க' : 'Listen'}</span>
                  </>
                )}
              </button>
            </div>

            {/* Celebration Icon */}
            <div
              className={`w-20 h-20 mx-auto rounded-3xl flex items-center justify-center shadow-lg border-4 ${isHighContrast
                  ? 'bg-yellow-400 text-black border-yellow-200'
                  : 'bg-emerald-600 text-white border-emerald-200'
                }`}
            >
              <PartyPopper className="w-11 h-11" />
            </div>

            <div>
              <span
                className={`inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider px-3.5 py-1 rounded-full mb-2 ${isHighContrast
                    ? 'bg-yellow-400/20 text-yellow-300 border border-yellow-400'
                    : 'bg-emerald-100 text-emerald-800'
                  }`}
              >
                <ShieldCheck className="w-4 h-4" />
                {lang === 'ta'
                  ? 'ஆர்டர் உறுதி செய்யப்பட்டது'
                  : 'Order Confirmed (Demo)'}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black">
                {lang === 'ta'
                  ? 'ஆர்டர் வெற்றிகரமாகப் பதிவு செய்யப்பட்டது!'
                  : 'Order Placed Successfully!'}
              </h2>
              <p
                className={`text-base font-bold mt-1 ${isHighContrast ? 'text-yellow-100/90' : 'text-slate-600'
                  }`}
              >
                {lang === 'ta'
                  ? `ஆர்டர் எண்: #${fakeOrderId}`
                  : `Order ID: #${fakeOrderId}`}
              </p>
            </div>

            {/* 10-Minute Delivery ETA Pill */}
            <div
              className={`p-4 rounded-2xl border-2 flex items-center justify-center gap-3 font-black text-lg ${isHighContrast
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
                className={`text-left rounded-2xl border-2 overflow-hidden ${isHighContrast
                    ? 'bg-zinc-900 border-yellow-400/40'
                    : 'bg-slate-50 border-slate-200'
                  }`}
              >
                <div className="p-3 sm:p-4 max-h-44 overflow-y-auto space-y-2">
                  {cartSummary.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center text-base font-extrabold"
                    >
                      <span className="truncate flex-1">
                        ✅ {item.name}
                        {item.qty > 1 ? ` ×${item.qty}` : ''}
                      </span>
                      <span className="ml-3 shrink-0">{item.price || ''}</span>
                    </div>
                  ))}
                </div>
                <div
                  className={`px-4 py-3 flex justify-between items-center border-t font-black text-lg ${isHighContrast
                      ? 'bg-black border-yellow-400/30 text-yellow-300'
                      : 'bg-emerald-50 border-slate-200 text-emerald-950'
                    }`}
                >
                  <span>
                    {lang === 'ta'
                      ? 'மொத்தத் தொகை (Cash on Delivery):'
                      : 'Total Amount (Pay on Delivery):'}
                  </span>
                  <span className="text-xl">
                    {estimatedTotal > 0 ? `₹${estimatedTotal}` : 'Paid'}
                  </span>
                </div>
              </div>
            )}

            {/* Done / Complete Button */}
            <button
              type="button"
              onClick={handleFinishOrder}
              className={`w-full min-h-[64px] py-4 rounded-2xl font-black text-xl flex items-center justify-center gap-3 transition-all shadow-lg border-2 ${isHighContrast
                  ? 'bg-yellow-400 text-black border-yellow-300 hover:bg-yellow-300'
                  : 'bg-emerald-600 text-white border-emerald-700 hover:bg-emerald-700'
                }`}
            >
              <CheckCircle2 className="w-7 h-7" />
              <span>
                {lang === 'ta' ? 'முடிக்கவும் (Done)' : 'Done & Close'}
              </span>
            </button>
          </div>
        ) : (
          /* ===================================================================== */
          /* SCREEN B: ADD MORE OR CHECKOUT DECISION BOUNDARY                      */
          /* ===================================================================== */
          <>
            {/* Top Header Banner with Large Speaker Button */}
            <div
              className={`flex items-start justify-between gap-3 pb-5 border-b-2 ${isHighContrast ? 'border-yellow-400/30' : 'border-slate-200'
                }`}
            >
              <div className="flex items-center gap-4 min-w-0 flex-1">
                <div
                  className={`p-4 rounded-2xl shrink-0 shadow-md ${isHighContrast
                      ? 'bg-yellow-400 text-black'
                      : 'bg-emerald-600 text-white'
                    }`}
                >
                  <ShoppingCart className="w-9 h-9" />
                </div>
                <div className="min-w-0 flex-1">
                  <span
                    className={`inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider px-3 py-1 rounded-full mb-1 ${isHighContrast
                        ? 'bg-yellow-400/20 text-yellow-300 border border-yellow-400'
                        : 'bg-emerald-100 text-emerald-800'
                      }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    {lang === 'ta' ? 'கூடை தயார்' : 'Basket Updated'}
                  </span>
                  <h2
                    id="add-more-modal-title"
                    className="text-2xl sm:text-3xl font-black leading-tight"
                  >
                    {t.addMoreOrCheckoutTitle ||
                      (lang === 'ta'
                        ? 'வேறு பொருட்கள் வேண்டுமா?'
                        : 'Need Anything Else?')}
                  </h2>
                  <p
                    className={`text-base font-semibold mt-0.5 ${isHighContrast ? 'text-yellow-100/90' : 'text-slate-600'
                      }`}
                  >
                    {t.addMoreOrCheckoutSubtitle ||
                      (lang === 'ta'
                        ? 'மேலும் பொருட்களைச் சேர்க்கலாம் அல்லது ஆர்டரை முடிக்கலாம்'
                        : 'Add more items to your basket or proceed to checkout')}
                  </p>
                </div>
              </div>

              {/* Prominent Read-Aloud Speaker Button */}
              <button
                type="button"
                onClick={toggleReadAloud}
                className={`shrink-0 min-h-[56px] px-4 py-3 rounded-2xl font-extrabold text-sm sm:text-base flex items-center gap-2 border-2 transition-all shadow-md active:scale-95 ${isSpeaking
                    ? isHighContrast
                      ? 'bg-yellow-300 text-black border-white animate-pulse'
                      : 'bg-amber-500 text-white border-amber-600 animate-pulse'
                    : isHighContrast
                      ? 'bg-zinc-900 text-yellow-300 border-yellow-400 hover:bg-zinc-800'
                      : 'bg-emerald-50 text-emerald-900 border-emerald-400 hover:bg-emerald-100'
                  }`}
                aria-label={
                  isSpeaking
                    ? lang === 'ta'
                      ? 'வாசிப்பதை நிறுத்து'
                      : 'Stop reading aloud'
                    : lang === 'ta'
                      ? 'கூடையை சத்தமாக வாசி'
                      : 'Read basket aloud'
                }
              >
                {isSpeaking ? (
                  <>
                    <VolumeX className="w-6 h-6 shrink-0" />
                    <span>{lang === 'ta' ? 'நிறுத்து' : 'Stop'}</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-6 h-6 shrink-0" />
                    <span>{lang === 'ta' ? 'கேட்க' : 'Listen'}</span>
                  </>
                )}
              </button>
            </div>

            {/* Cart Summary List */}
            {cartSummary.length > 0 && (
              <div
                className={`mt-5 rounded-2xl border-2 overflow-hidden ${isHighContrast
                    ? 'bg-zinc-900 border-yellow-400/40'
                    : 'bg-slate-50 border-slate-200'
                  }`}
              >
                <div
                  className={`px-4 py-3 flex items-center justify-between border-b ${isHighContrast
                      ? 'bg-yellow-400/10 border-yellow-400/30 text-yellow-300'
                      : 'bg-slate-100 border-slate-200 text-slate-700'
                    }`}
                >
                  <div className="flex items-center gap-2 font-extrabold text-base">
                    <PackageCheck className="w-5 h-5 shrink-0" />
                    <span>
                      {t.cartSummaryTitle ||
                        (lang === 'ta'
                          ? 'கூடையில் உள்ளவை'
                          : 'Items in Your Basket')}
                    </span>
                  </div>
                  <span
                    className={`px-3 py-0.5 rounded-full text-sm font-black ${isHighContrast
                        ? 'bg-yellow-400 text-black'
                        : 'bg-emerald-600 text-white'
                      }`}
                  >
                    {totalUnits}{' '}
                    {lang === 'ta'
                      ? 'பொருட்கள்'
                      : totalUnits === 1
                        ? 'Item'
                        : 'Items'}
                  </span>
                </div>

                {/* Scrollable Item Cards with Individual Speaker Button */}
                <div className="p-3 sm:p-4 max-h-52 overflow-y-auto space-y-2.5">
                  {cartSummary.map((item, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center justify-between gap-3 p-3 rounded-xl border ${isHighContrast
                          ? 'bg-black border-yellow-400/30 text-yellow-200'
                          : 'bg-white border-slate-200 text-slate-900 shadow-sm'
                        }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <span
                          className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-sm shrink-0 ${isHighContrast
                              ? 'bg-yellow-400 text-black'
                              : 'bg-emerald-100 text-emerald-800'
                            }`}
                        >
                          {idx + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-base sm:text-lg font-extrabold truncate">
                            {item.name}
                          </p>
                          {(item.weight || item.qty > 1) && (
                            <p
                              className={`text-xs sm:text-sm font-bold ${isHighContrast
                                  ? 'text-yellow-400/80'
                                  : 'text-slate-500'
                                }`}
                            >
                              {item.weight ? `${item.weight} ` : ''}
                              {item.qty > 1
                                ? lang === 'ta'
                                  ? `• எண்ணிக்கை: ×${item.qty}`
                                  : `• Qty: ×${item.qty}`
                                : ''}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <div className="text-right">
                          {item.qty > 1 && (
                            <span
                              className={`inline-block text-xs font-black px-2 py-0.5 rounded-md mr-1.5 ${isHighContrast
                                  ? 'bg-yellow-400/20 text-yellow-300 border border-yellow-400/50'
                                  : 'bg-amber-100 text-amber-900'
                                }`}
                            >
                              ×{item.qty}
                            </span>
                          )}
                          <span className="text-lg font-black">
                            {item.price || ''}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => speakSingleItem(item, idx)}
                          className={`p-2 rounded-xl border transition-all ${isHighContrast
                              ? 'bg-zinc-900 text-yellow-300 border-yellow-400/50 hover:bg-zinc-800'
                              : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-emerald-50 hover:text-emerald-800'
                            }`}
                          aria-label={
                            lang === 'ta'
                              ? `${item.name} விவரத்தைக் கேட்க`
                              : `Listen to ${item.name}`
                          }
                        >
                          <Volume2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {estimatedTotal > 0 && (
                  <div
                    className={`px-4 py-2.5 flex items-center justify-between border-t text-base font-black ${isHighContrast
                        ? 'bg-zinc-950 border-yellow-400/30 text-yellow-300'
                        : 'bg-emerald-50/70 border-slate-200 text-emerald-950'
                      }`}
                  >
                    <span>
                      {lang === 'ta'
                        ? 'மதிப்பிடப்பட்ட மொத்தம்:'
                        : 'Estimated Item Total:'}
                    </span>
                    <span className="text-xl">₹{estimatedTotal}</span>
                  </div>
                )}
              </div>
            )}

            {/* VIEW 1: Main Decision Buttons */}
            {!showAddMoreInput ? (
              <div className="mt-6 space-y-3.5">
                <button
                  type="button"
                  onClick={handleCheckoutClick}
                  className={`w-full min-h-[68px] px-6 py-4 rounded-2xl font-black text-xl sm:text-2xl flex items-center justify-center gap-3.5 transition-all shadow-lg border-2 active:scale-[0.99] ${isHighContrast
                      ? 'bg-yellow-400 text-black border-yellow-300 hover:bg-yellow-300'
                      : 'bg-emerald-600 text-white border-emerald-700 hover:bg-emerald-700 shadow-emerald-600/20'
                    }`}
                >
                  <CheckCircle2 className="w-8 h-8 shrink-0" />
                  <span>
                    {t.proceedCheckout ||
                      (lang === 'ta'
                        ? 'ஆர்டர் செய்யவும் (Place Order)'
                        : 'Proceed to Checkout')}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowAddMoreInput(true);
                    speakText(
                      lang === 'ta'
                        ? 'எந்தப் பொருட்களைச் சேர்க்க வேண்டும் என்று சொல்லுங்கள் அல்லது தட்டச்சு செய்யுங்கள்.'
                        : 'Please speak or type the additional items you would like to add.'
                    );
                  }}
                  className={`w-full min-h-[64px] px-6 py-4 rounded-2xl font-black text-lg sm:text-xl flex items-center justify-center gap-3 transition-all shadow-sm border-2 active:scale-[0.99] ${isHighContrast
                      ? 'bg-zinc-900 text-yellow-300 border-yellow-400 hover:bg-zinc-800'
                      : 'bg-amber-50 text-amber-950 border-amber-400 hover:bg-amber-100'
                    }`}
                >
                  <Plus className="w-7 h-7 shrink-0" />
                  <span>
                    {t.addMoreItems ||
                      (lang === 'ta'
                        ? 'மேலும் பொருட்கள் சேர்க்க'
                        : 'Add More Items')}
                  </span>
                </button>
              </div>
            ) : (
              /* VIEW 2: "Add More Items" Input + Voice Microphone Panel */
              <form onSubmit={handleAddMoreSubmit} className="mt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="add-more-input"
                    className="text-base sm:text-lg font-extrabold block"
                  >
                    {lang === 'ta'
                      ? 'எந்தப் பொருட்களைச் சேர்க்க வேண்டும்?'
                      : 'What else would you like to add?'}
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowAddMoreInput(false)}
                    className={`inline-flex items-center gap-1.5 text-sm font-bold px-3 py-1.5 rounded-xl border ${isHighContrast
                        ? 'border-yellow-400/50 text-yellow-300 hover:bg-zinc-800'
                        : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                      }`}
                  >
                    <ArrowLeft className="w-4 h-4" />
                    {lang === 'ta' ? 'பின்செல்' : 'Back'}
                  </button>
                </div>

                <div className="flex gap-2.5">
                  <input
                    id="add-more-input"
                    type="text"
                    value={addMoreText}
                    onChange={(e) => setAddMoreText(e.target.value)}
                    placeholder={
                      t.addMoreInputPlaceholder ||
                      (lang === 'ta'
                        ? 'உதா: பால், தயிர், 1 கிலோ தக்காளி...'
                        : 'e.g., 2 packets curd, banana, bread...')
                    }
                    autoFocus
                    className={`flex-1 min-w-0 px-4 py-4 rounded-2xl text-lg sm:text-xl font-bold border-2 outline-none transition-all ${isHighContrast
                        ? 'bg-zinc-900 text-yellow-300 border-yellow-400 placeholder-yellow-600/70'
                        : 'bg-white text-slate-900 border-emerald-500 placeholder-slate-400'
                      }`}
                  />

                  <button
                    type="button"
                    onClick={toggleVoiceInput}
                    className={`px-5 rounded-2xl border-2 flex items-center justify-center transition-all shrink-0 ${isListening
                        ? 'bg-red-600 text-white border-red-700 animate-pulse'
                        : isHighContrast
                          ? 'bg-zinc-900 text-yellow-300 border-yellow-400 hover:bg-zinc-800'
                          : 'bg-emerald-50 text-emerald-800 border-emerald-400 hover:bg-emerald-100'
                      }`}
                  >
                    {isListening ? (
                      <MicOff className="w-7 h-7" />
                    ) : (
                      <Mic className="w-7 h-7" />
                    )}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={!addMoreText.trim()}
                  className={`w-full min-h-[64px] py-4 rounded-2xl font-black text-xl flex items-center justify-center gap-3 transition-all shadow-lg border-2 ${!addMoreText.trim() ? 'opacity-40 cursor-not-allowed' : ''
                    } ${isHighContrast
                      ? 'bg-yellow-400 text-black border-yellow-300 hover:bg-yellow-300'
                      : 'bg-emerald-600 text-white border-emerald-700 hover:bg-emerald-700'
                    }`}
                >
                  <Plus className="w-7 h-7" />
                  <span>
                    {lang === 'ta'
                      ? 'கூடையில் சேர்க்கவும்'
                      : 'Search & Add These Items'}
                  </span>
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}