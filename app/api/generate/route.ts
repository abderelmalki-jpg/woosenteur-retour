/**
 * API Route pour la génération de fiches produits
 * POST /api/generate
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateProductFlow, requiresUserConfirmation } from '@/lib/genkit/flows/generateProduct';
import { auth, db } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(request: NextRequest) {
  try {
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
      console.error('[API /generate] Auth error:', error);
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
          message: 'Vous avez épuisé vos crédits de génération. Passez à un plan supérieur.',
        },
        { status: 403 }
      );
    }

    // 3. Parser l'input
    const body = await request.json();
    const { productName, brand, category } = body;

    if (!productName || !brand || !category) {
      return NextResponse.json(
        { error: 'Paramètres manquants (productName, brand, category requis)' },
        { status: 400 }
      );
    }

    // 4. Appeler le flow Gemini
    console.log('[API /generate] Calling generateProductFlow...');
    
    const result = await generateProductFlow({
      productName,
      brand,
      category,
    });

    console.log('[API /generate] Flow completed with confidence:', result.confidenceScore);

    // 5. Décrémenter les crédits (sauf si score < 60 et nécessite confirmation)
    if (!requiresUserConfirmation(result)) {
      await userRef.update({
        generationCredits: FieldValue.increment(-1),
      });
      console.log('[API /generate] Credit consumed. Remaining:', creditsRemaining - 1);
    }

    // 6. Retourner le résultat
    return NextResponse.json({
      success: true,
      data: result,
      creditsRemaining: requiresUserConfirmation(result) ? creditsRemaining : creditsRemaining - 1,
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
