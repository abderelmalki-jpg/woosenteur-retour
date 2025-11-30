/**
 * Flow pour la validation d'images produits
 * Vérifie correspondance avec Gemini Vision
 */

import { geminiModel } from '../config';
import {
  type ImageValidationInput,
  type ImageValidationOutput,
} from '../types/product';
import { IMAGE_VALIDATION_PROMPT } from '../prompts/system';

/**
 * Validation d'image produit avec Gemini Vision
 */
export async function validateProductImageFlow(input: ImageValidationInput): Promise<ImageValidationOutput> {
  console.log('[validateProductImage] Starting with:', {
    imageUrl: input.imageUrl,
    productName: input.productName,
    brand: input.brand,
  });

  const prompt = IMAGE_VALIDATION_PROMPT
    .replace('{{imageUrl}}', input.imageUrl)
    .replace('{{productName}}', input.productName)
    .replace('{{brand}}', input.brand)
    .replace('{{category}}', input.category);

  try {
    // Appel à Gemini Vision
    const result = await geminiModel.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: 'image/jpeg',
          data: input.imageUrl,
        },
      },
    ]);

    const response = result.response;
    const content = response.text();

    console.log('[validateProductImage] AI response received');

    // Parser JSON
    let jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Format de réponse invalide');
    }

    const output = JSON.parse(jsonMatch[0]) as ImageValidationOutput;

    console.log('[validateProductImage] Result:', {
      isValid: output.isValid,
      confidence: output.confidence,
    });

    return output;

  } catch (error) {
    console.error('[validateProductImage] Error:', error);
    
    return {
      isValid: false,
      confidence: 0,
      message: `Erreur validation: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
      suggestions: ['Vérifiez que l\'image est accessible', 'Utilisez une URL HTTPS valide'],
    };
  }
}

/**
 * Helper: Vérifier validité selon seuil
 */
export function isImageValid(output: ImageValidationOutput, threshold: number = 70): boolean {
  return output.isValid && output.confidence >= threshold;
}
