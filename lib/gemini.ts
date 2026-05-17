import { GoogleGenAI } from "@google/genai";

export const GEMINI_CHAT_MODEL = "gemini-2.5-flash";
export const GEMINI_EMBEDDING_MODEL = "gemini-embedding-001";

export function getGeminiConfig() {
  return {
    apiKey: process.env.GEMINI_API_KEY ?? "",
    chatModel: GEMINI_CHAT_MODEL,
    embeddingModel: GEMINI_EMBEDDING_MODEL,
  };
}

export function getGeminiClient() {
  const { apiKey } = getGeminiConfig();

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing.");
  }

  return new GoogleGenAI({ apiKey });
}
