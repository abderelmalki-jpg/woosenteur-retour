/**
 * API Route pour l'export WooCommerce
 * POST /api/export/woocommerce
 */

import { NextRequest, NextResponse } from 'next/server';
import { exportToWooCommerce, testWooCommerceConnection, type WooCommerceConfig, type WooCommerceProduct } from '@/lib/woocommerce/api';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { config, products, testOnly } = body;

    if (!config || !config.url || !config.consumerKey || !config.consumerSecret) {
      return NextResponse.json(
        { error: 'Configuration WooCommerce manquante' },
        { status: 400 }
      );
    }

    const wooConfig: WooCommerceConfig = {
      url: config.url,
      consumerKey: config.consumerKey,
      consumerSecret: config.consumerSecret,
    };

    // Test de connexion uniquement
    if (testOnly) {
      const result = await testWooCommerceConnection(wooConfig);
      return NextResponse.json(result);
    }

    // Export de produits
    if (!products || !Array.isArray(products) || products.length === 0) {
      return NextResponse.json(
        { error: 'Aucun produit à exporter' },
        { status: 400 }
      );
    }

    const results = [];
    
    for (const product of products) {
      const wooProduct: WooCommerceProduct = {
        name: product.name,
        type: 'simple',
        regular_price: product.price?.toString() || '0',
        description: product.longDescription || '',
        short_description: product.shortDescription || '',
        categories: [{ name: product.category }],
        images: product.imageUrl ? [{ src: product.imageUrl, alt: product.name }] : [],
        tags: product.tags?.map((tag: string) => ({ name: tag })) || [],
        weight: product.weight?.toString(),
        meta_data: [
          { key: '_woosenteur_seo_title', value: product.seoTitle || '' },
          { key: '_woosenteur_main_keyword', value: product.mainKeyword || '' },
          { key: '_woosenteur_confidence_score', value: product.confidenceScore?.toString() || '0' },
        ],
      };

      const result = await exportToWooCommerce(wooConfig, wooProduct);
      results.push({
        productName: product.name,
        ...result,
      });
    }

    const successCount = results.filter(r => r.success).length;
    const failedCount = results.filter(r => !r.success).length;

    return NextResponse.json({
      success: failedCount === 0,
      message: `${successCount} produit(s) exporté(s), ${failedCount} échec(s)`,
      results,
    });

  } catch (error) {
    console.error('[API /export/woocommerce] Error:', error);
    
    return NextResponse.json(
      {
        error: 'Erreur serveur',
        message: error instanceof Error ? error.message : 'Erreur inconnue',
      },
      { status: 500 }
    );
  }
}
