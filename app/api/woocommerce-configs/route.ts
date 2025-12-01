/**
 * API Routes pour gérer les configurations WooCommerce
 * GET/POST/DELETE /api/woocommerce-configs
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth, db } from '@/lib/firebase/admin';

// Désactivé en mode Capacitor (export statique)
if (process.env.CAPACITOR_BUILD !== 'true') {
  exports.dynamic = 'force-dynamic';
}

interface WooCommerceConfigData {
  name: string;
  url: string;
  consumerKey: string;
  consumerSecret: string;
  isDefault: boolean;
  createdAt?: any;
  updatedAt?: any;
}

/**
 * GET - Récupérer toutes les configs de l'utilisateur
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await auth.verifyIdToken(token);
    const userId = decodedToken.uid;

    const configsRef = db.collection('users').doc(userId).collection('woocommerce-configs');
    const snapshot = await configsRef.get();

    const configs = snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
      // Masquer le secret (sécurité)
      consumerSecret: doc.data().consumerSecret ? '••••••••' : undefined,
    }));

    return NextResponse.json({
      success: true,
      data: configs,
    });

  } catch (error) {
    console.error('[GET /woocommerce-configs] Error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des configurations' },
      { status: 500 }
    );
  }
}

/**
 * POST - Créer ou modifier une config
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await auth.verifyIdToken(token);
    const userId = decodedToken.uid;

    const body = await request.json();
    const { id, name, url, consumerKey, consumerSecret, isDefault } = body;

    if (!name || !url || !consumerKey || !consumerSecret) {
      return NextResponse.json(
        { error: 'Données manquantes (name, url, consumerKey, consumerSecret requis)' },
        { status: 400 }
      );
    }

    const configsRef = db.collection('users').doc(userId).collection('woocommerce-configs');

    // Si isDefault, retirer le flag des autres configs
    if (isDefault) {
      const allConfigs = await configsRef.where('isDefault', '==', true).get();
      const batch = db.batch();
      allConfigs.docs.forEach((doc: any) => {
        batch.update(doc.ref, { isDefault: false });
      });
      await batch.commit();
    }

    const configData: WooCommerceConfigData = {
      name,
      url,
      consumerKey,
      consumerSecret,
      isDefault: isDefault || false,
      updatedAt: new Date(),
    };

    let configId: string;

    if (id) {
      // Mise à jour
      await configsRef.doc(id).update(configData);
      configId = id;
    } else {
      // Création
      configData.createdAt = new Date();
      const docRef = await configsRef.add(configData);
      configId = docRef.id;
    }

    return NextResponse.json({
      success: true,
      configId,
      message: id ? 'Configuration mise à jour' : 'Configuration créée',
    });

  } catch (error) {
    console.error('[POST /woocommerce-configs] Error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la sauvegarde de la configuration' },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Supprimer une config
 */
export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await auth.verifyIdToken(token);
    const userId = decodedToken.uid;

    const { searchParams } = new URL(request.url);
    const configId = searchParams.get('id');

    if (!configId) {
      return NextResponse.json(
        { error: 'ID de configuration manquant' },
        { status: 400 }
      );
    }

    const configRef = db.collection('users').doc(userId).collection('woocommerce-configs').doc(configId);
    await configRef.delete();

    return NextResponse.json({
      success: true,
      message: 'Configuration supprimée',
    });

  } catch (error) {
    console.error('[DELETE /woocommerce-configs] Error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression' },
      { status: 500 }
    );
  }
}
