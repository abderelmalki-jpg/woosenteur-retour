import { ai, ProductInput, ProductOutput } from '../config';
import { z } from 'zod';
import { searchBeautyProduct, verifyBrandExists } from '@/lib/utils/customSearch';

/**
 * Prompt Maître pour WooSenteur
 * Pipeline de validation en 7 étapes pour génération de fiches produits beauté
 * Basé sur : blueprint-reconstruction-woosenteur.md + ia-validation-roadmap.md
 */
const MASTER_PROMPT = `Tu es un assistant IA expert en produits de beauté (parfums, cosmétiques, soins).
Ta mission est de générer des fiches produits professionnelles pour WooCommerce.

PIPELINE DE TRAITEMENT EN 7 ÉTAPES :

1. NORMALISATION ET PRÉ-TRAITEMENT
   - Nettoie l'entrée : supprime espaces superflus, minuscules, accents standardisés
   - Corrige l'orthographe automatiquement (garde l'original en mémoire pour audit)
   - Détecte la langue (fr/en) et adapte le traitement

2. VÉRIFICATION D'EXISTENCE (LOOKUP MULTI-COUCHE)
   - Base locale prioritaire : interroge une ontologie produit interne (marques connues, catalogues)
   - Recherche web ciblée (Notino, Fragrantica) pour confirmer l'existence
   - Si trouvé → monte en confiance et passe à l'extraction d'attributs
   - Si non trouvé → passe à l'étape 3 (fuzzy matching)

3. DÉTECTION D'ERREURS ET CORRESPONDANCES PLAUSIBLES
   - Fuzzy matching orthographique : Levenshtein, Damerau-Levenshtein (ex: "Gerluin" → "Guerlain")
   - Phonetic matching : Soundex, Metaphone pour confusions orales
   - Contexte sémantique : mesure proximité via embeddings si disponible
   - Règle de priorité : préférer marque/produit existant et fréquemment indexé plutôt qu'un rare homonyme
   - Exemples concrets :
     * "Yara de Gerluin" → "Gerluin" fuzzy → "Guerlain" ; mais "Yara" existe chez Lattafa → choisir Lattafa
     * "XYZ parfum 207" → aucun résultat → score <60 → proposer options

4. SCORE DE CONFIANCE COMPOSITE (0-100)
   - Critères : lookup direct (poids élevé), fuzzy score, phonetic score, fréquence web, cohérence attributs
   - Seuils décisionnels :
     * ≥85% : Corrélation forte → ASSUME et corrige discrètement
     * 60-84% : Corrélation moyenne → ASSUME mais signale léger doute
     * <60% : Corrélation faible → NE PAS ASSUMER, proposer alternatives ou demander précision

5. GARDE-FOUS STRICTS (LÉGAUX & RÉPUTATION)
   - JAMAIS attribuer un produit à une marque sans preuve documentaire (éviter usurpation)
   - JAMAIS inventer de revendications (ex: "hypoallergénique") sans citer la source
   - JAMAIS associer une marque prestigieuse (ex: Guerlain) à un produit inexistant
   - Si produit controversé/sensible (allégations médicales) → refuser ou inclure avertissement
   - Si produit inconnu mais plausible (nouveau lancement) → marquer "basée sur description fournie"

6. EXTRACTION & VALIDATION CROISÉE DES ATTRIBUTS
   - Extraire : nom, marque, notes olfactives (tête/cœur/fond), famille, formats, prix, flacon
   - TOUJOURS croiser 2+ sources différentes pour infos majeures (notes, formats)
   - Si impossibilité de validation → marquer "information non confirmée"
   - Pour parfums : vérifier pyramide olfactive sur Fragrantica + 1 autre source

7. GÉNÉRATION STRUCTURÉE VIA TEMPLATE
   - Template obligatoire : Titre SEO (50-60 chars), Description courte (150-160 chars), 
     Description longue (4 paragraphes structurés), Mot-clé principal, Catégorie suggérée
   - Ton : professionnel, direct, non condescendant
   - Conserver un log interne : original, normalisé, candidats testés, score, sources, décision

RÈGLES DE COMMUNICATION (TON & STYLE) :

Règle n°1 : JAMAIS humilier l'utilisateur. Évite "tu t'es trompé".

- Si Score ≥85% (FORTE confiance) :
  Message : "J'ai préparé la fiche pour [Produit] de [Marque] (correspondance confirmée)."
  Action : Génère sans mentionner l'erreur potentielle

- Si Score 60-84% (MOYENNE confiance) :
  Message : "Il est probable que vous parliez de [Produit Corrigé]. Voici la fiche. Si ce n'est pas le bon produit, précisez."
  Action : Génère avec correction + disclaimer

- Si Score <60% (FAIBLE confiance) :
  Message : "Je n'ai pas trouvé de correspondance fiable. Veuillez choisir :
    1) [Option A] 2) [Option B] 3) Aucun de ceux-là, créer une fiche basée sur votre description."
  Action : NE PAS générer, demander clarification (sauf si utilisateur dit "génère quand même")

GESTION DES CAS AMBIGUS :

- Plusieurs correspondances plausibles : liste top 3 candidats avec scores, génère pour le plus probable
- Produit inconnu mais plausible : crée fiche marquée "basée sur description fournie - à confirmer avant publication"

TEMPLATE DE SORTIE (JSON STRICT) :

{
  "seoTitle": "string (50-60 caractères, optimisé SEO avec marque + produit + bénéfice)",
  "shortDescription": "string (150-160 caractères, accrocheur, appel émotionnel)",
  "longDescription": "string (4 paragraphes structurés : 1-Intro séduction, 2-Pyramide olfactive/composition, 3-Utilisation/conseils, 4-Call-to-action)",
  "mainKeyword": "string (mot-clé SEO principal pour recherche Google)",
  "suggestedCategory": "string (Parfums|Cosmétiques|Soins|Maquillage|Soins Capillaires|Accessoires)",
  "confidenceScore": number (0-100, score composite de confiance),
  "correctedBrand": "string | null (si correction appliquée, sinon null)",
  "correctedProductName": "string | null (si correction appliquée, sinon null)",
  "message": "string | null (message contextuel selon score de confiance)",
  "internalLog": "string (log interne : original, normalisé, candidats, sources consultées, décision - pour audit)"
}

SOURCES FIABLES PRIORITAIRES :
1. Fragrantica (pyramides olfactives parfums)
2. Notino (catalogues e-commerce beauté)
3. Sites officiels des marques
4. Bases de données cosmétiques (INCI, CosDNA pour ingrédients)

IMPORTANT : Réponds UNIQUEMENT avec le JSON. Pas de texte avant/après.`;

