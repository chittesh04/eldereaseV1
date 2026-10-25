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
import { useOrderState } from './hooks/useOrderState';
import { PurchaseConfirmationModal } from './components/PurchaseConfirmationModal';
import { QueueProgressBanner } from './components/QueueProgressBanner';
import { AddMoreOrCheckoutModal } from './components/AddMoreOrCheckoutModal';
import { speakGlobal, stopAllSpeech, buildBotMessageSpeechText, unlockAudio } from './components/SpeakButton';
import { findLocalizedNameFromMessages } from './utils/translator';

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

  const messagesRef = useRef(messages);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const [inputText, setInputText] = useState('');

  // Order state machine (replaces boolean soup)
  const {
    phase,
    isBotThinking,
    isWaitingForOTP,
    isWaitingForPhone,
    isWaitingForConfirmation,
    isOtpModalOpen,
    isAddMoreOrCheckoutOpen,
    isQueueShopping,
    defaultPhone,
    otpPrompt,
    otpLength,
    confirmationData,
    cartSummary,
    queueProgress,
    dispatch: orderDispatch,
  } = useOrderState(t.otpDefaultPrompt);
  const [fontScale, setFontScale] = useState(() => {
    const saved = localStorage.getItem('elderease_fontScale');
    return saved ? parseFloat(saved) : 1.0;
  });
  const [isHighContrast, setIsHighContrast] = useState(() => {
    return localStorage.getItem('elderease_highContrast') === 'true';
  });
  const [ttsEnabled, setTtsEnabled] = useState(() => {
    return localStorage.getItem('elderease_tts') !== 'false';
  });
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState(null);

  // Persist language selection
  useEffect(() => {
    localStorage.setItem('elderease_lang', lang);
    document.documentElement.lang = lang === 'ta' ? 'ta' : 'en';
  }, [lang]);

  // Apply font scale dynamically to root
  useEffect(() => {
    document.documentElement.style.setProperty('--font-scale', fontScale.toString());
    localStorage.setItem('elderease_fontScale', fontScale.toString());
  }, [fontScale]);

  // Apply high contrast class to body
  useEffect(() => {
    if (isHighContrast) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
    localStorage.setItem('elderease_highContrast', isHighContrast.toString());
  }, [isHighContrast]);

  // Language Switch Handler
  const handleToggleLanguage = () => {
    const nextLang = lang === 'en' ? 'ta' : 'en';
    setLang(nextLang);
    lastSpokenSignatureRef.current = null;
    lastSpokenActionRef.current = null;

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
    stop: stopTTS,
    isSpeaking,
    hasInteracted,
  } = useSpeechSynthesis({
    enabled: ttsEnabled,
    lang: lang,
    rate: 0.9
  });

  // Handle incoming messages from LIVE Backend / WebSocket
  const handleIncomingMessage = useCallback((data) => {
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

    // Dispatch to order state machine based on backend action
    switch (data.action) {
      case 'input_phone':
        orderDispatch({ type: 'PHONE_REQUESTED', defaultPhone: data.default_phone || '' });
        break;
      case 'otp_requested':
        orderDispatch({ type: 'OTP_REQUESTED', prompt: data.prompt, otpLength: data.otpLength });
        break;
      case 'confirm_purchase':
        orderDispatch({ type: 'CONFIRMATION_REQUESTED', data: { summary: data.text, verified: data.verified } });
        break;
      case 'show_results':
        orderDispatch({ type: 'PRODUCT_RESULTS' });
        break;
      case 'order_success':
        orderDispatch({ type: 'ORDER_SUCCESS' });
        try {
          confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
        } catch (err) {
          console.warn('Confetti error:', err);
        }
        break;
      case 'step_progress':
        orderDispatch({ type: 'STEP_PROGRESS' });
        break;
      case 'queue_progress': {
        const enrichedCart = (data.cart_summary || []).map((c) => {
          if (c.name_localized && /[\u0B80-\u0BFF]/.test(c.name_localized)) return c;
          const matched = findLocalizedNameFromMessages(c.name, messagesRef.current);
          return matched ? { ...c, name_localized: matched } : c;
        });
        orderDispatch({
          type: 'QUEUE_PROGRESS',
          currentIndex: data.current_index,
          totalItems: data.total_items,
          currentItem: data.current_item,
          cartSummary: enrichedCart,
        });
        break;
      }
      case 'ask_more_or_checkout': {
        const enrichedCart = (data.cart_summary || []).map((c) => {
          if (c.name_localized && /[\u0B80-\u0BFF]/.test(c.name_localized)) return c;
          const matched = findLocalizedNameFromMessages(c.name, messagesRef.current);
          return matched ? { ...c, name_localized: matched } : c;
        });
        orderDispatch({
          type: 'ASK_MORE_OR_CHECKOUT',
          cartSummary: enrichedCart,
        });
        break;
      }
      default:
        // Regular bot responses return to idle
        if (data.action !== 'searching' && data.action !== 'command_ready') {
          orderDispatch({ type: 'BOT_RESPONDED' });
        }
        break;
    }

    // Also handle OTP via type field
    if (data.type === 'otp') {
      orderDispatch({ type: 'OTP_REQUESTED', prompt: data.prompt, otpLength: data.otpLength });
    }
  }, [orderDispatch]);

  // Reactive Auto-Read on Every New Bot Message
  const lastSpokenSignatureRef = useRef(null);
  const lastSpokenActionRef = useRef(null);

  useEffect(() => {
    if (!ttsEnabled) {
      return;
    }

    if (!messages || messages.length === 0) {
      return;
    }

    const lastIdx = messages.length - 1;
    const lastMsg = messages[lastIdx];
    if (!lastMsg || lastMsg.sender !== 'bot' || !lastMsg.text?.trim()) {
      return;
    }

    // Ignore placeholder thinking states that don't need reading
    if (lastMsg.action === 'searching' && !lastMsg.text?.trim()) {
      return;
    }

    // Unique signature for this message state
    const speechSignature = `${lastMsg.id || messages.length}-${lastMsg.action || ''}-${lastMsg.text || ''}-${(lastMsg.results || []).length}`;

    // Avoid re-reading the exact same message signature
    if (lastSpokenSignatureRef.current === speechSignature) {
      return;
    }

    const CRITICAL_ACTIONS = [
      'ask_clarification',
      'show_results',
      'ask_more_or_checkout',
      'confirm_purchase',
      'order_success',
      'otp_requested',
      'input_phone',
    ];

    const isStep = lastMsg.action === 'step_progress';

    // If an intermediate step arrives while a critical prompt is active/speaking, protect the critical prompt!
    if (isStep && lastSpokenActionRef.current && CRITICAL_ACTIONS.includes(lastSpokenActionRef.current)) {
      if (typeof window !== 'undefined' && window.speechSynthesis?.speaking) {
        return;
      }
    }

    lastSpokenSignatureRef.current = speechSignature;
    lastSpokenActionRef.current = lastMsg.action || 'bot_message';

    const textToRead = buildBotMessageSpeechText(lastMsg, lang);
    if (textToRead && textToRead.trim()) {
      setSpeakingMessageId(lastMsg.id);
      console.log('[Auto-TTS] Speaking:', textToRead);
      speakGlobal(textToRead, lang, 'msg-' + (lastMsg.id ?? lastIdx), true);
    }
  }, [messages, ttsEnabled, lang]);

  // Toggle Voice ON / OFF with instant audio feedback
  const handleToggleTts = () => {
    const nextVal = !ttsEnabled;
    setTtsEnabled(nextVal);
    localStorage.setItem('elderease_tts', nextVal.toString());

    if (!nextVal) {
      stopAllSpeech();
    } else {
      if (!hasInteracted) {
        unlockAudio();
      }
      // Instantly speak the latest bot message currently on screen
      const latestBotMsg = [...messages].reverse().find((m) => m.sender === 'bot');
      if (latestBotMsg) {
        const speechSignature = `${latestBotMsg.id || messages.length}-${latestBotMsg.action || ''}-${latestBotMsg.text || ''}-${(latestBotMsg.results || []).length}`;
        lastSpokenSignatureRef.current = speechSignature;
        lastSpokenActionRef.current = latestBotMsg.action || 'bot_message';
        const textToRead = buildBotMessageSpeechText(latestBotMsg, lang);
        if (textToRead && textToRead.trim()) {
          setSpeakingMessageId(latestBotMsg.id);
          console.log('[Auto-TTS] Manual Toggle Speaking:', textToRead);
          speakGlobal(textToRead, lang, `msg-${latestBotMsg.id || messages.length - 1}`, true);
        }
      }
    }
  };

  const [wsUrl, setWsUrl] = useState(import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws');

  // Real-time WebSocket Manager Hook
  const {
    status: wsStatus,
    retryCount,
    sendMessage: sendWsMessage,
    reconnect: reconnectWs,
  } = useWebSocket({
    url: wsUrl,
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

    const lowerText = textToSend.toLowerCase();
    let targetUrl = wsUrl;

    if (lowerText.includes('zepto')) {
      targetUrl = 'ws://localhost:8001/ws';
    } else if (lowerText.includes('blinkit')) {
      targetUrl = 'ws://localhost:8000/ws';
    }

    if (targetUrl !== wsUrl) {
      setWsUrl(targetUrl);
      // Wait briefly for the new WebSocket to begin connecting so it can queue the message
      setTimeout(() => actuallySendMessage(textToSend), 100);
      return;
    }

    actuallySendMessage(textToSend);
  };

  const actuallySendMessage = (textToSend) => {
    // Stop ongoing speech when user speaks/sends
    stopAllSpeech();
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
    orderDispatch({ type: 'USER_SENT_MESSAGE' });

    const payload = {
      sender: 'user',
      text: textToSend,
      lang: lang,
      isOtpResponse: isWaitingForOTP,
      timestamp: new Date().toISOString(),
    };

    const sent = sendWsMessage(payload);

    if (!sent && false) { // Removed error block since we now queue messages
      orderDispatch({ type: 'BOT_RESPONDED' });
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          sender: 'bot',
          text: lang === 'ta'
            ? '⚠️ **பின்னணி இணைப்பு பிழை**: செய்தியை அனுப்ப முடியவில்லை. பைதான் சர்வர் இயங்குகிறதா என்று சரிபார்க்கவும்.'
            : '⚠️ **Backend Connection Error**: Could not send message. Please ensure the live Python server is running.',
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
    orderDispatch({ type: 'CLOSE_OTP_MODAL' });
    handleSendMessage(otpCode);
  };

  const handleResetChat = () => {
    stopAllSpeech();
    stopTTS();
    lastSpokenSignatureRef.current = null;
    lastSpokenActionRef.current = null;
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
    orderDispatch({ type: 'RESET' });
  };

  const handleManualSpeak = (text, id = 'manual-speak') => {
    if (!hasInteracted) {
      unlockAudio();
    }
    speakGlobal(text, lang, id);
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors ${isHighContrast ? 'bg-black text-yellow-300' : 'bg-slate-50 text-slate-900'
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
        onToggleTts={handleToggleTts}
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

      {/* Queue Progress Banner (multi-item shopping) */}
      {isQueueShopping && queueProgress && (
        <QueueProgressBanner
          lang={lang}
          queueProgress={queueProgress}
          cartSummary={cartSummary}
          messages={messages}
          isHighContrast={isHighContrast}
        />
      )}

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
        onStartVoice={() => {
          stopAllSpeech();
          startListening();
        }}
        onStopVoice={stopListening}
        isVoiceSupported={isVoiceSupported}
        voiceError={voiceError}
        onOpenOtpKeypad={() => orderDispatch({ type: 'OPEN_OTP_MODAL' })}
        isHighContrast={isHighContrast}
      />

      {/* Large Numeric Keypad Modal for OTP Edge Case */}
      <OTPModal
        lang={lang}
        isOpen={isOtpModalOpen}
        onClose={() => orderDispatch({ type: 'CLOSE_OTP_MODAL' })}
        onSubmitOtp={handleOtpSubmit}
        promptText={otpPrompt}
        otpLength={otpLength}
        isHighContrast={isHighContrast}
      />

      {/* Purchase Confirmation Modal */}
      <PurchaseConfirmationModal
        lang={lang}
        isOpen={isWaitingForConfirmation}
        onConfirm={() => {
          sendWsMessage({ sender: 'user', text: 'yes', lang, timestamp: new Date().toISOString() });
          orderDispatch({ type: 'USER_SENT_MESSAGE' });
        }}
        onCancel={() => {
          sendWsMessage({ sender: 'user', text: 'no', lang, timestamp: new Date().toISOString() });
          orderDispatch({ type: 'ORDER_CANCELLED' });
        }}
        summary={confirmationData?.summary || ''}
        isHighContrast={isHighContrast}
      />

      {/* Add More or Checkout Modal (multi-item decision boundary) */}
      <AddMoreOrCheckoutModal
        lang={lang}
        isOpen={isAddMoreOrCheckoutOpen}
        cartSummary={cartSummary}
        messages={messages}
        onCheckout={() => {
          sendWsMessage({ sender: 'user', text: 'CHECKOUT', lang, timestamp: new Date().toISOString() });
          orderDispatch({ type: 'CLOSE_ADD_MORE_MODAL' });
          orderDispatch({ type: 'USER_SENT_MESSAGE' });
        }}
        onAddMore={(itemsText) => {
          sendWsMessage({ sender: 'user', text: itemsText, lang, timestamp: new Date().toISOString() });
          orderDispatch({ type: 'CLOSE_ADD_MORE_MODAL' });
          orderDispatch({ type: 'USER_SENT_MESSAGE' });
        }}
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
