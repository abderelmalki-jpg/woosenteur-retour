/**
 * Utilitaires pour l'export CSV
 */

export interface ProductForExport {
  name: string;
  brand: string;
  category: string;
  price: number;
  volume?: number;
  weight?: number;
  seoTitle: string;
  mainKeyword: string;
  shortDescription: string;
  longDescription: string;
  tags: string[];
  imageUrl?: string;
}

/**
 * Générer un CSV à partir de produits
 */
export function generateProductCSV(products: ProductForExport[]): string {
  const headers = [
    'Nom',
    'Marque',
    'Catégorie',
    'Prix (€)',
    'Contenance (ml)',
    'Poids (g)',
    'Titre SEO',
    'Mot-clé principal',
    'Description courte',
    'Description longue',
    'Tags',
    'URL Image',
  ];

  const rows = products.map(product => [
    product.name,
    product.brand,
    product.category,
    product.price.toString(),
    product.volume?.toString() || '',
    product.weight?.toString() || '',
    product.seoTitle,
    product.mainKeyword,
    product.shortDescription,
    product.longDescription.replace(/\n/g, ' ').replace(/"/g, '""'),
    product.tags.join('; '),
    product.imageUrl || '',
  ]);

  const csvContent = [
    headers.map(h => `"${h}"`).join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
  ].join('\n');

  return csvContent;
}

/**
 * Télécharger un CSV
 */
export function downloadCSV(content: string, filename: string = 'export-woosenteur.csv') {
  const blob = new Blob(['\ufeff' + content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Générer un CSV WooCommerce compatible
 */
export function generateWooCommerceCSV(products: ProductForExport[]): string {
  // Format WooCommerce Product CSV Import
  const headers = [
    'Type',
    'SKU',
    'Name',
    'Published',
    'Categories',
    'Tags',
    'Short description',
    'Description',
    'Regular price',
    'Weight (g)',
    'Images',
    'Meta: _woosenteur_seo_title',
    'Meta: _woosenteur_main_keyword',
  ];

  const rows = products.map((product, index) => [
    'simple',
    `WOOS-${Date.now()}-${index}`,
    product.name,
    '1',
    product.category,
    product.tags.join(', '),
    product.shortDescription,
    product.longDescription.replace(/\n/g, '<br>').replace(/"/g, '""'),
    product.price.toString(),
    product.weight?.toString() || '',
    product.imageUrl || '',
    product.seoTitle,
    product.mainKeyword,
  ]);

  const csvContent = [
    headers.map(h => `"${h}"`).join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
  ].join('\n');

  return csvContent;
}
