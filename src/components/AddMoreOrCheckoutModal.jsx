import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ShoppingCart,
  Plus,
  CheckCircle2,
  PackageCheck,
  Mic,
  MicOff,
  ArrowLeft,
  Sparkles,
  Volume2,
  VolumeX,
  PartyPopper,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { SpeakButton, speakGlobal, stopAllSpeech } from './SpeakButton';
import { translations } from '../constants/translations';
import { findLocalizedNameFromMessages, fetchTamilTranslation } from '../utils/translator';

/**
 * Comprehensive Tamil grocery terms dictionary for fallback localization
 */
export const TAMIL_GROCERY_DICTIONARY = {
  // Multi-word phrases (matched first)
  'organically grown sambar onion': 'இயற்கை முறையில் விளைந்த சாம்பார் வெங்காயம்',
  'organically grown sambar onions': 'இயற்கை முறையில் விளைந்த சாம்பார் வெங்காயம்',
  'organically grown sambar': 'இயற்கை முறையில் விளைந்த சாம்பார் வெங்காயம்',
  'organic sambar onion': 'இயற்கை முறையில் விளைந்த சாம்பார் வெங்காயம்',
  'organic sambar onions': 'இயற்கை முறையில் விளைந்த சாம்பார் வெங்காயம்',
  'sambar onion': 'சாம்பார் வெங்காயம்',
  'sambar onions': 'சாம்பார் வெங்காயம்',
  'small onion': 'சின்ன வெங்காயம்',
  'small onions': 'சின்ன வெங்காயம்',
  'shallot': 'சின்ன வெங்காயம்',
  'shallots': 'சின்ன வெங்காயம்',
  'organically grown': 'இயற்கை முறையில் விளைந்த',
  'organically': 'இயற்கை முறையில்',
  'grown': 'விளைந்த',
  'sambar': 'சாம்பார்',
  'green chilli': 'பச்சை மிளகாய்',
  'green chilies': 'பச்சை மிளகாய்',
  'green chillies': 'பச்சை மிளகாய்',
  'curry leaves': 'கறிவேப்பிலை',
  'bell pepper': 'குடைமிளகாய்',
  'lady finger': 'வெண்டைக்காய்',
  'lady fingers': 'வெண்டைக்காய்',
  'cottage cheese': 'பன்னீர்',
  'brown bread': 'பிரவுன் பிரெட்',
  'wheat bread': 'கோதுமை பிரெட்',
  'white bread': 'வெள்ளை பிரெட்',
  'wheat flour': 'கோதுமை மாவு',
  'all purpose flour': 'மைதா',
  'sunflower oil': 'சூரியகாந்தி எண்ணெய்',
  'groundnut oil': 'கடலை எண்ணெய்',
  'sesame oil': 'நல்லெண்ணெய்',
  'gingelly oil': 'நல்லெண்ணெய்',
  'coconut oil': 'தேங்காய் எண்ணெய்',
  'cooking oil': 'சமையல் எண்ணெய்',
  'mustard oil': 'கடுகு எண்ணெய்',
  'black pepper': 'கருப்பு மிளகு',
  'chilli powder': 'மிளகாய் தூள்',
  'turmeric powder': 'மஞ்சள் தூள்',
  'sambar powder': 'சாம்பார் பொடி',
  'coriander powder': 'மல்லித் தூள்',
  'toor dal': 'துவரம் பருப்பு',
  'arhar dal': 'துவரம் பருப்பு',
  'tuvaram paruppu': 'துவரம் பருப்பு',
  'moong dal': 'பாசிப் பருப்பு',
  'paasi paruppu': 'பாசிப் பருப்பு',
  'urad dal': 'உளுந்தம் பருப்பு',
  'ulundham paruppu': 'உளுந்தம் பருப்பு',
  'chana dal': 'கடலைப் பருப்பு',
  'kadalai paruppu': 'கடலைப் பருப்பு',
  'basmati rice': 'பாசுமதி அரிசி',
  'mineral water': 'தண்ணீர் பாட்டில்',
  'drinking water': 'குடிநீர்',
  'potato chips': 'உருளைக்கிழங்கு சிப்ஸ்',
  'tata salt': 'டாடா உப்பு',
  'tata tea': 'டாடா டீ',
  'surf excel': 'சர்ஃப் எக்செல்',
  'full cream': 'ஃபுல் க்ரீம்',
  'toned milk': 'டோன்ட் பால்',
  'full cream milk': 'ஃபுல் க்ரீம் பால்',
  'tea powder': 'தேயிலைத் தூள்',
  'coffee powder': 'காபித்தூள்',
  // Vegetables
  'onion': 'வெங்காயம்',
  'onions': 'வெங்காயம்',
  'pyaz': 'வெங்காயம்',
  'potato': 'உருளைக்கிழங்கு',
  'potatoes': 'உருளைக்கிழங்கு',
  'aloo': 'உருளைக்கிழங்கு',
  'tomato': 'தக்காளி',
  'tomatoes': 'தக்காளி',
  'tamatar': 'தக்காளி',
  'garlic': 'பூண்டு',
  'lahsun': 'பூண்டு',
  'ginger': 'இஞ்சி',
  'adrak': 'இஞ்சி',
  'chilli': 'மிளகாய்',
  'chillies': 'மிளகாய்',
  'chilies': 'மிளகாய்',
  'mirchi': 'மிளகாய்',
  'coriander': 'கொத்தமல்லி',
  'dhania': 'கொத்தமல்லி',
  'kothamalli': 'கொத்தமல்லி',
  'mint': 'புதினா',
  'pudina': 'புதினா',
  'carrot': 'கேரட்',
  'carrots': 'கேரட்',
  'beans': 'பீன்ஸ்',
  'cabbage': 'முட்டைக்கோஸ்',
  'cauliflower': 'காலிஃபிளவர்',
  'capsicum': 'குடைமிளகாய்',
  'brinjal': 'கத்தரிக்காய்',
  'eggplant': 'கத்தரிக்காய்',
  'baingan': 'கத்தரிக்காய்',
  'okra': 'வெண்டைக்காய்',
  'bhindi': 'வெண்டைக்காய்',
  'cucumber': 'வெள்ளரிக்காய்',
  'kheera': 'வெள்ளரிக்காய்',
  'lemon': 'எலுமிச்சை',
  'nimbu': 'எலுமிச்சை',
  'mushroom': 'காளான்',
  'mushrooms': 'காளான்',
  'spinach': 'கீரை',
  'palak': 'கீரை',
  'keerai': 'கீரை',
  'beetroot': 'பீட்ரூட்',
  'radish': 'முள்ளங்கி',
  'mooli': 'முள்ளங்கி',
  'drumstick': 'முருங்கைக்காய்',
  // Fruits
  'apple': 'ஆப்பிள்',
  'apples': 'ஆப்பிள்',
  'seb': 'ஆப்பிள்',
  'banana': 'வாழைப்பழம்',
  'bananas': 'வாழைப்பழம்',
  'kela': 'வாழைப்பழம்',
  'orange': 'ஆரஞ்சு',
  'oranges': 'ஆரஞ்சு',
  'santra': 'ஆரஞ்சு',
  'pomegranate': 'மாதுளை',
  'anar': 'மாதுளை',
  'mango': 'மாம்பழம்',
  'mangoes': 'மாம்பழம்',
  'aam': 'மாம்பழம்',
  'grapes': 'திராட்சை',
  'papaya': 'பப்பாளி',
  'watermelon': 'தர்பூசணி',
  'guava': 'கொய்யாப்பழம்',
  'coconut': 'தேங்காய்',
  // Dairy & Bakery
  'milk': 'பால்',
  'doodh': 'பால்',
  'curd': 'தயிர்',
  'dahi': 'தயிர்',
  'yogurt': 'தயிர்',
  'paneer': 'பன்னீர்',
  'butter': 'வெண்ணெய்',
  'makkhan': 'வெண்ணெய்',
  'ghee': 'நெய்',
  'cheese': 'சீஸ்',
  'bread': 'பிரெட்',
  'egg': 'முட்டை',
  'eggs': 'முட்டை',
  'ande': 'முட்டை',
  'rusk': 'ரஸ்க்',
  'pav': 'பன்',
  'bun': 'பன்',
  // Staples & Grains
  'rice': 'அரிசி',
  'chawal': 'அரிசி',
  'atta': 'கோதுமை மாவு',
  'maida': 'மைதா',
  'rava': 'ரவை',
  'sooji': 'ரவை',
  'semolina': 'ரவை',
  'besan': 'கடலை மாவு',
  'sugar': 'சர்க்கரை',
  'chini': 'சர்க்கரை',
  'salt': 'உப்பு',
  'namak': 'உப்பு',
  'oil': 'எண்ணெய்',
  'tel': 'எண்ணெய்',
  'mustard': 'கடுகு',
  'kadugu': 'கடுகு',
  'cumin': 'சீரகம்',
  'jeera': 'சீரகம்',
  'seeragam': 'சீரகம்',
  'pepper': 'மிளகு',
  'milagu': 'மிளகு',
  'turmeric': 'மஞ்சள்',
  'haldi': 'மஞ்சள்',
  'manjal': 'மஞ்சள்',
  'dal': 'பருப்பு',
  'paruppu': 'பருப்பு',
  'tea': 'டீ',
  'chai': 'டீ',
  'coffee': 'காபி',
  // Snacks & Packaged
  'biscuit': 'பிஸ்கட்',
  'biscuits': 'பிஸ்கட்',
  'cookies': 'பிஸ்கட்',
  'kurkure': 'குர்குரே',
  'lays': 'லேஸ் சிப்ஸ்',
  'chips': 'சிப்ஸ்',
  'noodles': 'நூடுல்ஸ்',
  'maggi': 'மேகி நூடுல்ஸ்',
  'pasta': 'பாஸ்தா',
  'oats': 'ஓட்ஸ்',
  'chocolate': 'சாக்லேட்',
  'chocolates': 'சாக்லேட்',
  'juice': 'பழச்சாறு',
  'water': 'தண்ணீர்',
  'soda': 'சோடா',
  // Brands
  'aavin': 'ஆவின்',
  'amul': 'அமுல்',
  'nandini': 'நந்தினி',
  'britannia': 'பிரிட்டானியா',
  'parle': 'பார்லே',
  'fortune': 'ஃபார்ச்சூன்',
  'aashirvaad': 'ஆசீர்வாத்',
  'saffola': 'சஃபோலா',
  'dettol': 'டெட்டால்',
  'colgate': 'கோல்கேட்',
  // Descriptors
  'fresh': 'புதிய',
  'organic': 'இயற்கை',
  'pure': 'தூய',
  'premium': 'பிரீமியம்',
  'packet': 'பாக்கெட்',
  'pouch': 'பாக்கெட்',
  'bottle': 'பாட்டில்',
  'box': 'பாக்ஸ்',
  'can': 'கேன்',
};

