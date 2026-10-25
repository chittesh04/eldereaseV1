import React, { useState, useEffect, useCallback } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

// Global event bus so all SpeakButtons stay in sync when one starts/stops speaking
let currentActiveId = null;
const listeners = new Set();

function notifyListeners(activeId) {
    currentActiveId = activeId;
    listeners.forEach((fn) => fn(activeId));
}

export function stopAllSpeech() {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
    }
    notifyListeners(null);
}

export function speakGlobal(text, lang = 'en', id = 'global') {
    if (!('speechSynthesis' in window) || !text) return;

    // If this exact button is already speaking, clicking it again stops it!
    if (currentActiveId === id && window.speechSynthesis.speaking) {
        stopAllSpeech();
        return;
    }

    window.speechSynthesis.cancel();

    // Strip markdown symbols (**bold**, emojis, etc.) for cleaner reading
    const cleanText = String(text)
        .replace(/\*\*/g, '')
        .replace(/\*/g, '')
        .replace(/#/g, '')
        .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
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

    utterance.onstart = () => notifyListeners(id);
    utterance.onend = () => {
        if (currentActiveId === id) notifyListeners(null);
    };
    utterance.onerror = () => {
        if (currentActiveId === id) notifyListeners(null);
    };

    notifyListeners(id);
    window.speechSynthesis.speak(utterance);
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
    className = '',
}) {
    const [buttonId] = useState(
        () => id || `speak-${Math.random().toString(36).slice(2, 9)}`
    );
    const [isSpeakingThis, setIsSpeakingThis] = useState(false);

    useEffect(() => {
        const handler = (activeId) => {
            setIsSpeakingThis(activeId === buttonId);
        };
        listeners.add(handler);
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
        sm: 'px-3 py-1.5 text-xs rounded-xl gap-1.5',
        md: 'px-3.5 py-2 text-sm rounded-xl gap-2',
        lg: 'min-h-[52px] px-4 py-3 text-base rounded-2xl gap-2.5',
    }[size];

    const iconSize = {
        sm: 'w-4 h-4',
        md: 'w-4 h-4',
        lg: 'w-6 h-6',
    }[size];

    return (
        <button
            type="button"
            onClick={handleToggle}
            className={`inline-flex items-center justify-center font-extrabold border-2 transition-all active:scale-95 shrink-0 ${sizeClasses} ${isSpeakingThis
                    ? isHighContrast
                        ? 'bg-yellow-300 text-black border-white animate-pulse shadow-md'
                        : 'bg-amber-500 text-white border-amber-600 animate-pulse shadow-md'
                    : isHighContrast
                        ? 'bg-zinc-900 text-yellow-300 border-yellow-400 hover:bg-zinc-800'
                        : 'bg-white text-blue-700 border-blue-200 hover:bg-blue-50 shadow-sm'
                } ${className}`}
            aria-label={
                isSpeakingThis
                    ? lang === 'ta'
                        ? 'வாசிப்பதை நிறுத்து'
                        : 'Stop audio'
                    : lang === 'ta'
                        ? 'சத்தமாகக் கேட்க'
                        : 'Listen aloud'
            }
            title={
                isSpeakingThis
                    ? lang === 'ta'
                        ? 'நிறுத்து'
                        : 'Stop speaking'
                    : lang === 'ta'
                        ? 'கேட்க'
                        : 'Listen'
            }
        >
            {isSpeakingThis ? (
                <>
                    <VolumeX className={`${iconSize} shrink-0`} />
                    {showLabel && <span>{lang === 'ta' ? 'நிறுத்து' : 'Stop'}</span>}
                </>
            ) : (
                <>
                    <Volume2 className={`${iconSize} shrink-0`} />
                    {showLabel && <span>{lang === 'ta' ? 'கேட்க' : 'Listen'}</span>}
                </>
            )}
        </button>
    );
}