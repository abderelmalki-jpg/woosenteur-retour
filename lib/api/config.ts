/**
 * Configuration API pour WooSenteur
 * Gère les URLs API selon l'environnement (dev/prod/mobile)
 */

// URLs Cloud Functions Firebase
const FIREBASE_FUNCTIONS_URL = 'https://us-central1-woosenteur-app.cloudfunctions.net/generateProduct';

/**
 * URL de l'API de génération
 * - En production/mobile: Cloud Function Firebase
 * - En dev local: API route Next.js
 */
export const API_GENERATE_URL = 
  process.env.NODE_ENV === 'production' || typeof window !== 'undefined'
    ? FIREBASE_FUNCTIONS_URL
    : '/api/generate';

/**
 * Headers communs pour les requêtes API
 */
export function getApiHeaders(token?: string): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}

/**
 * Gérer les erreurs API de manière uniforme
 */
export function handleApiError(error: unknown): string {
  if (error instanceof Response) {
    return `Erreur ${error.status}: ${error.statusText}`;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'Une erreur est survenue';
}
