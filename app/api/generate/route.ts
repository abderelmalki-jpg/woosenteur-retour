/**
 * API Route pour la génération de fiches produits
 * POST /api/generate
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateProductFlow, requiresUserConfirmation } from '@/lib/genkit/flows/generateProduct';

export async function POST(request: NextRequest) {
  try {
    // Parser l'input
    const body = await request.json();
    const { productName, brand, category } = body;

    if (!productName || !brand || !category) {
      return NextResponse.json(
        { error: 'Paramètres manquants (productName, brand, category requis)' },
        { status: 400 }
      );
    }

    // Appeler le flow Gemini
    console.log('[API /generate] Calling generateProductFlow...');
    
    const result = await generateProductFlow({
      productName,
      brand,
      category,
    });

    console.log('[API /generate] Flow completed with confidence:', result.confidenceScore);

    // Retourner le résultat
    return NextResponse.json({
      success: true,
      data: result,
      requiresConfirmation: requiresUserConfirmation(result),
    });

  } catch (error) {
    console.error('[API /generate] Error:', error);
    
    return NextResponse.json(
      {
        error: 'Erreur serveur',
        message: error instanceof Error ? error.message : 'Erreur inconnue',
      },
      { status: 500 }
    );
  }
}
