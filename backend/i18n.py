"""
ElderEase Internationalization (i18n) Module
=============================================
Provides seamless English ↔ Tamil translation for the agent backend.

Architecture:
  - All internal processing (LLM prompts, web agent, commands) runs in ENGLISH.
  - User-facing messages are translated to Tamil when `lang == "ta"`.
  - User input in Tamil is translated to English before internal processing.
  - Static messages use a pre-built dictionary (zero latency).
  - Dynamic/unknown text falls back to LLM-based translation.
"""

import logging
import re

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
}


def t(text: str, lang: str) -> str:
    """
    Translate a known static message.
    Returns Tamil if lang == "ta" and a translation exists,
    otherwise returns the original English text.
    """
    if lang == "ta" and text in MESSAGES:
        return MESSAGES[text]
    return text


def translate_dynamic(text: str, target_lang: str, llm_client=None, model_name: str = "") -> str:
    """
    Translate dynamic/unknown text using the LLM.
    Used for LLM-generated questions, status messages, and summaries
    that aren't in the static dictionary.

    Args:
        text: The text to translate.
        target_lang: "ta" for Tamil, "en" for English.
        llm_client: An OpenAI-compatible client instance.
        model_name: The model to use for translation.

    Returns:
        Translated text, or the original if translation fails.
    """
    if target_lang == "en":
        # Already in English or translating to English
        direction = "Tamil to English"
        instruction = "Translate the following Tamil text to simple English. Return ONLY the translated text, nothing else."
    elif target_lang == "ta":
        direction = "English to Tamil"
        instruction = "Translate the following English text to Tamil (தமிழ்). Use simple, everyday Tamil that elderly people can understand. Return ONLY the translated text, nothing else."
    else:
        return text

    if not llm_client:
        return text

    try:
        response = llm_client.chat.completions.create(
            model=model_name,
            messages=[
                {"role": "system", "content": instruction},
                {"role": "user", "content": text}
            ],
            temperature=0.3,
        )
        result = response.choices[0].message.content.strip()
        # Strip any <think> tags from reasoning models
        result = re.sub(r'<think>.*?</think>', '', result, flags=re.DOTALL).strip()
        if result:
            return result
    except Exception as e:
        logger.warning("LLM translation failed (%s): %s", direction, e)

    return text


def localize_message(text: str, lang: str, llm_client=None, model_name: str = "") -> str:
    """
    Smart message localization: tries static dictionary first,
    falls back to LLM translation for unknown dynamic text.
    """
    if lang != "ta":
        return text

    # Try static dictionary first (instant, free)
    static = MESSAGES.get(text)
    if static:
        return static

    # Fall back to LLM translation for dynamic text
    if llm_client:
        return translate_dynamic(text, "ta", llm_client, model_name)

    return text


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

    if llm_client:
        return translate_dynamic(text, "en", llm_client, model_name)

    return text
