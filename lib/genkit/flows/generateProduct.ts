/**
 * Flow pour la génération de fiches produits
 * Pipeline de validation en 7 étapes avec Gemini AI
 */

import { geminiModel, DEFAULT_GENERATION_CONFIG } from '../config';
import { ProductInputSchema, ProductOutputSchema, type ProductInput, type ProductOutput } from '../types/product';
import { SYSTEM_PROMPT, PRODUCT_GENERATION_PROMPT } from '../prompts/system';
import { searchBeautyProduct } from '@/lib/utils/customSearch';

/**
 * Génération de fiche produit avec Gemini
 */
export async function generateProductFlow(input: ProductInput): Promise<ProductOutput> {
  console.log('[generateProduct] Starting with input:', input);

  // Validation de l'input
  ProductInputSchema.parse(input);

  // ÉTAPE 1: Normalisation
  const normalizedInput = {
    productName: input.productName.trim(),
    brand: input.brand.trim(),
    category: input.category,
  };

  console.log('[generateProduct] Normalized input:', normalizedInput);

  // ÉTAPE 2: Vérification web
  console.log('[generateProduct] Web verification...');
  
  const searchQuery = `${normalizedInput.productName} ${normalizedInput.brand}`;
  let searchContext = '';
  
  try {
    const webSearchResult = await searchBeautyProduct(searchQuery);
    
    if (webSearchResult.found) {
      searchContext = `
RÉSULTAT DE RECHERCHE WEB :
- Produit trouvé : OUI
- Score confiance : ${webSearchResult.confidence}%
- Source : ${webSearchResult.source}
- Extrait : ${webSearchResult.snippet}
`;
    } else {
      searchContext = `
RÉSULTAT DE RECHERCHE WEB : Aucun résultat trouvé.
ATTENTION : Appliquer fuzzy matching et baisser score de confiance.
`;
    }
  } catch (error) {
    console.warn('[generateProduct] Web search disabled:', error);
    searchContext = '\nRecherche web désactivée. Se baser sur la base de connaissances interne.';
  }

  // Construction du prompt
  const prompt = `${PRODUCT_GENERATION_PROMPT
    .replace('{{productName}}', normalizedInput.productName)
    .replace('{{brand}}', normalizedInput.brand)
    .replace('{{category}}', normalizedInput.category)}

${searchContext}

Réponds UNIQUEMENT avec un objet JSON valide selon le schéma défini.`;

  try {
    // Appel à Gemini
    const chat = geminiModel.startChat({
      generationConfig: DEFAULT_GENERATION_CONFIG,
      history: [
        {
          role: 'user',
          parts: [{ text: SYSTEM_PROMPT }],
        },
        {
          role: 'model',
          parts: [{ text: 'Compris. Je suis prêt à générer des fiches produits beauté selon le pipeline en 7 étapes.' }],
        },
      ],
    });

    const result = await chat.sendMessage(prompt);
    const response = result.response;
    const content = response.text();

    console.log('[generateProduct] AI response received');

    // Parser le JSON
    let jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Format de réponse invalide de l\'IA');
    }

    const output = JSON.parse(jsonMatch[0]) as ProductOutput;

    // Valider la sortie
    ProductOutputSchema.parse(output);

    // Ajouter message par défaut
    if (!output.message) {
      if (output.confidenceScore >= 85) {
        output.message = `✅ Fiche produit générée avec haute confiance`;
      } else if (output.confidenceScore >= 60) {
        output.message = `⚠️ Informations probables, vérification recommandée`;
      } else {
        output.message = `❌ Confiance insuffisante, clarification nécessaire`;
      }
    }

    console.log('[generateProduct] Success! Confidence:', output.confidenceScore);

    return output;

  } catch (error) {
    console.error('[generateProduct] Error:', error);
    
    return {
      seoTitle: `${normalizedInput.brand} ${normalizedInput.productName}`,
      shortDescription: 'Erreur lors de la génération. Veuillez réessayer.',
      longDescription: 'Une erreur est survenue lors de la génération du contenu.',
      mainKeyword: normalizedInput.productName.toLowerCase(),
      suggestedCategory: normalizedInput.category,
      confidenceScore: 0,
      message: `Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
    };
  }
}

/**
 * Helper: Vérifier si confirmation nécessaire
 */
export function requiresUserConfirmation(output: ProductOutput): boolean {
  return output.confidenceScore < 60;
}

/**
 * Helper: Message selon score
 */
export function getConfidenceMessage(score: number): string {
  if (score >= 85) return '✅ Fiche produit générée avec haute confiance';
  if (score >= 60) return '⚠️ Informations probables, vérification recommandée';
  return '❌ Confiance insuffisante, clarification nécessaire';
}
