"""
ElderEase Internationalization (i18n) Module
=============================================
Provides seamless English ↔ Tamil translation for the agent backend.

Architecture:
  - All internal processing (LLM prompts, web agent, commands) runs in ENGLISH.
  - User-facing messages are translated to Tamil when `lang == "ta"`.
  - User input in Tamil is translated to English before internal processing.
  - Static messages use a pre-built dictionary (zero latency).
  - Dynamic/unknown text is translated via Google's direct endpoint (requests).
"""

import logging
import time
import requests

logger = logging.getLogger("ElderEase-i18n")

# ==========================================
# STATIC MESSAGE DICTIONARY
# ==========================================
# Keys are English strings; values are Tamil translations.
# This covers every bot-facing message in the agent pipeline.

MESSAGES = {
    # --- Stage 1 & 2: Clarification & Command Drafting ---
    "🧠 Agent is thinking about what to ask...":
        "🧠 உதவியாளர் உங்கள் விருப்பங்களை ஆய்வு செய்கிறார்...",
    "📝 Drafting final command for the Web execution agent...":
        "📝 இணைய முகவருக்கான கட்டளையை உருவாக்குகிறது...",
    "*(You can reply by speaking or typing)*":
        "*(நீங்கள் தமிழில் பேசலாம் அல்லது தட்டச்சு செய்யலாம்)*",

    # --- Web Agent Status Messages ---
    "✅ Got it! Resuming task...":
        "✅ புரிந்தது! பணியை தொடர்கிறோம்...",
    "✅ Address received! Resuming task...":
        "✅ முகவரி பெறப்பட்டது! பணியை தொடர்கிறோம்...",
    "No search results found or parsed.":
        "தேடல் முடிவுகள் கிடைக்கவில்லை.",
    "Could not find the Add button for this product. Please try selecting again.":
        "இந்தப் பொருளுக்கான சேர் பொத்தானைக் கண்டுபிடிக்க முடியவில்லை. மீண்டும் முயற்சிக்கவும்.",

    # --- Phone / OTP ---
    "📱 **Phone Number Required:** Please confirm your mobile number to proceed with login:":
        "📱 **தொலைபேசி எண் தேவை:** உள்நுழைய உங்கள் மொபைல் எண்ணை உறுதிப்படுத்தவும்:",
    "🔐 **OTP Verification Required:** Blinkit sent an SMS code to your phone. Enter the code using the Big Keypad:":
        "🔐 **OTP சரிபார்ப்பு தேவை:** உங்கள் தொலைபேசிக்கு அனுப்பப்பட்ட SMS குறியீட்டை பெரிய கீபேடில் உள்ளிடவும்:",
    "Please enter the OTP sent to your phone:":
        "உங்கள் தொலைபேசிக்கு அனுப்பப்பட்ட OTP ஐ உள்ளிடவும்:",

    # --- Address ---
    "📍 **Delivery Address Required:** Please enter your full delivery address:":
        "📍 **டெலிவரி முகவரி தேவை:** உங்கள் முழு டெலிவரி முகவரியை உள்ளிடவும்:",

    # --- Product Selection ---
    "🛒 **Top Search Results:** Which item would you like to add? Tap an item or tell me the number:":
        "🛒 **சிறந்த தேடல் முடிவுகள்:** நீங்கள் எதை சேர்க்க விரும்புகிறீர்கள்? ஒரு பொருளைத் தட்டவும் அல்லது எண்ணைக் கூறவும்:",

    # --- Purchase Confirmation ---
    "ORDER CONFIRMED!":
        "ஆர்டர் வெற்றிகரமாக செய்யப்பட்டது!",
    "Order cancelled.":
        "ஆர்டர் ரத்து செய்யப்பட்டது.",
    "🛒 **Please Confirm Your Order**":
        "🛒 **ஆர்டரை உறுதிசெய்யவும்**",
    "Would you like to proceed? Reply 'yes' to confirm or 'no' to cancel.":
        "இதை உறுதிசெய்கிறீர்களா? 'ஆம்' அல்லது 'இல்லை' என்று பதிலளிக்கவும்.",

    # --- Max Steps / Errors ---
    "⚠️ **Maximum steps reached.** The agent could not complete the order within 25 steps. No order has been placed. Please try again with a simpler request.":
        "⚠️ **அதிகபட்ச படிகள் எட்டப்பட்டது.** 25 படிகளுக்குள் ஆர்டரை முடிக்க முடியவில்லை. ஆர்டர் செய்யப்படவில்லை.",
    "Playwright is not available to run the agent.":
        "ஏஜென்ட் இயக்க Playwright கிடைக்கவில்லை.",

    # --- Multi-Item Shopping Flow ---
    "🧠 Analyzing your shopping list...":
        "🧠 உங்கள் ஷாப்பிங் பட்டியலை ஆய்வு செய்கிறது...",
    "I have added your items to the cart. Would you like to add anything else, or proceed to checkout?":
        "பொருட்கள் கூடையில் சேர்க்கப்பட்டன. மேலும் பொருட்கள் சேர்க்க வேண்டுமா அல்லது ஆர்டர் செய்யலாமா?",
    "✅ Got it! Adding more items to your cart...":
        "✅ புரிந்தது! மேலும் பொருட்களை கூடையில் சேர்க்கிறோம்...",
    "✅ Proceeding to checkout...":
        "✅ ஆர்டர் செய்யப் போகிறோம்...",
    "Item added to cart successfully.":
        "பொருள் வெற்றிகரமாக கூடையில் சேர்க்கப்பட்டது.",
}

