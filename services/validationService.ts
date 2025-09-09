import { Sandbox } from 'e2b';
import { GoogleGenAI } from "@google/genai";

/**
 * Validates a Gemini API key by making a minimal request.
 * @param apiKey - The Gemini API key to validate.
 * @returns A promise that resolves to true if the key is valid, false otherwise.
 */
export const validateGeminiKey = async (apiKey: string): Promise<boolean> => {
  if (!apiKey) return false;
  try {
    const ai = new GoogleGenAI({ apiKey });
    // Use a very simple, low-token prompt to check for authentication errors.
    await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: 'test',
    });
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('API key not valid')) {
        return false;
    }
    console.error("Gemini validation check failed:", error);
    return false;
  }
};

/**
 * Validates an OpenAI API key by attempting to fetch the list of models.
 * @param apiKey - The OpenAI API key to validate.
 * @returns A promise that resolves to true if the key is valid, false otherwise.
 */
export const validateOpenAIKey = async (apiKey: string): Promise<boolean> => {
  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: { 'Authorization': `Bearer ${apiKey}` },
    });
    return response.ok;
  } catch {
    return false;
  }
};

/**
 * Validates an Anthropic API key by making a minimal request to the messages endpoint.
 * @param apiKey - The Anthropic API key to validate.
 * @returns A promise that resolves to true if the key is valid, false otherwise.
 * A 400 Bad Request is considered a success because it means authentication passed.
 */
export const validateAnthropicKey = async (apiKey: string): Promise<boolean> => {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
          "model": "claude-3-haiku-20240307", // Use a cheap, fast model
          "max_tokens": 1,
          "messages": [{"role": "user", "content": "test"}]
      }),
    });
    // A 401 status code means the key is invalid. Any other status (including 400) means auth was successful.
    return response.status !== 401;
  } catch {
    return false;
  }
};

/**
 * Validates a Groq API key by attempting to fetch the list of models.
 * @param apiKey - The Groq API key to validate.
 * @returns A promise that resolves to true if the key is valid, false otherwise.
 */
export const validateGroqKey = async (apiKey: string): Promise<boolean> => {
  try {
    const response = await fetch('https://api.groq.com/openai/v1/models', {
      headers: { 'Authorization': `Bearer ${apiKey}` },
    });
    return response.ok;
  } catch {
    return false;
  }
};

/**
 * Validates a Firecrawl API key by making a scrape request.
 * @param apiKey - The Firecrawl API key to validate.
 * @returns A promise that resolves to true if the key is valid, false otherwise.
 */
export const validateFirecrawlKey = async (apiKey: string): Promise<boolean> => {
  try {
    const response = await fetch('https://api.firecrawl.dev/v0/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: 'https://example.com' }), // Use a simple, valid URL for the test.
    });
    // A 401 status code means the key is invalid.
    return response.status !== 401;
  } catch {
    return false;
  }
};

/**
 * Validates an E2B API key by creating and then immediately closing a sandbox.
 * @param apiKey - The E2B API key to validate.
 * @returns A promise that resolves to true if the key is valid, false otherwise.
 */
export const validateE2BKey = async (apiKey: string): Promise<boolean> => {
  if (!apiKey) return false;
  try {
    const sandbox = await Sandbox.create({ apiKey });
    // FIX: The 'close' method exists on the Sandbox instance at runtime but is missing from its type definition. Casting to 'any' to bypass the TypeScript error.
    await (sandbox as any).close();
    return true;
  } catch {
    return false;
  }
};
