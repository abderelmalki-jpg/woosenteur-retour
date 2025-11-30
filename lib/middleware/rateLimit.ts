/**
 * Rate Limiting Middleware
 * Protection contre l'abus d'API avec cache en mémoire
 */

import { NextRequest, NextResponse } from 'next/server';

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// Cache en mémoire (pour démo - utiliser Redis/Vercel KV en prod)
const rateLimitCache = new Map<string, RateLimitEntry>();

// Nettoyage toutes les 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitCache.entries()) {
    if (now > entry.resetTime) {
      rateLimitCache.delete(key);
    }
  }
}, 5 * 60 * 1000);

export interface RateLimitConfig {
  maxRequests: number;     // Nombre max de requêtes
  windowMs: number;        // Fenêtre de temps (millisecondes)
  message?: string;        // Message d'erreur personnalisé
  skipAuth?: boolean;      // Skip pour utilisateurs authentifiés
}

const DEFAULT_CONFIG: RateLimitConfig = {
  maxRequests: 10,
  windowMs: 60 * 1000, // 1 minute
  message: 'Trop de requêtes. Veuillez réessayer dans quelques instants.',
};

/**
 * Crée un middleware de rate limiting
 */
export function createRateLimiter(config: Partial<RateLimitConfig> = {}) {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  return async (req: NextRequest): Promise<NextResponse | null> => {
    // Identifier le client (IP ou user ID)
    const identifier = getClientIdentifier(req);
    const now = Date.now();

    // Récupérer l'entrée du cache
    let entry = rateLimitCache.get(identifier);

    // Créer nouvelle entrée si expirée ou inexistante
    if (!entry || now > entry.resetTime) {
      entry = {
        count: 0,
        resetTime: now + finalConfig.windowMs,
      };
      rateLimitCache.set(identifier, entry);
    }

    // Incrémenter le compteur
    entry.count++;

    // Vérifier limite
    if (entry.count > finalConfig.maxRequests) {
      const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
      return NextResponse.json(
        { 
          success: false, 
          error: finalConfig.message,
          retryAfter 
        },
        { 
          status: 429,
          headers: {
            'Retry-After': retryAfter.toString(),
            'X-RateLimit-Limit': finalConfig.maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': entry.resetTime.toString(),
          }
        }
      );
    }

    // Tout est bon - ajouter headers informatifs
    const remaining = finalConfig.maxRequests - entry.count;
    return null; // Continue la requête
  };
}

/**
 * Extrait l'identifiant du client (IP ou user token)
 */
function getClientIdentifier(req: NextRequest): string {
  // Essayer le token d'auth d'abord
  const authHeader = req.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    return `user:${token.substring(0, 20)}`; // Hash du token
  }

  // Fallback sur IP
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0] || 
             req.headers.get('x-real-ip') || 
             'unknown';
  
  return `ip:${ip}`;
}

/**
 * Helper pour vérifier rate limit sans bloquer
 */
export function checkRateLimit(
  identifier: string,
  config: Partial<RateLimitConfig> = {}
): { allowed: boolean; remaining: number; resetTime: number } {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const now = Date.now();
  const entry = rateLimitCache.get(identifier);

  if (!entry || now > entry.resetTime) {
    return {
      allowed: true,
      remaining: finalConfig.maxRequests - 1,
      resetTime: now + finalConfig.windowMs,
    };
  }

  const allowed = entry.count < finalConfig.maxRequests;
  const remaining = Math.max(0, finalConfig.maxRequests - entry.count);

  return {
    allowed,
    remaining,
    resetTime: entry.resetTime,
  };
}

/**
 * Reset manuel du rate limit pour un identifiant
 */
export function resetRateLimit(identifier: string): void {
  rateLimitCache.delete(identifier);
}
