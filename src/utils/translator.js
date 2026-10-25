/**
 * ElderEase Frontend Translation & Localization Engine
 * =====================================================
 * Mirrors backend/i18n.py using the exact same Google Translate
 * API and matches against the top 5 suggestions shown in chat.
 */

const translationCache = new Map();

// Initialize cache from sessionStorage if available
if (typeof window !== 'undefined') {
  try {
    const saved = sessionStorage.getItem('elderease_ta_translations');
    if (saved) {
      const parsed = JSON.parse(saved);
      Object.entries(parsed).forEach(([k, v]) => translationCache.set(k, v));
    }
  } catch (_) {}
}

function saveCache() {
  if (typeof window !== 'undefined') {
    try {
      const obj = Object.fromEntries(translationCache);
      sessionStorage.setItem('elderease_ta_translations', JSON.stringify(obj));
    } catch (_) {}
  }
}

/**
 * Searches messages chat history for previous top-5 search results
 * that match itemName and already have `name_localized` in Tamil.
 */
export function findLocalizedNameFromMessages(itemName, messages = []) {
  if (!itemName || !Array.isArray(messages)) return null;

  const cleanTarget = itemName.toLowerCase().replace(/\.\.\.$/, '').trim();
  if (!cleanTarget) return null;

  // Search backwards (most recent search results first)
  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i];
    if (msg && Array.isArray(msg.results)) {
      for (const prod of msg.results) {
        if (!prod) continue;
        const prodEn = (prod.name || '').toLowerCase().trim();
        const prodTa = (prod.name_localized || '').trim();

        if (prodTa && /[\u0B80-\u0BFF]/.test(prodTa)) {
          // Exact or substring / prefix match (handles truncated "Organically Grown Sambar ...")
          if (
            prodEn === cleanTarget ||
            prodEn.startsWith(cleanTarget) ||
            cleanTarget.startsWith(prodEn) ||
            (cleanTarget.length >= 6 && prodEn.includes(cleanTarget))
          ) {
            return prodTa;
          }
        }
      }
    }
  }
  return null;
}

/**
 * Translates English text to Tamil using the exact same Google Translate
 * endpoint used by the backend i18n.py module.
 */
export async function fetchTamilTranslation(text) {
  if (!text || typeof text !== 'string') return text;
  const clean = text.trim();
  if (!clean) return '';

  // Return immediately if already contains Tamil script
  if (/[\u0B80-\u0BFF]/.test(clean)) return clean;

  // Check cache
  if (translationCache.has(clean)) {
    return translationCache.get(clean);
  }

  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ta&dt=t&q=${encodeURIComponent(clean)}`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      if (data && data[0] && Array.isArray(data[0])) {
        const translated = data[0].map((seg) => seg && seg[0]).filter(Boolean).join('');
        if (translated && /[\u0B80-\u0BFF]/.test(translated)) {
          translationCache.set(clean, translated);
          saveCache();
          return translated;
        }
      }
    }
  } catch (err) {
    console.warn('Frontend translation request error:', err);
  }

  return clean;
}
