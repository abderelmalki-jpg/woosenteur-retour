import { NextRequest, NextResponse } from 'next/server';
import { auth, db } from '@/lib/firebase/admin';

/**
 * API pour récupérer la configuration WooCommerce admin
 * Accessible uniquement aux superadmin
 */
export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decodedToken = await auth.verifyIdToken(token);
    const userId = decodedToken.uid;

    // Vérifier que l'utilisateur est superadmin
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data();

    if (!userData || userData.role !== 'superadmin') {
      return NextResponse.json({ error: 'Accès refusé - Réservé aux superadmin' }, { status: 403 });
    }

    // Récupérer la config depuis .env.local
    const config = {
      url: process.env.ADMIN_WOOCOMMERCE_URL || '',
      consumerKey: process.env.ADMIN_WOOCOMMERCE_CONSUMER_KEY || '',
      consumerSecret: process.env.ADMIN_WOOCOMMERCE_CONSUMER_SECRET || '',
    };

    // Vérifier que la config existe
    if (!config.url || !config.consumerKey || !config.consumerSecret) {
      return NextResponse.json({ 
        success: false, 
        message: 'Configuration admin WooCommerce non définie dans .env.local' 
      });
    }

    console.log('✅ Configuration admin WooCommerce récupérée pour:', userData.email);

    return NextResponse.json({
      success: true,
      config,
    });
  } catch (error: any) {
    console.error('❌ Erreur récupération config admin:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
