export const translations = {
  en: {
    appName: "ElderEase",
    appTagline: "Voice Shopping Assistant for Seniors",
    agentBadge: "Agent",
    statusOnline: "Online",
    statusConnecting: "Connecting...",
    statusOffline: "Offline",

    // Accessibility Toolbar
    decreaseFont: "Decrease text size",
    resetFont: "Reset text size",
    increaseFont: "Increase text size",
    highContrastOn: "Normal Theme",
    highContrastOff: "High Contrast",
    voiceOn: "Voice ON",
    voiceMuted: "Muted",
    resetChat: "Start New Order",
    helpGuide: "Accessibility Guide",
    langSwitch: "தமிழ்",
    langSwitchTitle: "Switch to Tamil (தமிழ்)",

    // Autoplay Audio Gate Banner
    audioGateTitle: "Enable Voice Narration",
    audioGateDesc: "Tap to allow the assistant to read messages out loud for you.",
    audioGateButton: "🔊 Start Voice Assistant",

    // Welcome Screen
    welcomeTitle: "Vanakam! How can I help you shop today?",
    welcomeSubtitle: "You can type your order below or simply tap the big green microphone to speak naturally in plain words.",
    quickSuggestionsTitle: "Quick sample requests (tap to try):",
    starterPrompts: [
      { label: "🧅 Order 1kg Fresh Onions", text: "Please order 1kg fresh red onions" },
      { label: "🥛 2 Packets Toned Milk", text: "I need 2 packets of toned milk" },
      { label: "🍞 Whole Wheat Bread & Butter", text: "Order 1 pack whole wheat brown bread and butter" },
      { label: "🍎 1kg Shimla Apples", text: "Order 1kg fresh Shimla apples" },
    ],

    // Chat Message Actions & Badges
    searchingBadge: "Searching Grocery Stores...",
    cartUpdatedBadge: "Cart Updated",
    otpRequiredBadge: "Action Required: Verification Code",
    orderConfirmedBadge: "Order Confirmed",
    listenButton: "Listen",
    readingButton: "Reading...",
    justNow: "Just now",

    // Input Area
    inputPlaceholder: "Type what you want to buy (e.g., 1kg onions)...",
    inputOtpPlaceholder: "Enter 4-digit or 6-digit OTP here...",
    inputBotThinkingPlaceholder: "Assistant is processing your request...",
    micButtonTitle: "Speak to the Assistant",
    micStopTitle: "Stop Voice Recording",
    micUnsupported: "Voice typing requires Google Chrome or Microsoft Edge.",
    listeningBanner: "Listening to you... Speak now!",
    doneSpeaking: "Done Speaking",
    sendButton: "Send",
    botThinkingStatus: "Assistant is browsing stores and updating your cart... Please wait.",
    otpNoticeText: "Action Required: Enter the verification code (OTP) sent to your mobile.",
    openBigKeypad: "Big Keypad",

    // OTP Modal
    otpModalTitle: "Verification Code",
    otpModalSubtitle: "Security Check for Payment",
    otpDefaultPrompt: "Please enter the 4-digit verification code sent to your mobile phone.",
    otpConfirmButton: "Confirm & Place Order",
    clearKey: "Clear",

    // Connection Banner
    disconnectedTitle: "⚠️ Disconnected from Backend Server",
    connectingTitle: "Connecting to Assistant Server...",
    reconnectingDesc: "Attempting reconnection",
    disconnectedDesc: "FastAPI WebSocket is not responding at ws://localhost:8000/ws",
    retryConnection: "Retry Connection",
    useDemoMode: "Use Offline Demo Mode",

    // Accessibility Modal
    a11yTitle: "ElderEase Accessibility Features",
    a11ySubtitle: "Engineered for Elderly & Visually Impaired Users (WCAG 2.1 AA/AAA)",
    a11yClose: "Got It, Back to Shopping",
  },

  ta: {
    appName: "எல்டர்ஈஸ்",
    appTagline: "முதியோருக்கான குரல் வழி மளிகை ஷாப்பிங் உதவியாளர்",
    agentBadge: "உதவியாளர்",
    statusOnline: "இணைப்பில் உள்ளது",
    statusConnecting: "இணைக்கப்படுகிறது...",
    statusOffline: "இணைப்பு இல்லை",

    // Accessibility Toolbar
    decreaseFont: "எழுத்து அளவை குறைக்கவும்",
    resetFont: "சாதாரண எழுத்து அளவு",
    increaseFont: "எழுத்து அளவை பெரிதாக்கவும்",
    highContrastOn: "சாதாரண நிறம்",
    highContrastOff: "அதிக மாறுபட்ட நிறம்",
    voiceOn: "குரல் ஒலி இயக்கம்",
    voiceMuted: "குரல் ஒலி நிறுத்தம்",
    resetChat: "புதிய ஆர்டர் தொடங்கவும்",
    helpGuide: "உதவி வழிகாட்டி",
    langSwitch: "English",
    langSwitchTitle: "Switch to English",

    // Autoplay Audio Gate Banner
    audioGateTitle: "குரல் வாசிப்பை இயக்கவும்",
    audioGateDesc: "செய்திகளை உங்களுக்கு சத்தமாக வாசித்துக்காட்ட இங்கே தொடவும்.",
    audioGateButton: "🔊 குரல் உதவியாளரை தொடங்குங்கள்",

    // Welcome Screen
    welcomeTitle: "வணக்கம்! இன்று உங்களுக்கு என்ன மளிகைப் பொருட்கள் வேண்டும்?",
    welcomeSubtitle: "கீழே நீங்கள் வாங்க வேண்டியதை தட்டச்சு செய்யலாம் அல்லது பெரிய பச்சை மைக் பொத்தானைத் தொட்டு தமிழில் பேசலாம்.",
    quickSuggestionsTitle: "மாதிரி கோரிக்கைகள் (தொட்டு ஆர்டர் செய்யுங்கள்):",
    starterPrompts: [
      { label: "🧅 1 கிலோ வெங்காயம் ஆர்டர் செய்", text: "1 கிலோ புதிய வெங்காயம் ஆர்டர் செய்" },
      { label: "🥛 2 பாக்கெட் பால் வேண்டும்", text: "எனக்கு 2 பாக்கெட் பால் வேண்டும்" },
      { label: "🍞 கோதுமை ரொட்டி மற்றும் வெண்ணெய்", text: "1 பாக்கெட் கோதுமை ரொட்டி மற்றும் வெண்ணெய் ஆர்டர் செய்" },
      { label: "🍎 1 கிலோ ஆப்பிள்", text: "1 கிலோ சிம்லா ஆப்பிள் ஆர்டர் செய்" },
    ],

    // Chat Message Actions & Badges
    searchingBadge: "மளிகை கடைகளில் தேடப்படுகிறது...",
    cartUpdatedBadge: "பொருட்கள் வண்டியில் சேர்க்கப்பட்டது",
    otpRequiredBadge: "செயல் தேவை: சரிபார்ப்பு குறியீடு",
    orderConfirmedBadge: "ஆர்டர் உறுதி செய்யப்பட்டது",
    listenButton: "கேளுங்கள்",
    readingButton: "வாசிக்கிறது...",
    justNow: "இப்போது",

    // Input Area
    inputPlaceholder: "நீங்கள் வாங்க வேண்டியதை தட்டச்சு செய்க (எ.கா: 1 கிலோ வெங்காயம்)...",
    inputOtpPlaceholder: "4 இலக்க அல்லது 6 இலக்க OTP குறியீட்டை இங்கே உள்ளிடவும்...",
    inputBotThinkingPlaceholder: "உதவியாளர் உங்கள் கோரிக்கையை செயல்படுத்துகிறார்...",
    micButtonTitle: "உதவியாளரிடம் தமிழில் பேசுங்கள்",
    micStopTitle: "குரல் பதிவை நிறுத்தவும்",
    micUnsupported: "குரல் வழி தட்டச்சு செய்வதற்கு Google Chrome அல்லது Edge உலாவி தேவை.",
    listeningBanner: "உங்கள் குரலை கேட்கிறது... இப்போது பேசுங்கள்!",
    doneSpeaking: "பேசி முடிந்தது",
    sendButton: "அனுப்பு",
    botThinkingStatus: "உதவியாளர் கடைகளில் தேடி உங்கள் வண்டியை புதுப்பிக்கிறார்... காத்திருக்கவும்.",
    otpNoticeText: "செயல் தேவை: உங்கள் மொபைலுக்கு வந்த OTP சரிபார்ப்பு எண்ணை உள்ளிடவும்.",
    openBigKeypad: "பெரிய விசைப்பலகை",

    // OTP Modal
    otpModalTitle: "சரிபார்ப்பு குறியீடு (OTP)",
    otpModalSubtitle: "கட்டண பாதுகாப்பு சரிபார்ப்பு",
    otpDefaultPrompt: "உங்கள் மொபைல் எண்ணிற்கு அனுப்பப்பட்ட 4 இலக்க சரிபார்ப்புக் குறியீட்டை உள்ளிடவும்.",
    otpConfirmButton: "உறுதிசெய்து ஆர்டர் செய்யவும்",
    clearKey: "அழி",

    // Connection Banner
    disconnectedTitle: "⚠️ சர்வர் இணைப்பு துண்டிக்கப்பட்டது",
    connectingTitle: "சர்வரோடு இணைக்கப்படுகிறது...",
    reconnectingDesc: "மீண்டும் இணைக்க முயற்சிக்கிறது",
    disconnectedDesc: "FastAPI WebSocket ws://localhost:8000/ws இல் செயல்படவில்லை",
    retryConnection: "மீண்டும் இணைக்கவும்",
    useDemoMode: "ஆஃப்லைன் டெமோ பயன்முறையை பயன்படுத்து",

    // Accessibility Modal
    a11yTitle: "எல்டர்ஈஸ் அணுகல் அம்சங்கள்",
    a11ySubtitle: "முதியோர்கள் மற்றும் பார்வை குறைபாடுள்ளவர்களுக்காக வடிவமைக்கப்பட்டது (WCAG 2.1 AAA)",
    a11yClose: "புரிந்தது, ஷாப்பிங் தொடரவும்",
  },
};
