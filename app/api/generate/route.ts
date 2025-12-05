/**
 * API Route pour la génération de fiches produits
 * Utilise Genkit Flow avec Gemini AI
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateProductFlow } from '@/lib/genkit/flows/generateProduct';
import type { ProductInput } from '@/lib/genkit/types/product';

export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    // Parser le body
    const body = await request.json();
    const { productName, brand, category } = body;

    // Validation des données
    if (!productName || !brand || !category) {
      return NextResponse.json(
        { error: 'Données manquantes: productName, brand, category requis' },
        { status: 400 }
      );
    }

    // Appeler le flow Genkit
    const input: ProductInput = {
      productName: productName.trim(),
      brand: brand.trim(),
      category: category,
    };

    console.log('[API /generate] Processing:', input);

    const result = await generateProductFlow(input);

    console.log('[API /generate] Success! Confidence:', result.confidenceScore);

    // Retourner le résultat dans le format attendu par le frontend
    return NextResponse.json({
      data: result,
      success: true,
    });

  } catch (error: any) {
    console.error('[API /generate] Error:', error);
    
    return NextResponse.json(
      { 
        error: error.message || 'Erreur lors de la génération',
        details: error.toString(),
      },
      { status: 500 }
    );
  }
}

// OPTIONS pour CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
