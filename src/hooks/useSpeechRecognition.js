import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook for Speech Recognition (Speech-to-Text)
 * Supports dynamic language switching ('en-IN' vs 'ta-IN') for Tamil & English
 * Handles browser feature detection and provides clear error feedback.
 */
export function useSpeechRecognition({ onResult, lang = 'en-IN' } = {}) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState(null);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef(null);
  const langRef = useRef(lang);

  useEffect(() => {
    langRef.current = lang;
    if (recognitionRef.current) {
      recognitionRef.current.lang = lang;
    }
  }, [lang]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      setIsSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = lang;

      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
      };

      recognition.onresult = (event) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
        if (onResult && event.results[0]?.isFinal) {
          onResult(currentTranscript);
        }
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          setError(
            lang.startsWith('ta')
              ? 'மைக்ரோஃபோன் அனுமதி மறுக்கப்பட்டது. உங்கள் உலாவி அமைப்புகளில் அனுமதியை இயக்கவும்.'
              : 'Microphone permission was denied. Please allow microphone access in your browser settings.'
          );
        } else if (event.error === 'no-speech') {
          setError(
            lang.startsWith('ta')
              ? 'குரல் எதுவும் கேட்கவில்லை. மீண்டும் மைக்கை தொட்டு தெளிவாக பேசவும்.'
              : 'No speech was detected. Please try tapping the mic again and speaking clearly.'
          );
        } else {
          setError(`Voice error: ${event.error}`);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } else {
      setIsSupported(false);
      setError(
        lang.startsWith('ta')
          ? 'குரல் வழி தட்டச்சு செய்வதற்கு Google Chrome அல்லது Edge உலாவி தேவை.'
          : 'Voice typing is only supported on Google Chrome and Microsoft Edge.'
      );
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }
    };
  }, [lang, onResult]);

  const startListening = useCallback(() => {
    if (!isSupported) {
      setError(
        langRef.current.startsWith('ta')
          ? 'குரல் வழி தட்டச்சு செய்வதற்கு Google Chrome அல்லது Edge உலாவி தேவை.'
          : 'Voice typing is only supported on Google Chrome and Microsoft Edge.'
      );
      return;
    }
    setError(null);
    setTranscript('');
    try {
      if (recognitionRef.current) {
        recognitionRef.current.lang = langRef.current;
        recognitionRef.current.start();
      }
    } catch (err) {
      console.warn('SpeechRecognition start retry:', err);
      try {
        recognitionRef.current?.stop();
        setTimeout(() => {
          if (recognitionRef.current) {
            recognitionRef.current.lang = langRef.current;
            recognitionRef.current.start();
          }
        }, 150);
      } catch (retryErr) {
        console.error('Retry error:', retryErr);
      }
    }
  }, [isSupported]);

  const stopListening = useCallback(() => {
    try {
      recognitionRef.current?.stop();
    } catch (err) {
      console.warn('SpeechRecognition stop error:', err);
    }
    setIsListening(false);
  }, []);

  return {
    isListening,
    transcript,
    error,
    isSupported,
    startListening,
    stopListening,
    clearError: () => setError(null),
  };
}
