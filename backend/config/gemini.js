import { GoogleGenerativeAI } from "@google/generative-ai";
import { trackGemini } from "opik-gemini";
import dotenv from "dotenv";

dotenv.config();

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Wrap with Opik tracking for observability
export const trackedGenAI = trackGemini(genAI, {
  projectName: "levelup",
  apiKey: process.env.OPIK_API_KEY,
  workspace: process.env.OPIK_WORKSPACE,
});

// Get model with tracking
export const getModel = (modelName = "gemini-2.5-flash") => {
  return trackedGenAI.getGenerativeModel({ model: modelName });
};
