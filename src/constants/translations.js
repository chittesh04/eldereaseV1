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
    quickSuggestionsTitle: "Select a store to start shopping:",
    starterPrompts: [
      { label: "🛒 Blinkit", text: "Shop on Blinkit" },
      { label: "🛒 Zepto", text: "Shop on Zepto" },
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

    // Product Selection
    productListHeading: "Tap an item or say the number (1-5):",
    itemsFound: "items found",
    priceLabel: "Price:",
    addButton: "Add",
    productRegionLabel: "Product search results",

    // Visual Agent Steps
    visualAgentStep: "Visual Agent Live Step",
    commandDispatched: "Command Dispatched to Web Agent",
    phoneVerificationRequired: "Phone Verification Required",

    // Purchase Confirmation
    confirmOrderTitle: "Confirm Your Order",
    confirmOrderSubtitle: "Please review before placing the order",
    confirmOrderWarning: "This action cannot be undone. Once confirmed, the order will be placed and payment will be processed.",
    confirmButton: "Place Order",
    cancelButton: "Cancel",
    orderCancelled: "Order cancelled.",

    // Multi-Item Cart
    shoppingItem: "Shopping Item",
    ofTotal: "of",
    cartSummaryTitle: "Your Cart",
    addMoreItems: "🛒 Add More Items",
    proceedCheckout: "✅ Proceed to Checkout",
    addMoreOrCheckoutTitle: "What would you like to do?",
    addMoreOrCheckoutSubtitle: "Your items are in the cart. Add more or checkout?",
    addMoreInputPlaceholder: "Type items to add (e.g., eggs, butter)...",
    itemAddedToCart: "Item added to cart!",
    queueProgressLabel: "Queue Progress",

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
    quickSuggestionsTitle: "கடையை தேர்ந்தெடுக்கவும்:",
    starterPrompts: [
      { label: "🛒 Blinkit", text: "Blinkit இல் ஷாப்பிங் செய்" },
      { label: "🛒 Zepto", text: "Zepto இல் ஷாப்பிங் செய்" },
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

    // Product Selection
    productListHeading: "தேர்ந்தெடுக்க வேண்டிய பொருள் (1-5):",
    itemsFound: "பொருட்கள்",
    priceLabel: "விலை:",
    addButton: "சேர்",
    productRegionLabel: "தயாரிப்பு பட்டியல்",

    // Visual Agent Steps
    visualAgentStep: "உதவியாளர் நேரடி படி",
    commandDispatched: "கட்டளை அனுப்பப்பட்டது",
    phoneVerificationRequired: "தொலைபேசி சரிபார்ப்பு தேவை",

    // Purchase Confirmation
    confirmOrderTitle: "ஆர்டரை உறுதிசெய்யவும்",
    confirmOrderSubtitle: "ஆர்டரை செய்ய முன்பு சரிபார்க்கவும்",
    confirmOrderWarning: "இது ஒரு மீள முடியாத செயல். உறுதிசெய்த பிறகு ஆர்டர் செய்யப்பட்டு கட்டணம் செலுத்தப்படும்.",
    confirmButton: "ஆர்டர் செய்",
    cancelButton: "ரத்து செய்",
    orderCancelled: "ஆர்டர் ரத்து செய்யப்பட்டது.",

    // Multi-Item Cart
    shoppingItem: "பொருள் ஷாப்பிங்",
    ofTotal: "இல்",
    cartSummaryTitle: "உங்கள் கூடை",
    addMoreItems: "🛒 மேலும் பொருட்கள் சேர்",
    proceedCheckout: "✅ ஆர்டர் செய்",
    addMoreOrCheckoutTitle: "என்ன செய்ய விரும்புகிறீர்கள்?",
    addMoreOrCheckoutSubtitle: "பொருட்கள் கூடையில் உள்ளன. மேலும் சேர்க்கலாமா அல்லது ஆர்டர் செய்யலாமா?",
    addMoreInputPlaceholder: "சேர்க்க வேண்டிய பொருட்களை தட்டச்சு செய்யவும்...",
    itemAddedToCart: "பொருள் கூடையில் சேர்க்கப்பட்டது!",
    queueProgressLabel: "கூடை முன்னேற்றம்",

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
