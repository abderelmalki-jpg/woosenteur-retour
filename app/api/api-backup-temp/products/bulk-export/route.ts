/**
 * API Route pour export en masse (CSV ou WooCommerce)
 * POST /api/products/bulk-export
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth, db } from '@/lib/firebase/admin';
import { generateProductCSV, generateWooCommerceCSV } from '@/lib/utils/csv';
import { exportToWooCommerce, type WooCommerceConfig } from '@/lib/woocommerce/api';

export const dynamic = 'force-dynamic';

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
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    // 2. Parser la requête
    const { productIds, exportType, woocommerceConfig } = await request.json();

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json(
        { error: 'Aucun produit sélectionné' },
        { status: 400 }
      );
    }

    if (!['csv', 'woocommerce'].includes(exportType)) {
      return NextResponse.json(
        { error: 'Type d\'export invalide' },
        { status: 400 }
      );
    }

    // 3. Récupérer les produits depuis Firestore
    const products = [];
    const productsRef = db.collection('users').doc(userId).collection('products');

    for (const productId of productIds) {
      try {
        const productDoc = await productsRef.doc(productId).get();
        if (productDoc.exists) {
          products.push({
            id: productDoc.id,
            ...productDoc.data(),
          });
        }
      } catch (error) {
        console.error(`Error fetching product ${productId}:`, error);
      }
    }

    if (products.length === 0) {
      return NextResponse.json(
        { error: 'Aucun produit trouvé' },
        { status: 404 }
      );
    }

    // 4. Export selon le type
    if (exportType === 'csv') {
      const csvContent = generateWooCommerceCSV(products);
      return NextResponse.json({
        success: true,
        data: csvContent,
        count: products.length,
        message: `${products.length} produit(s) exporté(s) en CSV`,
      });
    }

    if (exportType === 'woocommerce') {
      if (!woocommerceConfig) {
        return NextResponse.json(
          { error: 'Configuration WooCommerce manquante' },
          { status: 400 }
        );
      }

      const results = [];
      let successCount = 0;
      let failureCount = 0;

      for (const product of products) {
        try {
          const result = await exportToWooCommerce(woocommerceConfig, product);
          results.push({
            productId: product.id,
            productName: product.name || product.productName,
            success: result.success,
            wooProductId: result.productId,
          });

          if (result.success) {
            successCount++;
            // Mettre à jour Firestore avec le tag 'exported'
            await productsRef.doc(product.id).update({
              tags: [...(product.tags || []), 'exported'],
              woocommerceId: result.productId,
            });
          } else {
            failureCount++;
          }
        } catch (error) {
          failureCount++;
          results.push({
            productId: product.id,
            productName: product.name || product.productName,
            success: false,
            error: error instanceof Error ? error.message : 'Erreur inconnue',
          });
        }
      }

      return NextResponse.json({
        success: successCount > 0,
        message: `${successCount} produit(s) exporté(s), ${failureCount} échec(s)`,
        results,
        stats: {
          total: products.length,
          success: successCount,
          failure: failureCount,
        },
      });
    }

    return NextResponse.json(
      { error: 'Type d\'export non géré' },
      { status: 400 }
    );

  } catch (error) {
    console.error('[API /bulk-export] Error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'export en masse' },
      { status: 500 }
    );
  }
}
