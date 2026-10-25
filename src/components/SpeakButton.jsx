import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

// Global state so all SpeakButtons and the Header stay synchronized
let currentActiveId = null;
const listeners = new Set();
let cachedVoices = [];
let speechTimer = null;
let speakTimeout = null;
let currentUtterance = null;

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    const updateVoices = () => {
        try {
            cachedVoices = window.speechSynthesis.getVoices();
        } catch (_) {}
    };
    updateVoices();
    if (window.speechSynthesis.addEventListener) {
        window.speechSynthesis.addEventListener('voiceschanged', updateVoices);
    } else if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = updateVoices;
    }
}

/**
 * Unlock Chrome's speech synthesis on any user interaction
 */
export function unlockAudio() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
        if (window.speechSynthesis.paused) {
            window.speechSynthesis.resume();
        }
        const unlock = new SpeechSynthesisUtterance('');
        unlock.volume = 0;
        window.speechSynthesis.speak(unlock);
        sessionStorage.setItem('elderease_audio_unlocked', 'true');
    } catch (err) {
        console.warn('Speech unlock error:', err);
    }
}

// Auto-register one-time unlock on first click, keydown, or touch on document
if (typeof document !== 'undefined') {
    const handleFirstInteraction = () => {
        unlockAudio();
    };
    document.addEventListener('click', handleFirstInteraction, { once: true, capture: true });
    document.addEventListener('keydown', handleFirstInteraction, { once: true, capture: true });
    document.addEventListener('touchstart', handleFirstInteraction, { once: true, capture: true });
}

function notifyListeners(activeId) {
    currentActiveId = activeId;
    listeners.forEach((fn) => fn(activeId));
}

/**
 * Builds clean spoken text for a bot message, expanding product options if present
 */
export function buildBotMessageSpeechText(message, targetLang = 'en') {
    if (!message) return '';
    const baseText = message.text || '';

    // If this message contains product search results (show_results), format all 5 options aloud!
    if (message.results && Array.isArray(message.results) && message.results.length > 0) {
        const optionsSpeech = message.results.map((product, idx) => {
            const itemNumber = idx + 1;
            const name = product.name_localized || product.name || '';
            const weight = product.weight ? `, ${product.weight}` : '';
            const rawPrice = String(product.price || '').replace(/[^0-9.]/g, '');
            const priceText = rawPrice
                ? targetLang === 'ta'
                    ? `விலை ${rawPrice} ரூபாய்`
                    : `price ${rawPrice} rupees`
                : '';
            const qtyText = (product.qty_needed && product.qty_needed > 1)
                ? targetLang === 'ta'
                    ? `, ${product.qty_needed} எண்ணிக்கை சேர்க்கப்படும்`
                    : `, will add ${product.qty_needed} units`
                : '';

            if (targetLang === 'ta') {
                return `விருப்பம் ${itemNumber}: ${name}${weight}${priceText ? `, ${priceText}` : ''}${qtyText}`;
            }
            return `Option ${itemNumber}: ${name}${weight}${priceText ? `, ${priceText}` : ''}${qtyText}`;
        }).join('. ');

        const intro = baseText
            ? `${baseText}. `
            : (targetLang === 'ta' ? 'கண்டுபிடிக்கப்பட்ட பொருட்கள்: ' : 'Top matches found: ');
        const outro = targetLang === 'ta'
            ? ' நீங்கள் விரும்பும் பொருளின் எண்ணை சொல்லவும் அல்லது தொடவும்.'
            : ' Tap an item or say its number to add to your basket.';

        return `${intro}${optionsSpeech}.${outro}`;
    }

    return baseText;
}

/**
 * Hook to track which SpeakButton/Modal is currently speaking, or null if idle
 */
export function useCurrentSpeakingId() {
    const [activeId, setActiveId] = useState(currentActiveId);

    useEffect(() => {
        const handler = (id) => setActiveId(id);
        listeners.add(handler);
        return () => listeners.delete(handler);
    }, []);

    return activeId;
}

/**
 * Clean markdown symbols, HTML, and replace units/symbols with spoken phonetics (Tamil & English)
 */
export function cleanSpeechText(text, targetLang = 'en') {
    if (!text) return '';
    let cleaned = String(text)
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
}

/**
 * Immediately cancel all ongoing browser speech and notify all buttons
 */
