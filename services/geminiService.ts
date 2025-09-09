import { GoogleGenAI } from "@google/genai";
import { SYSTEM_PROMPT, GEMINI_MODEL } from '../constants';

const streamCode = async (apiKey: string, prompt: string, onChunk: (chunk: string) => void): Promise<void> => {
  if (!apiKey) {
    throw new Error("Gemini API key not provided.");
  }
  const ai = new GoogleGenAI({ apiKey });

  try {
    const responseStream = await ai.models.generateContentStream({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_PROMPT,
      },
    });

    for await (const chunk of responseStream) {
      const text = chunk.text;
      if (text) {
        // Stream back the text, cleaning any markdown formatting on the fly.
        onChunk(text.replace(/```html/g, '').replace(/```/g, ''));
      }
    }
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error && error.message.includes('API key not valid')) {
      throw new Error("The provided Gemini API key is invalid.");
    }
    throw new Error("Failed to generate content from AI.");
  }
};


export const generateCodeFromPrompt = async (apiKey: string, prompt: string, onChunk: (chunk: string) => void): Promise<void> => {
  const fullPrompt = `Generate a React application based on the following description: "${prompt}"`;
  return streamCode(apiKey, fullPrompt, onChunk);
};

export const generateCodeFromUrl = async (apiKey: string, url: string, scrapedContent: string, onChunk: (chunk: string) => void): Promise<void> => {
  const fullPrompt = `Recreate the website from the URL "${url}". The scraped content is as follows: "${scrapedContent}". Focus on replicating the layout, color scheme, and core components with modern, clean React and Tailwind CSS code.`;
  return streamCode(apiKey, fullPrompt, onChunk);
};