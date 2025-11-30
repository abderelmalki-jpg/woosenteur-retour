/**
 * Configuration Gemini AI pour WooSenteur
 * Utilise directement l'API Google Generative AI
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialiser Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Modèle Gemini 2.0 Flash
export const geminiModel = genAI.getGenerativeModel({ 
  model: 'gemini-2.0-flash-exp',
});

// Configuration par défaut
export const DEFAULT_GENERATION_CONFIG = {
  temperature: 0.7,
  topK: 40,
  topP: 0.95,
  maxOutputTokens: 2048,
};

// Types
export type { ProductInput, ProductOutput } from './types/product';
