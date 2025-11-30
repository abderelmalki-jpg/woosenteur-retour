import { genkit } from 'genkit';
import { googleAI, gemini20FlashExp } from '@genkit-ai/googleai';

// Initialize Genkit with Google AI
export const ai = genkit({
  plugins: [googleAI()],
  model: gemini20FlashExp, // Changé vers Gemini 2.0 Flash Experimental
});

// Types for product generation
export interface ProductInput {
  productName: string;
  brand: string;
  category: 'Parfums' | 'Cosmétiques' | 'Soins' | "Parfums d'intérieur" | 'Parfums beauté';
}

export interface ProductOutput {
  seoTitle: string;
  shortDescription: string;
  longDescription: string;
  mainKeyword: string;
  suggestedCategory: string;
  confidenceScore: number;
  correctedBrand?: string;
  correctedProductName?: string;
  message?: string; // Message pour l'utilisateur selon le score de confiance
}
