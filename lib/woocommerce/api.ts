/**
 * Utilitaires pour l'export WooCommerce
 * REST API v3
 */

import WooCommerceRestApi from '@woocommerce/woocommerce-rest-api';

export interface WooCommerceConfig {
  url: string;
  consumerKey: string;
  consumerSecret: string;
}

export interface WooCommerceProduct {
  name: string;
  type: 'simple';
  regular_price: string;
  description: string;
  short_description: string;
  categories: Array<{ id?: number; name: string }>;
  images: Array<{ src: string; alt?: string }>;
  tags: Array<{ name: string }>;
  weight?: string;
  meta_data?: Array<{ key: string; value: string }>;
}

/**
 * Créer une instance WooCommerce API
 */
export function createWooCommerceClient(config: WooCommerceConfig) {
  return new WooCommerceRestApi({
    url: config.url,
    consumerKey: config.consumerKey,
    consumerSecret: config.consumerSecret,
    version: 'wc/v3',
  });
}

/**
 * Exporter un produit vers WooCommerce
 */
export async function exportToWooCommerce(
  config: WooCommerceConfig,
  product: WooCommerceProduct
): Promise<{ success: boolean; productId?: number; error?: string }> {
  try {
    const api = createWooCommerceClient(config);

    const response = await api.post('products', product);

    return {
      success: true,
      productId: response.data.id,
    };
  } catch (error: any) {
    console.error('[WooCommerce Export] Error:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Erreur inconnue',
    };
  }
}

/**
 * Exporter plusieurs produits en batch
 */
export async function batchExportToWooCommerce(
  config: WooCommerceConfig,
  products: WooCommerceProduct[]
): Promise<{ success: number; failed: number; errors: string[] }> {
  const results = {
    success: 0,
    failed: 0,
    errors: [] as string[],
  };

  for (const product of products) {
    const result = await exportToWooCommerce(config, product);
    
    if (result.success) {
      results.success++;
    } else {
      results.failed++;
      results.errors.push(`${product.name}: ${result.error}`);
    }
  }

  return results;
}

/**
 * Tester la connexion WooCommerce
 */
export async function testWooCommerceConnection(
  config: WooCommerceConfig
): Promise<{ success: boolean; message: string }> {
  try {
    const api = createWooCommerceClient(config);
    await api.get('products', { per_page: 1 });

    return {
      success: true,
      message: 'Connexion réussie à WooCommerce',
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Échec de la connexion',
    };
  }
}