export function stopAllSpeech() {
    if (speakTimeout) {
        clearTimeout(speakTimeout);
        speakTimeout = null;
    }
    if (speechTimer) {
        clearInterval(speechTimer);
        speechTimer = null;
    }
    currentUtterance = null;
    if (typeof window !== 'undefined') {
        window.__currentUtterance = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        try {
            window.speechSynthesis.cancel();
        } catch (err) {
            console.warn('Speech cancel error:', err);
        }
    }
    notifyListeners(null);
}

/**
 * Start speech with given text, language ('ta' | 'en'), and identifier.
 * Uses 60ms delay to resolve Chromium's synchronous cancel-then-speak cancellation bug.
 */
export function speakGlobal(text, lang = 'en', id = 'global', force = false) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window) || !text) return;

    if (speakTimeout) {
        clearTimeout(speakTimeout);
        speakTimeout = null;
    }

    // If this exact button is already speaking, clicking it toggles STOP (unless forced by auto-read)
    if (!force && currentActiveId === id && (window.speechSynthesis.speaking || window.speechSynthesis.pending)) {
        stopAllSpeech();
        return;
    }

    // Clear keep-alive timer and cancel ongoing speech in browser
    if (speechTimer) {
        clearInterval(speechTimer);
        speechTimer = null;
    }
    try {
        window.speechSynthesis.cancel();
    } catch (err) {
        console.warn('Speech cancel error:', err);
    }

    const targetLang = lang === 'ta' ? 'ta' : 'en';
    const cleanText = cleanSpeechText(text, targetLang);
    if (!cleanText) {
        notifyListeners(null);
        return;
    }

    notifyListeners(id);

    // 60ms delay ensures window.speechSynthesis.cancel() completes in Chromium
    speakTimeout = setTimeout(() => {
        if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

        try {
            if (window.speechSynthesis.paused) {
                try {
                    window.speechSynthesis.resume();
                } catch (_) {}
            }

            const utterance = new SpeechSynthesisUtterance(cleanText);
            currentUtterance = utterance;
            // Prevent garbage collection in Chrome mid-speech
            if (typeof window !== 'undefined') {
                window.__currentUtterance = utterance;
            }

            utterance.lang = targetLang === 'ta' ? 'ta-IN' : 'en-IN';
            utterance.rate = 0.92;
            utterance.pitch = 1.0;

            const voices = cachedVoices.length ? cachedVoices : window.speechSynthesis.getVoices();
            if (targetLang === 'ta') {
                const tamilVoice = voices.find(
                    (v) =>
                        v.lang === 'ta-IN' ||
                        v.lang.toLowerCase().startsWith('ta') ||
                        v.name.toLowerCase().includes('tamil')
                );
                if (tamilVoice) utterance.voice = tamilVoice;
            } else {
                const englishVoice =
                    voices.find(
                        (v) =>
                            v.lang.startsWith('en') &&
                            (v.name.includes('Natural') ||
                                v.name.includes('Google') ||
                                v.name.includes('Samantha') ||
                                v.name.includes('David') ||
                                v.name.includes('Premium'))
                    ) ||
                    voices.find((v) => v.lang.startsWith('en')) ||
                    voices[0];
                if (englishVoice) utterance.voice = englishVoice;
            }

            utterance.onstart = () => {
                notifyListeners(id);
            };

            utterance.onend = () => {
                currentUtterance = null;
                if (typeof window !== 'undefined') {
                    window.__currentUtterance = null;
                }
                if (speechTimer) {
                    clearInterval(speechTimer);
                    speechTimer = null;
                }
                if (currentActiveId === id) notifyListeners(null);
            };

            utterance.onerror = (e) => {
                currentUtterance = null;
                if (typeof window !== 'undefined') {
                    window.__currentUtterance = null;
                }
                if (speechTimer) {
                    clearInterval(speechTimer);
                    speechTimer = null;
                }
                if (currentActiveId === id) notifyListeners(null);
            };

            notifyListeners(id);
            if (window.speechSynthesis.paused) {
                try {
                    window.speechSynthesis.resume();
                } catch (_) {}
            }
            window.speechSynthesis.speak(utterance);

            // Chrome bug workaround: keep speech alive during longer sentences
            if (speechTimer) clearInterval(speechTimer);
            speechTimer = setInterval(() => {
                if (window.speechSynthesis && window.speechSynthesis.speaking) {
                    window.speechSynthesis.pause();
                    window.speechSynthesis.resume();
                } else {
                    if (speechTimer) {
                        clearInterval(speechTimer);
                        speechTimer = null;
                    }
                }
            }, 12000);
        } catch (err) {
            console.error('Failed to trigger speech:', err);
            notifyListeners(null);
        }
    }, 60);
}