/**
 * Returns Tamil localized name for a cart item using:
 * 1. item.name_localized (if provided by backend)
 * 2. Top-5 suggestion cards from previous messages history
 * 3. Dynamic runtime Google Translate cache
 * 4. Comprehensive client-side Tamil dictionary
 */
export function getLocalizedItemName(item, lang = 'en', messages = [], dynamicOverrides = {}) {
  if (!item) return '';
  const rawName = item.name || '';
  if (lang !== 'ta') return rawName;

  // 1. If backend already provided localized Tamil name, use it!
  const localized = item.name_localized;
  if (localized && typeof localized === 'string' && /[\u0B80-\u0BFF]/.test(localized)) {
    return localized.trim();
  }

  // 2. Check dynamic runtime translation cache
  if (dynamicOverrides && dynamicOverrides[rawName]) {
    return dynamicOverrides[rawName];
  }

  // 3. Match against the top 5 suggestion cards from previous chat messages
  if (messages && messages.length > 0) {
    const fromHistory = findLocalizedNameFromMessages(rawName, messages);
    if (fromHistory) {
      return fromHistory;
    }
  }

  // 4. Client-side dictionary replacement fallback
  let translated = rawName;
  const keys = Object.keys(TAMIL_GROCERY_DICTIONARY).sort((a, b) => b.length - a.length);
  for (const enWord of keys) {
    const taWord = TAMIL_GROCERY_DICTIONARY[enWord];
    const regex = new RegExp(`\\b${enWord}\\b`, 'gi');
    translated = translated.replace(regex, taWord);
  }
  return translated;
}

