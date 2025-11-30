import { NextRequest, NextResponse } from 'next/server';
import { generateProductFlow } from '@/lib/genkit/flows/generateProduct';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productName, brand, category } = body;

    if (!productName || !brand || !category) {
      return NextResponse.json(
        { error: 'Paramètres manquants' },
        { status: 400 }
      );
    }

    // Appel au flux Genkit
    const result = await generateProductFlow({
      productName,
      brand,
      category,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Generation error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la génération' },
      { status: 500 }
    );
  }
}
