// NOTE: The official Google Generative AI SDK is a Node-side library and
// importing it directly in the browser bundle (via Vite) causes resolution
// errors and bundle issues. This file intentionally avoids a top-level
// import so the app can run in the browser. To enable real Gemini calls,
// move server-side calls to an API route and call that from the frontend.

/**
 * IMPORTANT:
 * - Vite ONLY exposes env variables prefixed with VITE_
 * - NEVER use process.env in Vite frontend apps
 */
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

/**
 * Fail gracefully instead of crashing the entire app
 */
if (!API_KEY) {
  console.warn(
    "[Gemini] VITE_GEMINI_API_KEY is missing. Gemini features are disabled."
  );
}

/**
 * Create client ONLY if API key exists
 */
// Do not instantiate the Node SDK in the browser build. Keep `genAI` null
// here so the UI can function without Gemini. Implement a server-side
// integration to call Gemini and return results via your own API endpoint.
const genAI = null;

/**
 * Get Gemini model safely
 */
const getModel = () => {
  if (!genAI) {
    throw new Error("Gemini API is not initialized (missing API key).");
  }

  return genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
  });
};

/**
 * Generate text using Gemini
 */
export const generateWithGemini = async (prompt: string): Promise<string> => {
  if (!genAI) {
    return "Gemini is not configured. Please set the API key.";
  }

  try {
    const model = getModel();
    const result = await model.generateContent(prompt);
    const response = await result.response;

    return response.text();
  } catch (error) {
    console.error("[Gemini Error]", error);
    return "Error generating response. Please try again.";
  }
};

/**
 * Optional: Export a flag so UI can disable Gemini features
 */
export const isGeminiEnabled = Boolean(API_KEY);

/**
 * Public frontend facade. Because the Node SDK can't run in the browser,
 * this provides safe fallbacks and small helper utilities the UI can call.
 */
export const GeminiService = {
  isEnabled: isGeminiEnabled,
  generate: generateWithGemini,

  /**
   * Try to suggest link metadata for a URL. When Gemini is not enabled this
   * attempts a best-effort CORS fetch to extract the <title> tag. If that
   * fails (CORS/network) it returns null so the UI can handle absence.
   */
  suggestLinkMetadata: async (url: string): Promise<{ title: string } | null> => {
    if (!url) return null;

    // If Gemini isn't enabled, try a simple fetch and parse <title>
    if (!isGeminiEnabled) {
      try {
        const res = await fetch(url, { method: 'GET' });
        const text = await res.text();
        const match = text.match(/<title[^>]*>([^<]+)<\/title>/i);
        if (match) return { title: match[1].trim() };
      } catch (e) {
        // ignore CORS/network failures and return null
        return null;
      }
      return null;
    }

    // TODO: Replace with a server-side integration that calls Gemini SDK
    // and returns structured metadata (title, description, image, etc.)
    return null;
  }
};