/**
 * Reusable SpeakButton with automatic "Listen" <-> "Stop" toggle!
 * Drop this anywhere: Chat messages, Product cards, Headers, or Modals.
 */
export function SpeakButton({
    text,
    lang = 'en',
    id,
    isHighContrast = false,
    size = 'md', // 'sm' | 'md' | 'lg'
    showLabel = true,
    idleLabel,
    activeLabel,
    className = '',
    title,
}) {
    const buttonId = useMemo(
        () => id || `speak-${Math.random().toString(36).slice(2, 9)}`,
        [id]
    );
    const [isSpeakingThis, setIsSpeakingThis] = useState(
        () => currentActiveId === buttonId
    );

    useEffect(() => {
        const handler = (activeId) => {
            setIsSpeakingThis(activeId === buttonId);
        };
        listeners.add(handler);
        // Sync initial state
        setIsSpeakingThis(currentActiveId === buttonId);
        return () => listeners.delete(handler);
    }, [buttonId]);

    const handleToggle = useCallback(
        (e) => {
            e.stopPropagation(); // Prevents triggering parent card clicks (e.g. on Product Cards)
            if (isSpeakingThis) {
                stopAllSpeech();
            } else {
                speakGlobal(text, lang, buttonId);
            }
        },
        [buttonId, isSpeakingThis, lang, text]
    );

    const sizeClasses = {
        sm: 'px-2.5 py-1.5 text-xs rounded-xl gap-1.5',
        md: 'px-3.5 py-2 text-sm rounded-xl gap-2',
        lg: 'min-h-[50px] px-4 py-3 text-base rounded-2xl gap-2.5',
    }[size] || 'px-3.5 py-2 text-sm rounded-xl gap-2';

    const iconSize = {
        sm: 'w-4 h-4',
        md: 'w-4 h-4',
        lg: 'w-5 h-5',
    }[size] || 'w-4 h-4';

    const defaultIdleLabel = lang === 'ta' ? 'கேட்க' : 'Listen';
    const defaultActiveLabel = lang === 'ta' ? 'நிறுத்து' : 'Stop';
    const currentLabel = isSpeakingThis
        ? activeLabel || defaultActiveLabel
        : idleLabel || defaultIdleLabel;

    return (
        <button
            type="button"
            onClick={handleToggle}
            className={`inline-flex items-center justify-center font-black border-2 transition-all active:scale-95 shrink-0 select-none cursor-pointer ${sizeClasses} ${
                isSpeakingThis
                    ? isHighContrast
                        ? 'bg-yellow-300 text-black border-white animate-pulse shadow-md ring-2 ring-white/50'
                        : 'bg-amber-500 text-white border-amber-600 animate-pulse shadow-md ring-2 ring-amber-300/60'
                    : isHighContrast
                        ? 'bg-zinc-900 text-yellow-300 border-yellow-400 hover:bg-zinc-800 hover:border-yellow-300'
                        : 'bg-white text-blue-700 border-blue-200 hover:bg-blue-50 hover:border-blue-300 shadow-sm'
            } ${className}`}
            aria-label={
                title ||
                (isSpeakingThis
                    ? lang === 'ta'
                        ? 'வாசிப்பதை நிறுத்து'
                        : 'Stop audio'
                    : lang === 'ta'
                        ? 'சத்தமாகக் கேட்க'
                        : 'Listen aloud')
            }
            title={
                title ||
                (isSpeakingThis
                    ? lang === 'ta'
                        ? 'நிறுத்து'
                        : 'Stop speaking'
                    : lang === 'ta'
                        ? 'கேட்க'
                        : 'Listen')
            }
        >
            {isSpeakingThis ? (
                <>
                    <VolumeX className={`${iconSize} shrink-0`} />
                    {showLabel && <span>{currentLabel}</span>}
                </>
            ) : (
                <>
                    <Volume2 className={`${iconSize} shrink-0`} />
                    {showLabel && <span>{currentLabel}</span>}
                </>
            )}
        </button>
    );
}