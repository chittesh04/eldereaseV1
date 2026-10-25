import React, { useState, useEffect, useRef } from 'react';
import { Delete, Check, X, ShieldCheck } from 'lucide-react';
import { SpeakButton, stopAllSpeech } from './SpeakButton';
import { translations } from '../constants/translations';

export function OTPModal({
  lang = 'en',
  isOpen,
  onClose,
  onSubmitOtp,
  promptText,
  isHighContrast,
  otpLength = 6,
}) {
  const t = translations[lang] || translations.en;
  const [otpDigits, setOtpDigits] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const hiddenInputRef = useRef(null);
  const wasOpenRef = useRef(false);

  useEffect(() => {
    if (isOpen) {
      wasOpenRef.current = true;
      setOtpDigits('');
      setSubmitting(false);
      setTimeout(() => {
        hiddenInputRef.current?.focus();
      }, 100);
    } else if (wasOpenRef.current) {
      wasOpenRef.current = false;
      stopAllSpeech();
    }
  }, [isOpen]);

  // Escape key to close modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        stopAllSpeech();
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleClose = () => {
    stopAllSpeech();
    onClose();
  };

  const handleDigitClick = (num) => {
    if (otpDigits.length < otpLength) {
      const nextOtp = otpDigits + num;
      setOtpDigits(nextOtp);
      if (nextOtp.length === otpLength && !submitting) {
        setSubmitting(true);
        stopAllSpeech();
        setTimeout(() => {
          onSubmitOtp(nextOtp);
        }, 200);
      }
    }
  };

  const handleDelete = () => {
    setOtpDigits((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setOtpDigits('');
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (otpDigits.length > 0 && !submitting) {
      setSubmitting(true);
      stopAllSpeech();
      onSubmitOtp(otpDigits);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="otp-modal-title"
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div 
        className={`w-full max-w-md rounded-3xl p-6 shadow-2xl border-4 transition-all ${
          isHighContrast
            ? 'bg-black text-yellow-300 border-yellow-400'
            : 'bg-white text-slate-900 border-blue-600'
        }`}
      >
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-zinc-700">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-2xl ${isHighContrast ? 'bg-yellow-400 text-black' : 'bg-blue-600 text-white'}`}>
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <h2 id="otp-modal-title" className="text-xl md:text-2xl font-black">
                {t.otpModalTitle}
              </h2>
              <p className="text-xs md:text-sm font-semibold opacity-80">
                {t.otpModalSubtitle}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="touch-target p-2 rounded-xl border border-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
            aria-label="Close OTP keypad"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Prompt description with SpeakButton */}
        <div className="flex items-center justify-between gap-3 mt-4">
          <p className="text-base md:text-lg font-bold leading-snug flex-1">
            {promptText || t.otpDefaultPrompt}
          </p>
          <SpeakButton
            text={promptText || t.otpDefaultPrompt}
            lang={lang}
            id="modal-otp-prompt"
            isHighContrast={isHighContrast}
            size="sm"
          />
        </div>

        {/* Hidden input for mobile native SMS 1-tap autofill (Gotcha 3) */}
        <input
          ref={hiddenInputRef}
          type="tel"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete="one-time-code"
          value={otpDigits}
          onChange={(e) => {
            const clean = e.target.value.replace(/\D/g, '').slice(0, otpLength);
            setOtpDigits(clean);
            if (clean.length === otpLength && !submitting) {
              setSubmitting(true);
              onSubmitOtp(clean);
            }
          }}
          className="opacity-0 absolute h-0 w-0 pointer-events-none"
          aria-hidden="true"
          tabIndex={-1}
        />

        {/* Large Digit Display Boxes */}
        <div className="flex justify-center items-center gap-3 my-6">
          {Array.from({ length: otpLength }).map((_, index) => {
            const char = otpDigits[index];
            return (
              <div
                key={index}
                className={`w-14 h-16 md:w-16 md:h-18 rounded-2xl flex items-center justify-center text-3xl font-black border-3 transition-all shadow-inner ${
                  char 
                    ? isHighContrast
                      ? 'bg-yellow-400 text-black border-yellow-300'
                      : 'bg-blue-50 text-blue-900 border-blue-600'
                    : isHighContrast
                      ? 'bg-zinc-900 border-yellow-500/50 text-yellow-300'
                      : 'bg-slate-100 border-slate-300 text-slate-400'
                }`}
              >
                {char || '•'}
              </div>
            );
          })}
        </div>

        {/* Big Touch-Target Numeric Keypad */}
        <div className="grid grid-cols-3 gap-3 my-2" role="group" aria-label="Numeric Keypad">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => handleDigitClick(num)}
              className={`touch-target h-14 md:h-16 text-2xl md:text-3xl font-black rounded-2xl border-2 transition-all shadow-md active:scale-95 ${
                isHighContrast
                  ? 'bg-zinc-900 text-yellow-300 border-yellow-400 hover:bg-yellow-400 hover:text-black'
                  : 'bg-slate-100 text-slate-900 border-slate-300 hover:bg-blue-100 hover:border-blue-500'
              }`}
              aria-label={`Digit ${num}`}
            >
              {num}
            </button>
          ))}

          {/* Delete / Backspace */}
          <button
            type="button"
            onClick={handleDelete}
            className={`touch-target h-14 md:h-16 flex items-center justify-center rounded-2xl border-2 transition-all shadow-md active:scale-95 ${
              isHighContrast
                ? 'bg-red-950 text-yellow-300 border-red-500 hover:bg-red-900'
                : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
            }`}
            aria-label="Delete last digit"
          >
            <Delete className="w-7 h-7" />
          </button>

          {/* Zero */}
          <button
            type="button"
            onClick={() => handleDigitClick('0')}
            className={`touch-target h-14 md:h-16 text-2xl md:text-3xl font-black rounded-2xl border-2 transition-all shadow-md active:scale-95 ${
              isHighContrast
                ? 'bg-zinc-900 text-yellow-300 border-yellow-400 hover:bg-yellow-400 hover:text-black'
                : 'bg-slate-100 text-slate-900 border-slate-300 hover:bg-blue-100 hover:border-blue-500'
            }`}
            aria-label="Digit 0"
          >
            0
          </button>

          {/* Clear All */}
          <button
            type="button"
            onClick={handleClear}
            className={`touch-target h-14 md:h-16 text-sm font-black uppercase tracking-wider rounded-2xl border-2 transition-all shadow-md active:scale-95 ${
              isHighContrast
                ? 'bg-zinc-900 text-yellow-300 border-yellow-500 hover:bg-zinc-800'
                : 'bg-slate-200 text-slate-700 border-slate-300 hover:bg-slate-300'
            }`}
            aria-label={t.clearKey}
          >
            {t.clearKey}
          </button>
        </div>

        {/* Submit Button */}
        <button
          type="button"
          onClick={() => handleSubmit()}
          disabled={otpDigits.length === 0}
          className={`w-full touch-target mt-4 py-4 rounded-2xl font-black text-xl flex items-center justify-center gap-3 transition-all shadow-lg ${
            isHighContrast
              ? 'bg-yellow-400 text-black hover:bg-yellow-300 border-2 border-yellow-300'
              : 'bg-emerald-600 text-white hover:bg-emerald-700 border-2 border-emerald-700'
          } disabled:opacity-40 disabled:cursor-not-allowed`}
          aria-label={t.otpConfirmButton}
        >
          <Check className="w-7 h-7" />
          <span>{t.otpConfirmButton}</span>
        </button>

      </div>
    </div>
  );
}
