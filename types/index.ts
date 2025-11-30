// User types
export interface User {
  id: string;
  email: string;
  stripeCustomerId?: string;
  generationCredits: number;
  exportCredits: number;
  plan: 'free' | 'essentiel' | 'standard' | 'premium';
  createdAt: Date;
  updatedAt: Date;
}

// Product types
export interface Product {
  id: string;
  userId: string;
  name: string;
  brand: string;
  category: 'Parfums' | 'Cosmétiques' | 'Soins' | "Parfums d'intérieur" | 'Parfums beauté';
  seoTitle: string;
  shortDescription: string;
  longDescription: string;
  price?: number;
  weight?: number;
  mainKeyword: string;
  imageUrl?: string;
  suggestedCategory?: string;
  createdAt: Date;
  updatedAt: Date;
}

// AI Generation types
export interface GenerationInput {
  productName: string;
  brand: string;
  category: string;
}

export interface GenerationOutput {
  seoTitle: string;
  shortDescription: string;
  longDescription: string;
  mainKeyword: string;
  suggestedCategory: string;
  confidenceScore: number;
  correctedBrand?: string;
  correctedProductName?: string;
}

// Export types
export interface WooCommerceConfig {
  storeUrl: string;
  consumerKey: string;
  consumerSecret: string;
}

export interface ExportResult {
  success: boolean;
  message: string;
  productId?: string;
  error?: string;
}
