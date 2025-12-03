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
    imageDataLength: input.imageUrl?.length || 0,
    productName: input.productName,
    brand: input.brand,
  });

  const prompt = IMAGE_VALIDATION_PROMPT
    .replace('{{productName}}', input.productName)
    .replace('{{brand}}', input.brand)
    .replace('{{category}}', input.category);

  try {
    // Vérifier que l'image est en base64
    const base64Data = input.imageUrl.startsWith('data:image')
      ? input.imageUrl.split(',')[1]
      : input.imageUrl;

    // Déterminer le MIME type
    let mimeType = 'image/jpeg';
    if (input.imageUrl.includes('data:image/png')) {
      mimeType = 'image/png';
    } else if (input.imageUrl.includes('data:image/webp')) {
      mimeType = 'image/webp';
    }

    console.log('[validateProductImage] Calling Gemini Vision API...');

    // Appel à Gemini Vision avec image
    const result = await geminiModel.generateContent([
      {
        text: prompt + '\n\nRéponds UNIQUEMENT en JSON, sans texte additionnel.',
      },
      {
        inlineData: {
          mimeType,
          data: base64Data,
        },
      },
    ]);

    const response = result.response;
    const content = response.text();

    console.log('[validateProductImage] Raw AI response:', content);

    // Parser JSON (extraire le JSON du texte)
    let jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Format de réponse invalide - pas de JSON trouvé');
    }

    const output = JSON.parse(jsonMatch[0]) as ImageValidationOutput;

    console.log('[validateProductImage] Result:', {
      isValid: output.isValid,
      confidence: output.confidence,
      message: output.message,
    });

    return output;

  } catch (error) {
    console.error('[validateProductImage] Error:', error);
    
    return {
      isValid: false,
      confidence: 0,
      message: `Erreur validation: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
      suggestions: [
        'Vérifiez que l\'image est bien un produit de beauté/parfum',
        'Utilisez une photo claire et nette du produit',
        'Assurez-vous que la marque et le nom sont visibles',
      ],
    };
  }
}

/**
 * Helper: Vérifier validité selon seuil
 */
export function isImageValid(output: ImageValidationOutput, threshold: number = 70): boolean {
  return output.isValid && output.confidence >= threshold;
}
