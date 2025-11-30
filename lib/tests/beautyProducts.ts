/**
 * Tests produits beauté pour validation IA
 * Produits réels pour tester le pipeline 7 étapes
 */

export interface TestProduct {
  name: string;
  brand: string;
  category: string;
  expectedConfidence: number;
  notes?: string;
}

/**
 * Suite de tests avec produits iconiques
 */
export const beautySampleProducts: TestProduct[] = [
  // Parfums iconiques
  {
    name: 'Sauvage',
    brand: 'Dior',
    category: 'Parfums',
    expectedConfidence: 95,
    notes: 'Parfum masculin best-seller mondial',
  },
  {
    name: 'Chanel N°5',
    brand: 'Chanel',
    category: 'Parfums',
    expectedConfidence: 100,
    notes: 'Parfum féminin iconique le plus célèbre',
  },
  {
    name: 'La Vie Est Belle',
    brand: 'Lancôme',
    category: 'Parfums',
    expectedConfidence: 95,
    notes: 'Parfum gourmand féminin populaire',
  },
  {
    name: 'Black Opium',
    brand: 'Yves Saint Laurent',
    category: 'Parfums',
    expectedConfidence: 95,
    notes: 'Parfum oriental vanillé',
  },
  {
    name: 'Acqua di Giò',
    brand: 'Giorgio Armani',
    category: 'Parfums',
    expectedConfidence: 95,
    notes: 'Parfum aquatique masculin',
  },

  // Tests fuzzy matching (fautes courantes)
  {
    name: 'Jador',
    brand: 'Dior',
    category: 'Parfums',
    expectedConfidence: 85,
    notes: 'Faute orthographe: J\'adore → Jador (doit corriger)',
  },
  {
    name: 'Savage',
    brand: 'Dior',
    category: 'Parfums',
    expectedConfidence: 85,
    notes: 'Faute orthographe anglaise: Sauvage → Savage',
  },

  // Tests marques mal orthographiées
  {
    name: 'Yara',
    brand: 'Lattafa',
    category: 'Parfums',
    expectedConfidence: 90,
    notes: 'Marque orientale populaire (parfum dupes)',
  },
  {
    name: 'Hypnotic Poison',
    brand: 'Christian Dior',
    category: 'Parfums',
    expectedConfidence: 95,
    notes: 'Dior vs Christian Dior (même marque)',
  },

  // Cosmétiques
  {
    name: 'Teint Idole Ultra Wear',
    brand: 'Lancôme',
    category: 'Cosmétiques',
    expectedConfidence: 95,
    notes: 'Fond de teint best-seller',
  },
  {
    name: 'Rouge Dior',
    brand: 'Dior',
    category: 'Cosmétiques',
    expectedConfidence: 95,
    notes: 'Rouge à lèvres iconique',
  },

  // Soins
  {
    name: 'Crème de la Mer',
    brand: 'La Mer',
    category: 'Soins',
    expectedConfidence: 100,
    notes: 'Crème de luxe emblématique',
  },
  {
    name: 'Génifique',
    brand: 'Lancôme',
    category: 'Soins',
    expectedConfidence: 95,
    notes: 'Sérum anti-âge populaire',
  },

  // Tests confiance basse (produits inexistants)
  {
    name: 'Parfum XYZ 2099',
    brand: 'MarqueInconnue',
    category: 'Parfums',
    expectedConfidence: 30,
    notes: 'Produit fictif, doit retourner score <60',
  },
];

/**
 * Résultat de test
 */
export interface TestResult {
  product: TestProduct;
  actual: {
    confidenceScore: number;
    correctedBrand?: string;
    correctedProductName?: string;
    message?: string;
  };
  success: boolean;
  duration: number;
}

/**
 * Runner de tests
 */
export async function runBeautyProductTests(
  apiEndpoint: string = '/api/generate',
  authToken?: string
): Promise<TestResult[]> {
  const results: TestResult[] = [];

  for (const product of beautySampleProducts) {
    const startTime = Date.now();

    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          productName: product.name,
          brand: product.brand,
          category: product.category,
        }),
      });

      const data = await response.json();
      const duration = Date.now() - startTime;

      const confidenceScore = data.data?.confidenceScore || 0;
      const success = Math.abs(confidenceScore - product.expectedConfidence) <= 15; // Marge 15%

      results.push({
        product,
        actual: {
          confidenceScore,
          correctedBrand: data.data?.correctedBrand,
          correctedProductName: data.data?.correctedProductName,
          message: data.data?.message,
        },
        success,
        duration,
      });

      console.log(`✅ Test: ${product.name} by ${product.brand} - Score: ${confidenceScore}% (attendu: ${product.expectedConfidence}%)`);

    } catch (error) {
      const duration = Date.now() - startTime;
      results.push({
        product,
        actual: {
          confidenceScore: 0,
          message: `Error: ${error instanceof Error ? error.message : 'Unknown'}`,
        },
        success: false,
        duration,
      });

      console.error(`❌ Test failed: ${product.name} - ${error}`);
    }
  }

  return results;
}

/**
 * Générer un rapport de tests
 */
export function generateTestReport(results: TestResult[]): string {
  const totalTests = results.length;
  const passedTests = results.filter(r => r.success).length;
  const failedTests = totalTests - passedTests;
  const avgDuration = results.reduce((sum, r) => sum + r.duration, 0) / totalTests;
  const avgConfidence = results.reduce((sum, r) => sum + r.actual.confidenceScore, 0) / totalTests;

  return `
📊 **WooSenteur AI Test Report**
================================

Tests exécutés: ${totalTests}
✅ Réussis: ${passedTests} (${((passedTests / totalTests) * 100).toFixed(1)}%)
❌ Échecs: ${failedTests}

⏱️  Temps moyen: ${avgDuration.toFixed(0)}ms
🎯 Score confiance moyen: ${avgConfidence.toFixed(1)}%

Détails:
${results.map(r => `
- ${r.product.name} (${r.product.brand})
  Score: ${r.actual.confidenceScore}% | Attendu: ${r.product.expectedConfidence}%
  ${r.actual.correctedProductName ? `Correction: ${r.actual.correctedProductName}` : ''}
  ${r.success ? '✅' : '❌'} ${r.duration}ms
`).join('\n')}
  `.trim();
}