/**
 * Converts English weight and count units to Tamil
 */
export function getLocalizedWeight(weight, lang = 'en') {
  if (!weight) return '';
  const str = String(weight).trim();
  if (lang !== 'ta') return str;

  return str
    .replace(/(\d+(?:\.\d+)?)\s*(?:kg|kgs|kilogram|kilograms)\b/gi, '$1 கிலோ')
    .replace(/(\d+(?:\.\d+)?)\s*(?:g|gm|gms|gram|grams)\b/gi, '$1 கிராம்')
    .replace(/(\d+(?:\.\d+)?)\s*(?:ml|millilitre|milliliters)\b/gi, '$1 மி.லி')
    .replace(/(\d+(?:\.\d+)?)\s*(?:l|ltr|liter|liters|litre|litres)\b/gi, '$1 லிட்டர்')
    .replace(/(\d+)\s*(?:pcs|pieces|pc|piece)\b/gi, '$1 எண்ணிக்கை')
    .replace(/(\d+)\s*(?:pack|packs|packet|packets)\b/gi, '$1 பாக்கெட்')
    .replace(/\bkg\b/gi, 'கிலோ')
    .replace(/\bgm?\b/gi, 'கிராம்')
    .replace(/\bml\b/gi, 'மி.லி')
    .replace(/\bltr?\b/gi, 'லிட்டர்')
    .replace(/\bpcs?\b/gi, 'எண்ணிக்கை')
    .replace(/\bpack\b/gi, 'பாக்கெட்');
}

/**
 * AddMoreOrCheckoutModal — Elderly-first, high-contrast decision boundary
 * with Text-to-Speech (TTS) audio readout AND built-in Simulated Order Success
 * screen for safe college project demonstrations (no real money charged).
 */
