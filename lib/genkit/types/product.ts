/**
 * Types pour la génération de fiches produits
 */

import { z } from 'zod';

// Schéma Zod pour l'input
export const ProductInputSchema = z.object({
  productName: z.string().min(2, 'Le nom du produit doit contenir au moins 2 caractères'),
  brand: z.string().min(2, 'La marque doit contenir au moins 2 caractères'),
  category: z.enum(['Parfums', 'Cosmétiques', 'Soins', "Parfums d'intérieur", 'Parfums beauté']),
});

export type ProductInput = z.infer<typeof ProductInputSchema>;

// Schéma Zod pour l'output
export const ProductOutputSchema = z.object({
  seoTitle: z.string(),
  shortDescription: z.string(),
  longDescription: z.string(),
  mainKeyword: z.string(),
  suggestedCategory: z.string(),
  confidenceScore: z.number().min(0).max(100),
  correctedBrand: z.string().optional(),
  correctedProductName: z.string().optional(),
  message: z.string().optional(),
  olfactoryPyramid: z.object({
    top: z.array(z.string()).optional(),
    heart: z.array(z.string()).optional(),
    base: z.array(z.string()).optional(),
  }).optional(),
});

export type ProductOutput = z.infer<typeof ProductOutputSchema>;

// Types pour le processus de validation
export interface ValidationResult {
  isValid: boolean;
  confidence: number;
  correctedName?: string;
  correctedBrand?: string;
  sources: string[];
  message?: string;
}

// Types pour l'image validation
export const ImageValidationInputSchema = z.object({
  imageUrl: z.string().url(),
  productName: z.string(),
  brand: z.string(),
  category: z.string(),
});

export type ImageValidationInput = z.infer<typeof ImageValidationInputSchema>;

export const ImageValidationOutputSchema = z.object({
  isValid: z.boolean(),
  confidence: z.number(),
  message: z.string(),
  suggestions: z.array(z.string()).optional(),
});

export type ImageValidationOutput = z.infer<typeof ImageValidationOutputSchema>;