# ==========================================
# IN-MEMORY TRANSLATION CACHE
# ==========================================
# Keyed by (text, target_lang) so identical text is never translated twice.
_translation_cache: dict = {}


def _translate(text: str, source: str, target: str) -> str:
    """
    Translates text using Google's direct lightweight endpoint (Option 1).
    No local LLM / VRAM required. Caches results to avoid duplicate requests.
    """
    text = text.strip()
    if not text:
        return ""

    cache_key = (text, target)
    if cache_key in _translation_cache:
        return _translation_cache[cache_key]

    url = "https://translate.googleapis.com/translate_a/single"
    params = {
        "client": "gtx",
        "sl": source,
        "tl": target,
        "dt": "t",
        "q": text,
    }
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36"
    }

    try:
        time.sleep(0.1)  # Gentle throttle
        response = requests.get(url, params=params, headers=headers, timeout=6)
        
        if response.status_code == 200:
            data = response.json()
            # Google returns an array of segments in data[0]
            if data and data[0]:
                translated = "".join(segment[0] for segment in data[0] if segment and segment[0])
                if translated:
                    _translation_cache[cache_key] = translated
                    return translated
        else:
            logger.warning("Google translation HTTP error (%s -> %s): Status %s", source, target, response.status_code)
    except Exception as e:
        logger.warning("Translation request failed (%s -> %s): %s", source, target, e)

    return text


def t(text: str, lang: str) -> str:
    """
    Translate a known static message.
    Returns Tamil if lang == "ta" and a translation exists,
    otherwise returns the original English text.
    """
    if lang == "ta" and text in MESSAGES:
        return MESSAGES[text]
    return text


def localize_message(text: str, lang: str, llm_client=None, model_name: str = "") -> str:
    """
    Translate an English message to the user's language.
    1. If exact match in static dictionary → instant return (zero latency).
    2. Otherwise → send directly to the Google Translate endpoint.
    """
    if lang != "ta":
        return text

    # Try static dictionary first (instant, 0 latency)
    static = MESSAGES.get(text)
    if static:
        return static

    # Fallback to direct dynamic translation
    return _translate(text, source='en', target='ta')


def to_english(text: str, lang: str, llm_client=None, model_name: str = "") -> str:
    """
    Translate user input to English if it's in Tamil.
    Used to normalize user input before internal processing.
    """
    if lang != "ta":
        return text

    if not text.strip():
        return text

    # Check if text is already mostly ASCII (likely English)
    ascii_ratio = sum(1 for c in text if ord(c) < 128) / max(len(text), 1)
    if ascii_ratio > 0.8:
        return text  # Already in English, don't translate

    # Translate Tamil back to English
    return _translate(text, source='ta', target='en')