import React, { useState, useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Header } from './components/Header';
import { ChatContainer } from './components/ChatContainer';
import { InputArea } from './components/InputArea';
import { OTPModal } from './components/OTPModal';
import { ConnectionBanner } from './components/ConnectionBanner';
import { AccessibilityModal } from './components/AccessibilityModal';
import { useWebSocket } from './hooks/useWebSocket';
import { useSpeechRecognition } from './hooks/useSpeechRecognition';
import { useSpeechSynthesis } from './hooks/useSpeechSynthesis';
import { translations } from './constants/translations';

export function App() {
  // Language State ('en' | 'ta')
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('elderease_lang') || 'en';
  });

  const t = translations[lang] || translations.en;

  // Messages State
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'bot',
      text: lang === 'ta'
        ? 'வணக்கம்! நான் உங்கள் **எல்டர்ஈஸ்** 10-நிமிட மளிகை ஷாப்பிங் உதவியாளர். இன்று நீங்கள் என்ன ஆர்டர் செய்ய விரும்புகிறீர்கள்? (எ.கா: *ஆப்பிள்*, *வெங்காயம்*, *பால்*)'
        : 'Hello! I am your **ElderEase** 10-Minute Grocery AI. What would you like to order today? (e.g. *Apples*, *Onions*, *Milk*)',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputText, setInputText] = useState('');
  const [isBotThinking, setIsBotThinking] = useState(false);
  const [isWaitingForOTP, setIsWaitingForOTP] = useState(false);
  const [isWaitingForPhone, setIsWaitingForPhone] = useState(false);
  const [defaultPhone, setDefaultPhone] = useState('');
  const [otpPrompt, setOtpPrompt] = useState(t.otpDefaultPrompt);
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [fontScale, setFontScale] = useState(1.0);
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState(null);

  // Persist language selection
  useEffect(() => {
    localStorage.setItem('elderease_lang', lang);
  }, [lang]);

  // Apply font scale dynamically to root
  useEffect(() => {
    document.documentElement.style.setProperty('--font-scale', fontScale.toString());
  }, [fontScale]);

  // Apply high contrast class to body
  useEffect(() => {
    if (isHighContrast) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
  }, [isHighContrast]);

  // Language Switch Handler
  const handleToggleLanguage = () => {
    const nextLang = lang === 'en' ? 'ta' : 'en';
    setLang(nextLang);
    
    if (messages.length <= 1) {
      setMessages([
        {
          id: 'welcome-' + Date.now(),
          sender: 'bot',
          text: nextLang === 'ta'
            ? 'வணக்கம்! நான் உங்கள் **எல்டர்ஈஸ்** 10-நிமிட மளிகை ஷாப்பிங் உதவியாளர். இன்று நீங்கள் என்ன ஆர்டர் செய்ய விரும்புகிறீர்கள்?'
            : 'Hello! I am your **ElderEase** 10-Minute Grocery AI. What would you like to order today?',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }
  };

  // TTS Hook (Gotcha 1: Audio Autoplay Gate + Tamil Voice Integration)
  const { 
    speak, 
    stop: stopTTS, 
    isSpeaking, 
    hasInteracted, 
    unlockAudio, 
  } = useSpeechSynthesis({ 
    enabled: ttsEnabled,
    lang: lang,
    rate: 0.9
  });

  // Handle incoming messages from LIVE Backend / WebSocket
  const handleIncomingMessage = useCallback((data) => {
    setIsBotThinking(false);

    const newMsg = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 6),
      sender: data.sender || 'bot',
      text: data.text || '',
      timestamp: data.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      action: data.action || null,
      type: data.type || null,
      step: data.step !== undefined ? data.step : undefined,
      results: data.results || undefined,
    };

    setMessages((prev) => [...prev, newMsg]);

    // Read aloud if TTS is enabled (skip reading fast step progress to avoid voice clutter)
    if (data.sender !== 'user' && ttsEnabled && data.action !== 'step_progress') {
      setSpeakingMessageId(newMsg.id);
      speak(data.text, false, data.lang || lang);
    }

    // Handle Phone Number Request from live agent
    if (data.action === 'input_phone') {
      setIsWaitingForPhone(true);
      if (data.default_phone) {
        setDefaultPhone(data.default_phone);
      }
    } else {
      setIsWaitingForPhone(false);
    }

    // Handle OTP Verification Challenge from live agent
    if (data.type === 'otp' || data.action === 'otp_requested') {
      setIsWaitingForOTP(true);
      if (data.prompt) {
        setOtpPrompt(data.prompt);
      }
      setIsOtpModalOpen(true);
    } else if (data.action === 'order_success') {
      setIsWaitingForOTP(false);
      setIsOtpModalOpen(false);
      // Trigger celebratory confetti
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });
      } catch (err) {
        console.warn('Confetti error:', err);
      }
    } else if (data.action !== 'input_phone') {
      setIsWaitingForOTP(false);
    }
  }, [ttsEnabled, speak, lang]);

  // Real-time WebSocket Manager Hook
  const {
    status: wsStatus,
    retryCount,
    sendMessage: sendWsMessage,
    reconnect: reconnectWs,
  } = useWebSocket({
    url: 'ws://localhost:8000/ws',
    onMessage: handleIncomingMessage,
  });

  // Voice-to-Text Recognition Hook (Tamil & English support)
  const handleVoiceResult = useCallback((recognizedText) => {
    setInputText(recognizedText);
  }, []);

  const {
    isListening,
    transcript,
    error: voiceError,
    isSupported: isVoiceSupported,
    startListening,
    stopListening,
  } = useSpeechRecognition({
    onResult: handleVoiceResult,
    lang: lang === 'ta' ? 'ta-IN' : 'en-IN',
  });

  // Sync interim transcript into input box
  useEffect(() => {
    if (transcript) {
      setInputText(transcript);
    }
  }, [transcript]);

  // Sending a User Message (via Text or Voice) - STRICTLY LIVE TO BACKEND
  const handleSendMessage = (textToSend) => {
    if (!textToSend.trim()) return;

    // Stop ongoing speech when user speaks/sends
    stopTTS();

    // Gotcha 1: Register user interaction to unlock audio
    if (!hasInteracted) {
      unlockAudio();
    }

    const userMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsBotThinking(true);
    setIsWaitingForPhone(false);

    const payload = {
      sender: 'user',
      text: textToSend,
      lang: lang,
      isOtpResponse: isWaitingForOTP,
      timestamp: new Date().toISOString(),
    };

    const sent = sendWsMessage(payload);

    if (!sent) {
      setIsBotThinking(false);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          sender: 'bot',
          text: '⚠️ **Backend Connection Error**: Could not send message to `ws://localhost:8000/ws`. Please ensure the live Python server is running.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }
  };

  // User clicked a product card from the top 5 search results
  const handleSelectProduct = (choiceNumber, productName) => {
    handleSendMessage(`${choiceNumber}`);
  };

  const handleOtpSubmit = (otpCode) => {
    setIsOtpModalOpen(false);
    handleSendMessage(otpCode);
  };

  const handleResetChat = () => {
    stopTTS();
    setMessages([
      {
        id: 'welcome-' + Date.now(),
        sender: 'bot',
        text: lang === 'ta'
          ? 'வணக்கம்! நான் உங்கள் **எல்டர்ஈஸ்** 10-நிமிட மளிகை ஷாப்பிங் உதவியாளர். இன்று நீங்கள் என்ன ஆர்டர் செய்ய விரும்புகிறீர்கள்?'
          : 'Hello! I am your **ElderEase** 10-Minute Grocery AI. What would you like to order today?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setIsWaitingForOTP(false);
    setIsWaitingForPhone(false);
    setIsBotThinking(false);
  };

  const handleManualSpeak = (text) => {
    if (!hasInteracted) {
      unlockAudio();
    }
    speak(text, true, lang);
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors ${
      isHighContrast ? 'bg-black text-yellow-300' : 'bg-slate-50 text-slate-900'
    }`}>
      
      {/* Header */}
      <Header
        lang={lang}
        onToggleLanguage={handleToggleLanguage}
        status={wsStatus}
        fontScale={fontScale}
        setFontScale={setFontScale}
        isHighContrast={isHighContrast}
        setIsHighContrast={setIsHighContrast}
        ttsEnabled={ttsEnabled}
        setTtsEnabled={setTtsEnabled}
        onResetChat={handleResetChat}
        onOpenHelp={() => setIsHelpOpen(true)}
      />

      {/* Disconnection Warning Banner */}
      <ConnectionBanner
        lang={lang}
        status={wsStatus}
        retryCount={retryCount}
        onReconnect={reconnectWs}
        isHighContrast={isHighContrast}
      />

      {/* Main Accessible Chat Message Area */}
      <ChatContainer
        lang={lang}
        messages={messages}
        isHighContrast={isHighContrast}
        onSpeakMessage={handleManualSpeak}
        speakingMessageId={isSpeaking ? speakingMessageId : null}
        onSelectPrompt={handleSendMessage}
        onSelectProduct={handleSelectProduct}
        hasAudioUnlocked={hasInteracted}
        onUnlockAudio={unlockAudio}
      />

      {/* Input Area (with Voice Mic, mobile OTP & Phone inputMode & autoComplete) */}
      <InputArea
        lang={lang}
        inputText={inputText}
        setInputText={setInputText}
        onSendMessage={handleSendMessage}
        isBotThinking={isBotThinking}
        isWaitingForOTP={isWaitingForOTP}
        isWaitingForPhone={isWaitingForPhone}
        defaultPhone={defaultPhone}
        isListening={isListening}
        onStartVoice={startListening}
        onStopVoice={stopListening}
        isVoiceSupported={isVoiceSupported}
        voiceError={voiceError}
        onOpenOtpKeypad={() => setIsOtpModalOpen(true)}
        isHighContrast={isHighContrast}
      />

      {/* Large Numeric Keypad Modal for OTP Edge Case */}
      <OTPModal
        lang={lang}
        isOpen={isOtpModalOpen}
        onClose={() => setIsOtpModalOpen(false)}
        onSubmitOtp={handleOtpSubmit}
        promptText={otpPrompt}
        isHighContrast={isHighContrast}
      />

      {/* Accessibility & Viva Guide Modal */}
      <AccessibilityModal
        lang={lang}
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        isHighContrast={isHighContrast}
      />

    </div>
  );
}

export default App;