export function AddMoreOrCheckoutModal({
  lang = 'en',
  isOpen,
  cartSummary = [],
  messages = [],
  onCheckout,
  onAddMore,
  isHighContrast,
}) {
  const t = translations[lang] || translations.en;
  const [addMoreText, setAddMoreText] = useState('');
  const [showAddMoreInput, setShowAddMoreInput] = useState(false);
  const [isOrderSuccess, setIsOrderSuccess] = useState(false);
  const [fakeOrderId, setFakeOrderId] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [dynamicTranslations, setDynamicTranslations] = useState({});
  const recognitionRef = useRef(null);
  const baseTextRef = useRef('');
  const micStartTimeoutRef = useRef(null);
  const wasOpenRef = useRef(false);

  // Background runtime translation to guarantee 100% Tamil translation (same as top 5 suggestions)
  useEffect(() => {
    if (lang !== 'ta' || !cartSummary || cartSummary.length === 0) return;

    let isMounted = true;
    cartSummary.forEach(async (item) => {
      const name = item.name;
      if (!name) return;

      // 1. Check if item has name_localized already
      if (item.name_localized && /[\u0B80-\u0BFF]/.test(item.name_localized)) return;

      // 2. Check if messages history has it
      const fromHistory = findLocalizedNameFromMessages(name, messages);
      if (fromHistory) {
        if (isMounted) {
          setDynamicTranslations((prev) => (prev[name] === fromHistory ? prev : { ...prev, [name]: fromHistory }));
        }
        return;
      }

      // 3. Fetch from Google Translate endpoint (same endpoint used in i18n.py)
      try {
        const translated = await fetchTamilTranslation(name);
        if (isMounted && translated && /[\u0B80-\u0BFF]/.test(translated)) {
          setDynamicTranslations((prev) => (prev[name] === translated ? prev : { ...prev, [name]: translated }));
        }
      } catch (_) {}
    });

    return () => {
      isMounted = false;
    };
  }, [cartSummary, lang, messages]);

  // Resolves the Tamil item name using all 4 layers
  const resolveItemName = useCallback(
    (item) => getLocalizedItemName(item, lang, messages, dynamicTranslations),
    [lang, messages, dynamicTranslations]
  );

  // Calculate total item count and estimated price
  const totalUnits = cartSummary.reduce(
    (sum, item) => sum + (Number(item.qty) || 1),
    0
  );
  const estimatedTotal = cartSummary.reduce((sum, item) => {
    const rawPrice = String(item.price || '').replace(/[^0-9.]/g, '');
    const numericPrice = parseFloat(rawPrice);
    if (!isNaN(numericPrice)) {
      return sum + numericPrice * (Number(item.qty) || 1);
    }
    return sum;
  }, 0);

  // Speak any text aloud using unified global speech manager
  const speakText = useCallback(
    (textToSpeak, id = 'modal-cart-summary') => {
      speakGlobal(textToSpeak, lang, id);
    },
    [lang]
  );

  // Build natural spoken summary for visually impaired users
  const buildSpokenSummary = useCallback(() => {
    if (isOrderSuccess) {
      if (lang === 'ta') {
        return `வாழ்த்துக்கள்! உங்கள் ஆர்டர் வெற்றிகரமாக பதிவு செய்யப்பட்டது. ஆர்டர் எண் ${fakeOrderId}. மொத்தப் பொருட்கள் ${totalUnits}.${estimatedTotal > 0 ? ` மொத்தத் தொகை ${estimatedTotal} ரூபாய்.` : ''
          } உங்கள் பொருட்கள் 10 நிமிடங்களில் வீட்டிற்கு வந்து சேரும்.`;
      }
      return `Congratulations! Your order has been placed successfully. Order ID ${fakeOrderId}. Total items: ${totalUnits}.${estimatedTotal > 0 ? ` Total amount: ${estimatedTotal} rupees.` : ''
        } Your groceries will be delivered in 10 minutes.`;
    }

    if (lang === 'ta') {
      const itemsSpeech =
        cartSummary.length > 0
          ? cartSummary
            .map(
              (item, i) => {
                const itemName = resolveItemName(item);
                const itemWeight = getLocalizedWeight(item.weight, 'ta');
                const weightText = itemWeight ? `அளவு ${itemWeight}, ` : '';
                const qtyText = item.qty > 1 ? `${item.qty} எண்ணிக்கை, ` : '';
                const priceText = `விலை ${String(item.price || '').replace('₹', '')} ரூபாய்.`;
                return `பொருள் ${i + 1}: ${itemName}, ${weightText}${qtyText}${priceText}`;
              }
            )
            .join(' ')
          : 'உங்கள் கூடை தயாராக உள்ளது.';
      const totalSpeech =
        estimatedTotal > 0 ? ` மொத்த விலை ${estimatedTotal} ரூபாய்.` : '';
      return `உங்கள் கூடையில் ${totalUnits} பொருட்கள் சேர்க்கப்பட்டுள்ளன. ${itemsSpeech}${totalSpeech} மேலும் பொருட்கள் சேர்க்க வேண்டுமா, அல்லது ஆர்டர் செய்யலாமா?`;
    } else {
      const itemsSpeech =
        cartSummary.length > 0
          ? cartSummary
            .map(
              (item, i) =>
                `Item ${i + 1}: ${item.name}${item.weight ? `, ${item.weight}` : ''
                }${item.qty > 1 ? `, quantity ${item.qty}` : ''}, price ${item.price || 'not available'
                }.`
            )
            .join(' ')
          : 'Your basket is updated.';
      const totalSpeech =
        estimatedTotal > 0
          ? ` Estimated total is ${estimatedTotal} rupees.`
          : '';
      return `You have ${totalUnits} ${totalUnits === 1 ? 'item' : 'items'
        } in your basket. ${itemsSpeech}${totalSpeech} Would you like to proceed to checkout, or add more items?`;
    }
  }, [
    cartSummary,
    estimatedTotal,
    fakeOrderId,
    isOrderSuccess,
    lang,
    totalUnits,
    resolveItemName,
  ]);

  const toggleReadAloud = () => {
    if (!('speechSynthesis' in window)) return;
    if (isSpeaking) {
      stopAllSpeech();
      setIsSpeaking(false);
    } else {
      speakText(buildSpokenSummary());
    }
  };

  // Speak a single item card when its mini speaker button is tapped
  const speakSingleItem = (item, idx) => {
    if (lang === 'ta') {
      const itemName = resolveItemName(item);
      const itemWeight = getLocalizedWeight(item.weight, 'ta');
      speakText(
        `பொருள் ${idx + 1}: ${itemName}. ${itemWeight ? `அளவு ${itemWeight}. ` : ''
        }${item.qty > 1 ? `எண்ணிக்கை ${item.qty}. ` : ''}விலை ${String(
          item.price || ''
        ).replace('₹', '')} ரூபாய்.`
      );
    } else {
      speakText(
        `Item ${idx + 1}: ${item.name}. ${item.weight ? `Weight ${item.weight}. ` : ''
        }${item.qty > 1 ? `Quantity ${item.qty}. ` : ''}Price ${item.price || 'not available'
        }.`
      );
    }
  };

  // Reset state & auto-announce when modal opens
  useEffect(() => {
    if (isOpen) {
      wasOpenRef.current = true;
      setAddMoreText('');
      setShowAddMoreInput(false);
      setIsOrderSuccess(false);
      setIsListening(false);
      setFakeOrderId(
        `EE-${Math.floor(100000 + Math.random() * 900000)}`
      );
      const timer = setTimeout(() => {
        speakGlobal(buildSpokenSummary(), lang, 'modal-cart-summary');
      }, 350);
      return () => {
        clearTimeout(timer);
      };
    } else if (wasOpenRef.current) {
      // ONLY stop speech when the modal transitions from open to closed!
      wasOpenRef.current = false;
      stopAllSpeech();
      setIsSpeaking(false);
      if (micStartTimeoutRef.current) {
        clearTimeout(micStartTimeoutRef.current);
        micStartTimeoutRef.current = null;
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (_) { }
      }
      setIsListening(false);
    }
  }, [isOpen]); // Only run when modal open state toggles

  // Ensure unmounting while open cleans up speech, but never while closed
  useEffect(() => {
    return () => {
      if (wasOpenRef.current) {
        wasOpenRef.current = false;
        stopAllSpeech();
      }
      if (micStartTimeoutRef.current) {
        clearTimeout(micStartTimeoutRef.current);
        micStartTimeoutRef.current = null;
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (_) { }
      }
    };
  }, []);

  if (!isOpen && !isOrderSuccess) return null;

  const handleAddMoreSubmit = (e) => {
    if (e) e.preventDefault();
    const trimmed = addMoreText.trim();
    if (trimmed) {
      stopAllSpeech();
      if (micStartTimeoutRef.current) {
        clearTimeout(micStartTimeoutRef.current);
        micStartTimeoutRef.current = null;
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (_) { }
      }
      setIsListening(false);
      onAddMore(trimmed);
    }
  };

  // When user clicks "Proceed to Checkout" -> Notify backend immediately to run Cart -> Phone -> OTP flow!
  const handleCheckoutClick = () => {
    stopAllSpeech();
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (_) { }
    }
    onCheckout();
  };

  // Close the fake order receipt and finish the flow
  const handleFinishOrder = () => {
    stopAllSpeech();
    setIsOrderSuccess(false);
    onCheckout();
  };

  // Built-in voice recognition for "Add More Items" (Exact configuration matching main page)
  const toggleVoiceInput = () => {
    // 1. If currently listening, toggle off
    if (isListening) {
      if (micStartTimeoutRef.current) {
        clearTimeout(micStartTimeoutRef.current);
        micStartTimeoutRef.current = null;
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (_) { }
      }
      setIsListening(false);
      return;
    }

    // 2. Check browser support
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(
        lang === 'ta'
          ? 'உங்கள் உலாவியில் குரல் உள்ளீடு ஆதரிக்கப்படவில்லை. Google Chrome அல்லது Edge உலாவியைப் பயன்படுத்தவும்.'
          : 'Voice input is not supported in this browser. Please use Google Chrome or Microsoft Edge.'
      );
      return;
    }

    // 3. Prevent TTS Speaker Echo: cancel any active speech synthesis
    const wasSpeaking =
      ('speechSynthesis' in window && (window.speechSynthesis.speaking || window.speechSynthesis.pending)) ||
      isSpeaking;
    stopAllSpeech();
    setIsSpeaking(false);

    // Save whatever text is already in the input box before turning mic on
    baseTextRef.current = addMoreText.trim();

    // 4. Clean up any previous recognition instance
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (_) { }
      recognitionRef.current = null;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = lang === 'ta' ? 'ta-IN' : 'en-IN';
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = 0; i < event.results.length; i++) {
        const resultItem = event.results[i];
        const text = resultItem[0]?.transcript || '';
        if (resultItem.isFinal) {
          finalTranscript += text + ' ';
        } else {
          interimTranscript += text;
        }
      }

      const combinedSpoken = (finalTranscript + interimTranscript).trim();
      if (combinedSpoken) {
        if (baseTextRef.current) {
          const separator = baseTextRef.current.endsWith(',') ? ' ' : ', ';
          setAddMoreText(`${baseTextRef.current}${separator}${combinedSpoken}`);
        } else {
          setAddMoreText(combinedSpoken);
        }
      }
    };

    recognition.onerror = (event) => {
      console.warn('Modal speech recognition error:', event.error);
      if (event.error !== 'no-speech') {
        setIsListening(false);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    // Wait 200ms before calling recognition.start() if TTS was speaking to avoid speaker echo
    const delay = wasSpeaking ? 200 : 50;
    if (micStartTimeoutRef.current) {
      clearTimeout(micStartTimeoutRef.current);
    }
    micStartTimeoutRef.current = setTimeout(() => {
      try {
        recognition.start();
      } catch (err) {
        console.warn('Modal speech recognition start failed:', err);
      }
    }, delay);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-more-modal-title"
    >
      <div
        className={`w-full max-w-xl rounded-3xl p-6 sm:p-8 shadow-2xl border-4 transition-all my-auto ${isHighContrast
            ? 'bg-zinc-950 text-yellow-300 border-yellow-400 shadow-yellow-400/10'
            : 'bg-white text-slate-900 border-emerald-500'
          }`}
      >
        {/* ===================================================================== */}
        {/* SCREEN A: FAKE ORDER PLACED SUCCESSFULLY (COLLEGE PROJECT DEMO MODE) */}
        {/* ===================================================================== */}
        {isOrderSuccess ? (
          <div className="text-center space-y-5">
            {/* Top Speaker Row */}
            <div className="flex justify-end">
              <SpeakButton
                text={buildSpokenSummary()}
                lang={lang}
                id="modal-order-success"
                isHighContrast={isHighContrast}
                size="md"
                idleLabel={lang === 'ta' ? 'சத்தமாகக் கேட்க' : 'Listen'}
                activeLabel={lang === 'ta' ? 'நிறுத்து' : 'Stop'}
              />
            </div>

            {/* Celebration Icon */}
            <div
              className={`w-20 h-20 mx-auto rounded-3xl flex items-center justify-center shadow-lg border-4 ${isHighContrast
                  ? 'bg-yellow-400 text-black border-yellow-200'
                  : 'bg-emerald-600 text-white border-emerald-200'
                }`}
            >
              <PartyPopper className="w-11 h-11" />
            </div>

            <div>
              <span
                className={`inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider px-3.5 py-1 rounded-full mb-2 ${isHighContrast
                    ? 'bg-yellow-400/20 text-yellow-300 border border-yellow-400'
                    : 'bg-emerald-100 text-emerald-800'
                  }`}
              >
                <ShieldCheck className="w-4 h-4" />
                {lang === 'ta'
                  ? 'ஆர்டர் உறுதி செய்யப்பட்டது'
                  : 'Order Confirmed (Demo)'}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black">
                {lang === 'ta'
                  ? 'ஆர்டர் வெற்றிகரமாகப் பதிவு செய்யப்பட்டது!'
                  : 'Order Placed Successfully!'}
              </h2>
              <p
                className={`text-base font-bold mt-1 ${isHighContrast ? 'text-yellow-100/90' : 'text-slate-600'
                  }`}
              >
                {lang === 'ta'
                  ? `ஆர்டர் எண்: #${fakeOrderId}`
                  : `Order ID: #${fakeOrderId}`}
              </p>
            </div>

            {/* 10-Minute Delivery ETA Pill */}
            <div
              className={`p-4 rounded-2xl border-2 flex items-center justify-center gap-3 font-black text-lg ${isHighContrast
                  ? 'bg-zinc-900 border-yellow-400 text-yellow-300'
                  : 'bg-amber-50 border-amber-300 text-amber-950'
                }`}
            >
              <Clock className="w-6 h-6 shrink-0" />
              <span>
                {lang === 'ta'
                  ? '⚡ 10 நிமிடங்களில் உங்கள் வீட்டிற்கு டெலிவரி செய்யப்படும்!'
                  : '⚡ Arriving at your doorstep in 10 minutes!'}
              </span>
            </div>

            {/* Final Itemized Receipt */}
            {cartSummary.length > 0 && (
              <div
                className={`text-left rounded-2xl border-2 overflow-hidden ${isHighContrast
                    ? 'bg-zinc-900 border-yellow-400/40'
                    : 'bg-slate-50 border-slate-200'
                  }`}
              >
                <div className="p-3 sm:p-4 max-h-44 overflow-y-auto space-y-2">
                  {cartSummary.map((item, idx) => {
                    const itemName = lang === 'ta' ? resolveItemName(item) : item.name;
                    return (
                      <div
                        key={idx}
                        className="flex justify-between items-center text-base font-extrabold"
                      >
                        <span className="truncate flex-1">
                          ✅ {itemName}
                          {item.qty > 1 ? ` ×${item.qty}` : ''}
                        </span>
                        <span className="ml-3 shrink-0">{item.price || ''}</span>
                      </div>
                    );
                  })}
                </div>
                <div
                  className={`px-4 py-3 flex justify-between items-center border-t font-black text-lg ${isHighContrast
                      ? 'bg-black border-yellow-400/30 text-yellow-300'
                      : 'bg-emerald-50 border-slate-200 text-emerald-950'
                    }`}
                >
                  <span>
                    {lang === 'ta'
                      ? 'மொத்தத் தொகை (Cash on Delivery):'
                      : 'Total Amount (Pay on Delivery):'}
                  </span>
                  <span className="text-xl">
                    {estimatedTotal > 0 ? `₹${estimatedTotal}` : 'Paid'}
                  </span>
                </div>
              </div>
            )}

            {/* Done / Complete Button */}
            <button
              type="button"
              onClick={handleFinishOrder}
              className={`w-full min-h-[64px] py-4 rounded-2xl font-black text-xl flex items-center justify-center gap-3 transition-all shadow-lg border-2 ${isHighContrast
                  ? 'bg-yellow-400 text-black border-yellow-300 hover:bg-yellow-300'
                  : 'bg-emerald-600 text-white border-emerald-700 hover:bg-emerald-700'
                }`}
            >
              <CheckCircle2 className="w-7 h-7" />
              <span>
                {lang === 'ta' ? 'முடிக்கவும் (Done)' : 'Done & Close'}
              </span>
            </button>
          </div>
        ) : (
          /* ===================================================================== */
          /* SCREEN B: ADD MORE OR CHECKOUT DECISION BOUNDARY                      */
          /* ===================================================================== */
          <>
            {/* Top Header Banner with Large Speaker Button */}
            <div
              className={`flex items-start justify-between gap-3 pb-5 border-b-2 ${isHighContrast ? 'border-yellow-400/30' : 'border-slate-200'
                }`}
            >
              <div className="flex items-center gap-4 min-w-0 flex-1">
                <div
                  className={`p-4 rounded-2xl shrink-0 shadow-md ${isHighContrast
                      ? 'bg-yellow-400 text-black'
                      : 'bg-emerald-600 text-white'
                    }`}
                >
                  <ShoppingCart className="w-9 h-9" />
                </div>
                <div className="min-w-0 flex-1">
                  <span
                    className={`inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider px-3 py-1 rounded-full mb-1 ${isHighContrast
                        ? 'bg-yellow-400/20 text-yellow-300 border border-yellow-400'
                        : 'bg-emerald-100 text-emerald-800'
                      }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    {lang === 'ta' ? 'கூடை தயார்' : 'Basket Updated'}
                  </span>
                  <h2
                    id="add-more-modal-title"
                    className="text-2xl sm:text-3xl font-black leading-tight"
                  >
                    {t.addMoreOrCheckoutTitle ||
                      (lang === 'ta'
                        ? 'வேறு பொருட்கள் வேண்டுமா?'
                        : 'Need Anything Else?')}
                  </h2>
                  <p
                    className={`text-base font-semibold mt-0.5 ${isHighContrast ? 'text-yellow-100/90' : 'text-slate-600'
                      }`}
                  >
                    {t.addMoreOrCheckoutSubtitle ||
                      (lang === 'ta'
                        ? 'மேலும் பொருட்களைச் சேர்க்கலாம் அல்லது ஆர்டரை முடிக்கலாம்'
                        : 'Add more items to your basket or proceed to checkout')}
                  </p>
                </div>
              </div>

              {/* Prominent Read-Aloud Speaker Button */}
              <SpeakButton
                text={buildSpokenSummary()}
                lang={lang}
                id="modal-cart-summary"
                isHighContrast={isHighContrast}
                size="md"
                idleLabel={lang === 'ta' ? 'கேட்க' : 'Listen'}
                activeLabel={lang === 'ta' ? 'நிறுத்து' : 'Stop'}
              />
            </div>

            {/* Cart Summary List */}
            {cartSummary.length > 0 && (
              <div
                className={`mt-5 rounded-2xl border-2 overflow-hidden ${isHighContrast
                    ? 'bg-zinc-900 border-yellow-400/40'
                    : 'bg-slate-50 border-slate-200'
                  }`}
              >
                <div
                  className={`px-4 py-3 flex items-center justify-between border-b ${isHighContrast
                      ? 'bg-yellow-400/10 border-yellow-400/30 text-yellow-300'
                      : 'bg-slate-100 border-slate-200 text-slate-700'
                    }`}
                >
                  <div className="flex items-center gap-2 font-extrabold text-base">
                    <PackageCheck className="w-5 h-5 shrink-0" />
                    <span>
                      {t.cartSummaryTitle ||
                        (lang === 'ta'
                          ? 'கூடையில் உள்ளவை'
                          : 'Items in Your Basket')}
                    </span>
                  </div>
                  <span
                    className={`px-3 py-0.5 rounded-full text-sm font-black ${isHighContrast
                        ? 'bg-yellow-400 text-black'
                        : 'bg-emerald-600 text-white'
                      }`}
                  >
                    {totalUnits}{' '}
                    {lang === 'ta'
                      ? 'பொருட்கள்'
                      : totalUnits === 1
                        ? 'Item'
                        : 'Items'}
                  </span>
                </div>

                {/* Scrollable Item Cards with Individual Speaker Button */}
                <div className="p-3 sm:p-4 max-h-52 overflow-y-auto space-y-2.5">
                  {cartSummary.map((item, idx) => {
                    const itemName = lang === 'ta' ? resolveItemName(item) : item.name;
                    const itemWeight = lang === 'ta' ? getLocalizedWeight(item.weight, 'ta') : item.weight;
                    return (
                      <div
                        key={idx}
                        className={`flex items-center justify-between gap-3 p-3 rounded-xl border ${isHighContrast
                            ? 'bg-black border-yellow-400/30 text-yellow-200'
                            : 'bg-white border-slate-200 text-slate-900 shadow-sm'
                          }`}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <span
                            className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-sm shrink-0 ${isHighContrast
                                ? 'bg-yellow-400 text-black'
                                : 'bg-emerald-100 text-emerald-800'
                              }`}
                          >
                            {idx + 1}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-base sm:text-lg font-extrabold truncate">
                              {itemName}
                            </p>
                            {(itemWeight || item.qty > 1) && (
                              <p
                                className={`text-xs sm:text-sm font-bold ${isHighContrast
                                    ? 'text-yellow-400/80'
                                    : 'text-slate-500'
                                  }`}
                              >
                                {itemWeight ? `${itemWeight} ` : ''}
                                {item.qty > 1
                                  ? lang === 'ta'
                                    ? `• எண்ணிக்கை: ×${item.qty}`
                                    : `• Qty: ×${item.qty}`
                                  : ''}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <div className="text-right">
                            {item.qty > 1 && (
                              <span
                                className={`inline-block text-xs font-black px-2 py-0.5 rounded-md mr-1.5 ${isHighContrast
                                    ? 'bg-yellow-400/20 text-yellow-300 border border-yellow-400/50'
                                    : 'bg-amber-100 text-amber-900'
                                  }`}
                              >
                                ×{item.qty}
                              </span>
                            )}
                            <span className="text-lg font-black">
                              {item.price || ''}
                            </span>
                          </div>

                          {/* Mini read aloud button */}
                          <SpeakButton
                            text={
                              lang === 'ta'
                                ? `பொருள் ${idx + 1}: ${itemName}. ${itemWeight ? `அளவு ${itemWeight}. ` : ''}${item.qty > 1 ? `எண்ணிக்கை ${item.qty}. ` : ''}விலை ${String(item.price || '').replace('₹', '')} ரூபாய்.`
                                : `Item ${idx + 1}: ${item.name}. ${item.weight ? `Weight ${item.weight}. ` : ''}${item.qty > 1 ? `Quantity ${item.qty}. ` : ''}Price ${item.price || 'not available'}.`
                            }
                            lang={lang}
                            id={`modal-item-${idx}-${(item.name || '').replace(/\s+/g, '-')}`}
                            isHighContrast={isHighContrast}
                            size="sm"
                            showLabel={false}
                            title={lang === 'ta' ? `${itemName} விவரத்தைக் கேட்க` : `Listen to ${item.name}`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {estimatedTotal > 0 && (
                  <div
                    className={`px-4 py-2.5 flex items-center justify-between border-t text-base font-black ${isHighContrast
                        ? 'bg-zinc-950 border-yellow-400/30 text-yellow-300'
                        : 'bg-emerald-50/70 border-slate-200 text-emerald-950'
                      }`}
                  >
                    <span>
                      {lang === 'ta'
                        ? 'மதிப்பிடப்பட்ட மொத்தம்:'
                        : 'Estimated Item Total:'}
                    </span>
                    <span className="text-xl">₹{estimatedTotal}</span>
                  </div>
                )}
              </div>
            )}

            {/* VIEW 1: Main Decision Buttons */}
            {!showAddMoreInput ? (
              <div className="mt-6 space-y-3.5">
                <button
                  type="button"
                  onClick={handleCheckoutClick}
                  className={`w-full min-h-[68px] px-6 py-4 rounded-2xl font-black text-xl sm:text-2xl flex items-center justify-center gap-3.5 transition-all shadow-lg border-2 active:scale-[0.99] ${isHighContrast
                      ? 'bg-yellow-400 text-black border-yellow-300 hover:bg-yellow-300'
                      : 'bg-emerald-600 text-white border-emerald-700 hover:bg-emerald-700 shadow-emerald-600/20'
                    }`}
                >
                  <CheckCircle2 className="w-8 h-8 shrink-0" />
                  <span>
                    {t.proceedCheckout ||
                      (lang === 'ta'
                        ? 'ஆர்டர் செய்யவும் (Place Order)'
                        : 'Proceed to Checkout')}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    stopAllSpeech();
                    setShowAddMoreInput(true);
                  }}
                  className={`w-full min-h-[64px] px-6 py-4 rounded-2xl font-black text-lg sm:text-xl flex items-center justify-center gap-3 transition-all shadow-sm border-2 active:scale-[0.99] ${isHighContrast
                      ? 'bg-zinc-900 text-yellow-300 border-yellow-400 hover:bg-zinc-800'
                      : 'bg-amber-50 text-amber-950 border-amber-400 hover:bg-amber-100'
                    }`}
                >
                  <Plus className="w-7 h-7 shrink-0" />
                  <span>
                    {t.addMoreItems ||
                      (lang === 'ta'
                        ? 'மேலும் பொருட்கள் சேர்க்க'
                        : 'Add More Items')}
                  </span>
                </button>
              </div>
            ) : (
              /* VIEW 2: "Add More Items" Input + Voice Microphone Panel */
              <form onSubmit={handleAddMoreSubmit} className="mt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="add-more-input"
                    className="text-base sm:text-lg font-extrabold block"
                  >
                    {lang === 'ta'
                      ? 'எந்தப் பொருட்களைச் சேர்க்க வேண்டும்?'
                      : 'What else would you like to add?'}
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowAddMoreInput(false)}
                    className={`inline-flex items-center gap-1.5 text-sm font-bold px-3 py-1.5 rounded-xl border ${isHighContrast
                        ? 'border-yellow-400/50 text-yellow-300 hover:bg-zinc-800'
                        : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                      }`}
                  >
                    <ArrowLeft className="w-4 h-4" />
                    {lang === 'ta' ? 'பின்செல்' : 'Back'}
                  </button>
                </div>

                <div className="flex gap-2.5">
                  <input
                    id="add-more-input"
                    type="text"
                    value={addMoreText}
                    onChange={(e) => setAddMoreText(e.target.value)}
                    placeholder={
                      t.addMoreInputPlaceholder ||
                      (lang === 'ta'
                        ? 'உதா: பால், தயிர், 1 கிலோ தக்காளி...'
                        : 'e.g., 2 packets curd, banana, bread...')
                    }
                    autoFocus
                    className={`flex-1 min-w-0 px-4 py-4 rounded-2xl text-lg sm:text-xl font-bold border-2 outline-none transition-all ${isHighContrast
                        ? 'bg-zinc-900 text-yellow-300 border-yellow-400 placeholder-yellow-600/70'
                        : 'bg-white text-slate-900 border-emerald-500 placeholder-slate-400'
                      }`}
                  />

                  <button
                    type="button"
                    onClick={toggleVoiceInput}
                    aria-label={isListening ? 'Stop microphone' : 'Start microphone'}
                    title={isListening ? (lang === 'ta' ? 'மைக்கை நிறுத்த தட்டவும்' : 'Click to stop') : (lang === 'ta' ? 'குரல் உள்ளீட்டிற்கு தட்டவும்' : 'Click to speak')}
                    className={`px-5 rounded-2xl border-2 flex items-center justify-center transition-all shrink-0 ${isListening
                        ? 'bg-red-600 text-white border-red-700 animate-pulse'
                        : isHighContrast
                          ? 'bg-zinc-900 text-yellow-300 border-yellow-400 hover:bg-zinc-800'
                          : 'bg-emerald-50 text-emerald-800 border-emerald-400 hover:bg-emerald-100'
                      }`}
                  >
                    {isListening ? (
                      <MicOff className="w-7 h-7" />
                    ) : (
                      <Mic className="w-7 h-7" />
                    )}
                  </button>
                </div>

                {/* Live Listening Visual Indicator */}
                {isListening && (
                  <div className="flex items-center gap-2 text-sm font-black px-3.5 py-2 rounded-xl bg-red-100 border-2 border-red-400 text-red-900 animate-pulse">
                    <span className="w-3 h-3 rounded-full bg-red-600 animate-ping"></span>
                    <span>
                      {lang === 'ta'
                        ? '🎤 பேசவும்... உங்கள் குரல் கேட்கப்படுகிறது'
                        : '🎤 Listening live... Speak your items'}
                    </span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!addMoreText.trim()}
                  className={`w-full min-h-[64px] py-4 rounded-2xl font-black text-xl flex items-center justify-center gap-3 transition-all shadow-lg border-2 ${!addMoreText.trim() ? 'opacity-40 cursor-not-allowed' : ''
                    } ${isHighContrast
                      ? 'bg-yellow-400 text-black border-yellow-300 hover:bg-yellow-300'
                      : 'bg-emerald-600 text-white border-emerald-700 hover:bg-emerald-700'
                    }`}
                >
                  <Plus className="w-7 h-7" />
                  <span>
                    {lang === 'ta'
                      ? 'கூடையில் சேர்க்கவும்'
                      : 'Search & Add These Items'}
                  </span>
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}