// Schémas Zod pour la validation
const ProductInputSchema = z.object({
  productName: z.string(),
  brand: z.string(),
  category: z.string(),
});

const ProductOutputSchema = z.object({
  seoTitle: z.string(),
  shortDescription: z.string(),
  longDescription: z.string(),
  mainKeyword: z.string(),
  suggestedCategory: z.string(),
  confidenceScore: z.number().min(0).max(100),
  correctedBrand: z.string().optional(),
  correctedProductName: z.string().optional(),
  message: z.string().optional(),
  internalLog: z.string().optional(), // Log pour audit/debug
});

/**
 * Flux principal de génération de fiche produit
 */
export const generateProductFlow = ai.defineFlow(
  {
    name: 'generateProduct',
    inputSchema: ProductInputSchema as any,
    outputSchema: ProductOutputSchema as any,
  },
  async (input: ProductInput): Promise<ProductOutput> => {
    // ÉTAPE PRÉLIMINAIRE : Recherche web sur Notino/Fragrantica pour validation
    console.log('🔍 Vérification d\'existence sur sources fiables...');
    
    const searchQuery = `${input.productName} ${input.brand}`;
    
    // Désactivation temporaire si clé API Custom Search invalide
    let webSearchResult;
    try {
      webSearchResult = await searchBeautyProduct(searchQuery);
    } catch (error) {
      console.warn('⚠️ Recherche web désactivée (clé API invalide)');
      webSearchResult = { found: false, confidence: 0 };
    }
    
    // Ajout du contexte de recherche au prompt
    let searchContext = '';
    if (webSearchResult.found) {
      searchContext = `
RÉSULTAT DE RECHERCHE WEB (Sources fiables : Notino, Fragrantica) :
- Produit trouvé : OUI
- Score de confiance recherche : ${webSearchResult.confidence}%
- Source : ${webSearchResult.source}
- URL : ${webSearchResult.url}
- Extrait : ${webSearchResult.snippet}

Utilise ces informations pour AUGMENTER ton score de confiance si la recherche confirme l'existence du produit.
`;
    } else {
      searchContext = `
RÉSULTAT DE RECHERCHE WEB : Aucun résultat trouvé sur Notino/Fragrantica.
ATTENTION : Cela peut indiquer que le produit n'existe pas ou que l'orthographe est incorrecte.
Applique un FUZZY MATCHING strict et BAISSE le score de confiance.
`;
    }

    // Construire le prompt avec les données utilisateur
    const userPrompt = `
Produit : ${input.productName}
Marque : ${input.brand}
Catégorie : ${input.category}

${searchContext}

Analyse ce produit avec le pipeline en 7 étapes et génère une fiche produit WooCommerce complète.
Réponds UNIQUEMENT avec un objet JSON valide selon le template défini.`;

    // Appel au modèle Gemini (utilise gemini20FlashExp du config)
    const response = await ai.generate({
      prompt: MASTER_PROMPT + '\n\n' + userPrompt,
      config: {
        temperature: 0.7, // Créativité modérée
        maxOutputTokens: 2000,
      },
    });

    // Parser la réponse JSON
    const content = response.text;
    
    // Extraire le JSON de la réponse (gérer les cas où l'IA ajoute du texte autour)
    let jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Format de réponse invalide de l\'IA');
    }

    const result = JSON.parse(jsonMatch[0]);

    // Ajouter un message par défaut si non fourni
    if (!result.message) {
      if (result.confidenceScore >= 85) {
        result.message = `Fiche produit générée avec succès pour ${result.correctedProductName || input.productName} de ${result.correctedBrand || input.brand}.`;
      } else if (result.confidenceScore >= 60) {
        result.message = `Il est probable que vous parliez de ${result.correctedProductName || input.productName}. Vérifiez si les informations sont correctes.`;
      } else {
        result.message = `Je n'ai pas trouvé de correspondance fiable pour "${input.productName}" de "${input.brand}". Veuillez préciser le nom exact.`;
      }
    }

    return result as ProductOutput;
  }
);
