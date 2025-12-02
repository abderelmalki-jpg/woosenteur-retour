/**
 * API Route pour la validation d'images produits
 * POST /api/validate-image
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateProductImageFlow } from '@/lib/genkit/flows/validateProductImage';

export async function POST(request: NextRequest) {
  try {
    // Parser l'input
    const body = await request.json();
    const { imageUrl, productName, brand, category } = body;

    if (!imageUrl || !productName || !brand || !category) {
      return NextResponse.json(
        { error: 'Paramètres manquants (imageUrl, productName, brand, category requis)' },
        { status: 400 }
      );
    }

    // Appeler le flow Gemini
    console.log('[API /validate-image] Calling validateProductImageFlow...');
    
    const result = await validateProductImageFlow({
      imageUrl,
      productName,
      brand,
      category,
    });

    console.log('[API /validate-image] Validation completed:', {
      isValid: result.isValid,
      confidence: result.confidence,
    });

    // Retourner le résultat
    return NextResponse.json({
      success: true,
      data: result,
    });

  } catch (error) {
    console.error('[API /validate-image] Error:', error);
    
    return NextResponse.json(
      {
        error: 'Erreur serveur',
        message: error instanceof Error ? error.message : 'Erreur inconnue',
      },
      { status: 500 }
    );
  }
}
