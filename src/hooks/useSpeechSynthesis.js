import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Custom hook for Accessible Text-To-Speech (SpeechSynthesis API)
 * Supports dynamic voice resolution for Tamil ('ta-IN') and English ('en-IN').
 * Handles browser Autoplay restrictions via user gesture unlock.
 */
export function useSpeechSynthesis({ enabled = true, rate = 0.9, pitch = 1.0, lang = 'en' } = {}) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(() => {
    return sessionStorage.getItem('elderease_audio_unlocked') === 'true';
  });
  const [isSupported, setIsSupported] = useState(false);
  const [voices, setVoices] = useState([]);
  const langRef = useRef(lang);
  const currentUtteranceRef = useRef(null);

  useEffect(() => {
    langRef.current = lang;
  }, [lang]);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setIsSupported(true);

      const updateVoices = () => {
        const availableVoices = window.speechSynthesis.getVoices();
        setVoices(availableVoices);
      };

      updateVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = updateVoices;
      }
    }
  }, []);

  // Gotcha 1: Unlocks Web Audio / SpeechSynthesis via explicit user gesture
  const unlockAudio = useCallback(() => {
    if (!isSupported || typeof window === 'undefined') return;

    try {
      window.speechSynthesis.cancel();
      const silentUtterance = new SpeechSynthesisUtterance('');
      silentUtterance.volume = 0.1;
      window.speechSynthesis.speak(silentUtterance);

      setHasInteracted(true);
      sessionStorage.setItem('elderease_audio_unlocked', 'true');
    } catch (err) {
      console.warn('Audio gesture unlock attempt:', err);
    }
  }, [isSupported]);

  // Clean Markdown formatting and adapt phonetics for English and Tamil
  const cleanMarkdownForSpeech = (markdown, targetLang) => {
    if (!markdown) return '';
    let cleaned = markdown
      .replace(/[*_~`#]/g, '') // remove markdown symbols
      .replace(/\|.*?\|/g, '') // remove table pipes/headers
      .replace(/\[(.*?)\]\(.*?\)/g, '$1') // keep link text only
      .trim();

    if (targetLang === 'ta') {
      cleaned = cleaned
        .replace(/₹/g, ' ரூபாய் ')
        .replace(/OTP/gi, 'ஓ டி பி ')
        .replace(/(\d+)kg/gi, '$1 கிலோ ')
        .replace(/(\d+)g/gi, '$1 கிராம் ');
    } else {
      cleaned = cleaned
        .replace(/₹/g, ' rupees ')
        .replace(/OTP/gi, 'O T P ')
        .replace(/(\d+)kg/gi, '$1 kilograms ')
        .replace(/(\d+)g/gi, '$1 grams ');
    }

    return cleaned;
  };

  const stop = useCallback(() => {
    if (!isSupported || typeof window === 'undefined') return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, [isSupported]);

  const speak = useCallback((text, force = false, explicitLang = null) => {
    if (!isSupported || (!enabled && !force)) return;
    if (!hasInteracted && !force) {
      console.warn('Speech blocked: User must interact with page first.');
      return;
    }

    try {
      window.speechSynthesis.cancel(); // Stop any ongoing speech

      const currentLanguage = explicitLang || langRef.current || 'en';
      const plainText = cleanMarkdownForSpeech(text, currentLanguage);
      if (!plainText) return;

      const utterance = new SpeechSynthesisUtterance(plainText);
      utterance.rate = rate; // Slightly slower for elderly clarity
      utterance.pitch = pitch;

      // Find appropriate voice for the selected language
      if (currentLanguage === 'ta') {
        utterance.lang = 'ta-IN';
        const tamilVoice = voices.find(v => v.lang === 'ta-IN' || v.lang.startsWith('ta') || v.name.toLowerCase().includes('tamil'));
        if (tamilVoice) {
          utterance.voice = tamilVoice;
        }
      } else {
        utterance.lang = 'en-IN';
        const englishVoice = voices.find(v => 
          (v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('David') || v.name.includes('Premium')))
        ) || voices.find(v => v.lang.startsWith('en')) || voices[0];
        
        if (englishVoice) {
          utterance.voice = englishVoice;
        }
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = (e) => {
        console.error('SpeechSynthesis error:', e);
        setIsSpeaking(false);
      };

      currentUtteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.error('Failed to trigger speech:', err);
      setIsSpeaking(false);
    }
  }, [isSupported, enabled, hasInteracted, rate, pitch, voices]);

  return {
    speak,
    stop,
    isSpeaking,
    isSupported,
    hasInteracted,
    unlockAudio,
  };
}
