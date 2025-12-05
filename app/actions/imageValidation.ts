'use server';

import { validateProductImageFlow } from '../../lib/genkit/flows/validateProductImage';
import { ImageValidationInput, ImageValidationOutput } from '../../lib/genkit/types/product';

export async function validateImageAction(input: ImageValidationInput): Promise<ImageValidationOutput> {
  console.log('[validateImageAction] Calling validateProductImageFlow with:', input.productName, input.brand);
  try {
    const result = await validateProductImageFlow(input);
    return result;
  } catch (error) {
    console.error('[validateImageAction] Error during image validation:', error);
    return {
      isValid: false,
      confidence: 0,
      message: `Erreur interne du serveur lors de la validation d\'image: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
      suggestions: [],
    };
  }
}
