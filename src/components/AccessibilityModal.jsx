import React from 'react';
import { X, Volume2, Eye, Mic, Keyboard, Shield, Languages } from 'lucide-react';
import { translations } from '../constants/translations';

export function AccessibilityModal({ lang = 'en', isOpen, onClose, isHighContrast }) {
  if (!isOpen) return null;

  const t = translations[lang] || translations.en;

  const features = lang === 'ta' ? [
    {
      icon: <Languages className="w-6 h-6 text-indigo-600 dark:text-yellow-400" />,
      title: 'முழுமையான தமிழ் மொழி ஆதரவு (Tamil Voice & Bridge)',
      desc: 'முதியவர்கள் தங்கள் தாய்மொழியான தமிழில் இயல்பாக பேசலாம். AI மொழிபெயர்ப்பு இயந்திரம் உங்கள் தமிழ் கோரிக்கையை ஆங்கில இ-காமர்ஸ் தளங்களில் நேரடியாக செயல்படுத்துகிறது.',
    },
    {
      icon: <Eye className="w-6 h-6 text-blue-600 dark:text-yellow-400" />,
      title: 'பெரிய எழுத்துக்கள் மற்றும் அதிக மாறுபட்ட நிறம் (High Contrast)',
      desc: '18px க்கும் அதிகமான அடிப்படை எழுத்து அளவு, எளிதில் மாற்றக்கூடிய அளவுகள் (A-, A, A+) மற்றும் WCAG 2.1 AAA தரநிலை கொண்ட உயர் மாறுபட்ட நிறங்கள்.',
    },
    {
      icon: <Mic className="w-6 h-6 text-emerald-600 dark:text-yellow-400" />,
      title: 'குரல் வழி ஷாப்பிங் (Web Speech API)',
      desc: 'தட்டச்சு செய்ய சிரமப்படும் முதியவர்களுக்காக ஒரே தொடுதலில் தமிழில் பேசும் வசதி மற்றும் துடிப்பு அனிமேஷன்.',
    },
    {
      icon: <Volume2 className="w-6 h-6 text-indigo-600 dark:text-yellow-400" />,
      title: 'குரல் வாசிப்பு (Tamil Text-to-Speech)',
      desc: 'உதவியாளரின் பதில்களை தெளிவான தமிழ் உச்சரிப்பில் சத்தமாக வாசித்துக்காட்டும் வசதி (எ.கா: ₹ - ரூபாய், kg - கிலோ).',
    },
    {
      icon: <Shield className="w-6 h-6 text-amber-600 dark:text-yellow-400" />,
      title: 'தானியங்கி OTP உள்ளீடு மற்றும் பெரிய விசைப்பலகை',
      desc: 'மொபைல் SMS இலிருந்து தானாக OTP ஐ கண்டறிந்து உள்ளிடும் வசதி மற்றும் பெரிய எண் பொத்தான்கள் கொண்ட விசைப்பலகை.',
    },
  ] : [
    {
      icon: <Languages className="w-6 h-6 text-indigo-600 dark:text-yellow-400" />,
      title: 'Bilingual Language Bridge (English & தமிழ்)',
      desc: 'Elderly users can speak naturally in Tamil. Gemini acts as a bridge, translating Tamil product queries into English for Blinkit/Zepto e-commerce stores.',
    },
    {
      icon: <Eye className="w-6 h-6 text-blue-600 dark:text-yellow-400" />,
      title: 'High-Legibility Typography & Contrast',
      desc: 'Base text sizes exceed 18px with large line-height and scalable sizing (A-, A, A+) adhering to WCAG 2.1 AAA high-contrast standards.',
    },
    {
      icon: <Mic className="w-6 h-6 text-emerald-600 dark:text-yellow-400" />,
      title: 'Voice-First Interaction (Web Speech API)',
      desc: 'One-tap voice typing with active pulse indicator and fallback detection for elderly users who prefer speaking over typing.',
    },
    {
      icon: <Volume2 className="w-6 h-6 text-indigo-600 dark:text-yellow-400" />,
      title: 'Text-to-Speech (TTS) Narration',
      desc: 'Automatic voice reading for all assistant responses in native Tamil & English with clean spoken phonetic formatting.',
    },
    {
      icon: <Shield className="w-6 h-6 text-amber-600 dark:text-yellow-400" />,
      title: 'Native Mobile SMS OTP Autofill & Big Keypad',
      desc: 'Supports autoComplete="one-time-code" and large touch keypads for frictionless 1-tap verification on iOS and Android.',
    },
  ];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="a11y-modal-title"
    >
      <div 
        className={`w-full max-w-2xl rounded-3xl p-6 md:p-8 shadow-2xl border-4 max-h-[90vh] overflow-y-auto ${
          isHighContrast
            ? 'bg-black text-yellow-300 border-yellow-400'
            : 'bg-white text-slate-900 border-blue-600'
        }`}
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-zinc-700">
          <div>
            <h2 id="a11y-modal-title" className="text-2xl font-black">
              {t.a11yTitle}
            </h2>
            <p className="text-sm font-semibold opacity-80">
              {t.a11ySubtitle}
            </p>
          </div>
          <button
            onClick={onClose}
            className="touch-target p-2 rounded-xl border border-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4 my-6">
          {features.map((item, idx) => (
            <div 
              key={idx}
              className={`p-4 rounded-2xl border-2 flex items-start gap-4 ${
                isHighContrast
                  ? 'bg-zinc-900 border-yellow-400/50'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="p-2.5 rounded-xl bg-white dark:bg-black shadow-sm shrink-0">
                {item.icon}
              </div>
              <div>
                <h3 className="font-extrabold text-base md:text-lg mb-1">{item.title}</h3>
                <p className="text-sm md:text-base opacity-90 leading-relaxed font-medium">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className={`w-full touch-target py-3.5 rounded-2xl font-black text-lg transition-all shadow-md ${
            isHighContrast
              ? 'bg-yellow-400 text-black hover:bg-yellow-300'
              : 'bg-blue-700 text-white hover:bg-blue-800'
          }`}
          aria-label={t.a11yClose}
        >
          {t.a11yClose}
        </button>
      </div>
    </div>
  );
}
