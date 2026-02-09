import { GoogleGenAI } from "@google/genai";
import { trackGemini } from "opik-gemini";
import dotenv from "dotenv";

dotenv.config();

// Initialize Gemini AI
const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// Wrap with Opik tracking for observability
export const trackedGenAI = trackGemini(genAI, {
  projectName: "levelup",
  apiKey: process.env.OPIK_API_KEY,
  workspace: process.env.OPIK_WORKSPACE,
});

// Get model with tracking
export const generateContent = async ({
  modelName = "gemini-2.5-flash",
  contents,
  systemInstruction,
}) => {
  const request = {
    model: modelName,
    contents: contents,
  };

  if (systemInstruction) {
    request.systemInstruction = systemInstruction;
  }

  return await trackedGenAI.models.generateContent(request);
};
