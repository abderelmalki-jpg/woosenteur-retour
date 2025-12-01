/**
 * API Route pour adapter un produit à un événement
 * POST /api/adapt
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth, db } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import { geminiModel } from '@/lib/genkit/config';
import { createRateLimiter } from '@/lib/middleware/rateLimit';

// Désactivé en mode Capacitor (export statique)
if (process.env.CAPACITOR_BUILD !== 'true') {
  exports.dynamic = 'force-dynamic';
}

// Rate limiter: 5 adaptations par minute
const rateLimiter = createRateLimiter({
  maxRequests: 5,
  windowMs: 60 * 1000,
  message: 'Trop d\'adaptations. Veuillez patienter 1 minute.',
});

export async function POST(request: NextRequest) {
  try {
    // 0. Rate limiting
    const rateLimitResponse = await rateLimiter(request);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // 1. Authentification
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    let userId: string;

    try {
      const decodedToken = await auth.verifyIdToken(token);
      userId = decodedToken.uid;
    } catch (error) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    // 2. Vérifier les crédits
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    const userData = userDoc.data();
    const creditsRemaining = userData?.generationCredits || 0;

    if (creditsRemaining <= 0) {
      return NextResponse.json(
        { 
          error: 'Crédits insuffisants',
          message: 'Vous avez épuisé vos crédits. Passez à un plan supérieur.',
        },
        { status: 403 }
      );
    }

    // 3. Parser la requête
    const { productId, eventPrompt, eventName } = await request.json();

    if (!productId || !eventPrompt) {
      return NextResponse.json(
        { error: 'Données manquantes (productId, eventPrompt requis)' },
        { status: 400 }
      );
    }

    // 4. Récupérer le produit
    const productRef = db.collection('users').doc(userId).collection('products').doc(productId);
    const productDoc = await productRef.get();

    if (!productDoc.exists) {
      return NextResponse.json({ error: 'Produit non trouvé' }, { status: 404 });
    }

    const product = productDoc.data();

    // 5. Générer la description adaptée avec Gemini
    const adaptPrompt = `
Tu es un expert en rédaction marketing pour produits de beauté.

PRODUIT ORIGINAL:
Nom: ${product?.productName || product?.name}
Marque: ${product?.brand}
Catégorie: ${product?.category}

DESCRIPTION COURTE ACTUELLE:
${product?.shortDescription}

DESCRIPTION LONGUE ACTUELLE:
${product?.longDescription}

CONSIGNE D'ADAPTATION:
${eventPrompt}

INSTRUCTIONS:
- Conserve TOUTES les informations techniques (notes olfactives, ingrédients, contenance)
- Réécris l'introduction et la conclusion avec l'angle événementiel
- Garde le même format et structure
- Ajoute 2-3 phrases évoquant l'événement de manière naturelle
- Le ton doit rester professionnel et élégant
- NE PAS inventer de nouvelles caractéristiques produit

Réponds UNIQUEMENT avec un JSON:
{
  "shortDescription": "Description courte adaptée (150-200 caractères)",
  "longDescription": "Description longue adaptée (format HTML avec <p>, <ul>, <li>)",
  "seoTitle": "Titre SEO adapté incluant l'événement",
  "eventTag": "${eventName || 'événement'}"
}
`;

    const chat = geminiModel.startChat({
      history: [],
    });

    const result = await chat.sendMessage(adaptPrompt);
    const responseText = result.response.text();

    // Parser la réponse JSON
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid JSON response from AI');
    }

    const adaptedContent = JSON.parse(jsonMatch[0]);

    // 6. Mettre à jour le produit dans Firestore
    await productRef.update({
      shortDescription: adaptedContent.shortDescription,
      longDescription: adaptedContent.longDescription,
      seoTitle: adaptedContent.seoTitle,
      tags: [...(product?.tags || []), adaptedContent.eventTag],
      lastAdaptedAt: new Date(),
      lastAdaptedEvent: eventName || 'événement',
    });

    // 7. Décrémenter les crédits
    await userRef.update({
      generationCredits: FieldValue.increment(-1),
    });

    return NextResponse.json({
      success: true,
      data: adaptedContent,
      creditsRemaining: creditsRemaining - 1,
      message: `Produit adapté pour ${eventName || 'l\'événement'} !`,
    });

  } catch (error) {
    console.error('[API /adapt] Error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'adaptation' },
      { status: 500 }
    );
  }
}
