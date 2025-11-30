/**
 * Google Custom Search API - Recherche ciblée sur Notino & Fragrantica
 * Utilisé pour l'étape 2 du pipeline : Vérification d'existence multi-niveaux
 */

interface SearchResult {
  title: string;
  link: string;
  snippet: string;
  displayLink: string;
}

interface CustomSearchResponse {
  items?: SearchResult[];
  searchInformation?: {
    totalResults: string;
  };
}

/**
 * Recherche un produit beauté sur les sites de référence (Notino, Fragrantica)
 * @param query - Nom du produit + marque (ex: "La Vie Est Belle Lancôme")
 * @returns Tableau de résultats avec score de confiance
 */
export async function searchBeautyProduct(query: string): Promise<{
  found: boolean;
  confidence: number;
  source?: string;
  url?: string;
  snippet?: string;
}> {
  const apiKey = process.env.GOOGLE_CUSTOM_SEARCH_API_KEY;
  const searchEngineId = process.env.GOOGLE_CUSTOM_SEARCH_ENGINE_ID;

  // Vérification des clés API
  if (!apiKey || apiKey === 'your_api_key_here') {
    console.warn('⚠️ GOOGLE_CUSTOM_SEARCH_API_KEY non configurée - recherche web désactivée');
    return { found: false, confidence: 0 };
  }

  if (!searchEngineId || searchEngineId === 'your_search_engine_id_here') {
    console.warn('⚠️ GOOGLE_CUSTOM_SEARCH_ENGINE_ID non configuré - recherche web désactivée');
    return { found: false, confidence: 0 };
  }

  try {
    // Nettoie la requête (supprime caractères spéciaux, normalise)
    const cleanQuery = query
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    // Appel à l'API Google Custom Search
    const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${searchEngineId}&q=${encodeURIComponent(cleanQuery)}&num=5`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error('Erreur API Custom Search:', response.status, response.statusText);
      return { found: false, confidence: 0 };
    }

    const data: CustomSearchResponse = await response.json();

    // Aucun résultat trouvé
    if (!data.items || data.items.length === 0) {
      return { found: false, confidence: 0 };
    }

    // Analyse des résultats pour calculer le score de confiance
    const firstResult = data.items[0];
    const totalResults = parseInt(data.searchInformation?.totalResults || '0');

    // Calcul du score de confiance basé sur :
    // 1. Présence de résultats (30 points)
    // 2. Nombre de résultats trouvés (20 points)
    // 3. Pertinence du titre (30 points)
    // 4. Source fiable (Notino/Fragrantica) (20 points)
    
    let confidence = 30; // Base pour avoir au moins 1 résultat

    // Bonus selon le nombre de résultats
    if (totalResults > 10) confidence += 20;
    else if (totalResults > 5) confidence += 15;
    else if (totalResults > 0) confidence += 10;

    // Bonus si le titre contient les mots-clés de la requête
    const queryWords = cleanQuery.split(' ');
    const titleWords = firstResult.title.toLowerCase();
    const matchingWords = queryWords.filter(word => word.length > 2 && titleWords.includes(word));
    confidence += Math.min((matchingWords.length / queryWords.length) * 30, 30);

    // Bonus pour source fiable
    if (firstResult.displayLink.includes('notino.') || 
        firstResult.displayLink.includes('fragrantica.')) {
      confidence += 20;
    }

    // Cap à 100
    confidence = Math.min(Math.round(confidence), 100);

    return {
      found: true,
      confidence,
      source: firstResult.displayLink,
      url: firstResult.link,
      snippet: firstResult.snippet
    };

  } catch (error) {
    console.error('Erreur lors de la recherche Custom Search:', error);
    return { found: false, confidence: 0 };
  }
}

/**
 * Recherche spécifique pour vérifier l'existence d'une marque
 * @param brandName - Nom de la marque (ex: "Lancôme")
 */
export async function verifyBrandExists(brandName: string): Promise<boolean> {
  const result = await searchBeautyProduct(`${brandName} parfum cosmétique marque`);
  return result.found && result.confidence >= 60;
}

/**
 * Recherche de la pyramide olfactive d'un parfum sur Fragrantica
 * @param productName - Nom du parfum
 * @param brandName - Nom de la marque
 */
export async function searchOlfactoryPyramid(productName: string, brandName: string): Promise<{
  found: boolean;
  notes?: {
    top?: string[];
    heart?: string[];
    base?: string[];
  };
}> {
  const result = await searchBeautyProduct(`${productName} ${brandName} fragrantica pyramide olfactive notes`);
  
  if (!result.found || !result.source?.includes('fragrantica')) {
    return { found: false };
  }

  // TODO: Parser le snippet pour extraire les notes (nécessite scraping avancé)
  // Pour l'instant, retourne juste la confirmation d'existence
  return { 
    found: true,
    notes: {} // À implémenter avec un parser HTML ou API Fragrantica si disponible
  };
}
