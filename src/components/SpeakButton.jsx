import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

// Global state so all SpeakButtons and the Header stay synchronized
let currentActiveId = null;
const listeners = new Set();
let cachedVoices = [];
let speechTimer = null;
let currentUtterance = null;

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    cachedVoices = window.speechSynthesis.getVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = () => {
            cachedVoices = window.speechSynthesis.getVoices();
        };
    }
}

function notifyListeners(activeId) {
    currentActiveId = activeId;
    listeners.forEach((fn) => fn(activeId));
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
    if (speechTimer) {
        clearInterval(speechTimer);
        speechTimer = null;
    }
    currentUtterance = null;
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
 * Start speech with given text, language ('ta' | 'en'), and identifier
 */
export function speakGlobal(text, lang = 'en', id = 'global') {
    if (typeof window === 'undefined' || !('speechSynthesis' in window) || !text) return;

    // If this exact button is already speaking, clicking it again toggles STOP!
    if (currentActiveId === id && window.speechSynthesis.speaking) {
        stopAllSpeech();
        return;
    }

    // Stop any ongoing speech
    stopAllSpeech();

    const targetLang = lang === 'ta' ? 'ta' : 'en';
    const cleanText = cleanSpeechText(text, targetLang);
    if (!cleanText) return;

    try {
        const utterance = new SpeechSynthesisUtterance(cleanText);
        currentUtterance = utterance; // Prevent garbage collection in Chrome
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
            if (speechTimer) {
                clearInterval(speechTimer);
                speechTimer = null;
            }
            if (currentActiveId === id) notifyListeners(null);
        };

        utterance.onerror = (e) => {
            currentUtterance = null;
            if (speechTimer) {
                clearInterval(speechTimer);
                speechTimer = null;
            }
            if (currentActiveId === id) notifyListeners(null);
        };

        notifyListeners(id);
        window.speechSynthesis.speak(utterance);

        // Chrome bug workaround: keep speech alive during longer sentences
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