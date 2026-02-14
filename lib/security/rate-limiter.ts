/**
 * Rate Limiting Implementation
 * =============================
 * 
 * Protège contre les attaques brute-force et les abus d'API.
 * Utilise une approche simple basée sur la mémoire (production devrait utiliser Redis).
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private store: Map<string, RateLimitEntry> = new Map();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Nettoyer les entrées expirées toutes les minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60000);
  }

  /**
   * Vérifie si une requête est autorisée
   */
  async check(
    identifier: string,
    options: {
      maxRequests: number;
      windowMs: number;
    }
  ): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    const now = Date.now();
    const entry = this.store.get(identifier);

    // Pas d'entrée ou entrée expirée
    if (!entry || now > entry.resetTime) {
      const newEntry: RateLimitEntry = {
        count: 1,
        resetTime: now + options.windowMs,
      };
      this.store.set(identifier, newEntry);
      
      return {
        allowed: true,
        remaining: options.maxRequests - 1,
        resetTime: newEntry.resetTime,
      };
    }

    // Incrémenter le compteur
    entry.count++;

    // Vérifier la limite
    if (entry.count > options.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime,
      };
    }

    return {
      allowed: true,
      remaining: options.maxRequests - entry.count,
      resetTime: entry.resetTime,
    };
  }

  /**
   * Réinitialise le compteur pour un identifier
   */
  reset(identifier: string): void {
    this.store.delete(identifier);
  }

  /**
   * Nettoie les entrées expirées
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.resetTime) {
        this.store.delete(key);
      }
    }
  }

  /**
   * Arrête le nettoyage automatique
   */
  destroy(): void {
    clearInterval(this.cleanupInterval);
  }
}

// Instance singleton
const rateLimiter = new RateLimiter();

// Présets de rate limiting
export const RATE_LIMIT_PRESETS = {
  // Authentification: 5 tentatives par 15 minutes
  AUTH: {
    maxRequests: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
  },
  // API générale: 100 requêtes par minute
  API: {
    maxRequests: 100,
    windowMs: 60 * 1000, // 1 minute
  },
  // Actions critiques: 10 par heure
  CRITICAL: {
    maxRequests: 10,
    windowMs: 60 * 60 * 1000, // 1 heure
  },
  // Recherche: 30 par minute
  SEARCH: {
    maxRequests: 30,
    windowMs: 60 * 1000, // 1 minute
  },
};

/**
 * Helper pour extraire l'identifiant de l'utilisateur d'une requête
 */
export function getRequestIdentifier(req: Request): string {
  // Utiliser l'IP comme identifiant de base
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0] : 
             req.headers.get("x-real-ip") || "unknown";
  
  return ip;
}

/**
 * Helper pour appliquer le rate limiting à une route API
 */
export async function applyRateLimit(
  req: Request,
  preset: keyof typeof RATE_LIMIT_PRESETS = "API",
  customIdentifier?: string
): Promise<{ success: boolean; error?: string; headers: Record<string, string> }> {
  const identifier = customIdentifier || getRequestIdentifier(req);
  const options = RATE_LIMIT_PRESETS[preset];
  
  const result = await rateLimiter.check(identifier, options);
  
  const headers = {
    "X-RateLimit-Limit": options.maxRequests.toString(),
    "X-RateLimit-Remaining": result.remaining.toString(),
    "X-RateLimit-Reset": new Date(result.resetTime).toISOString(),
  };
  
  if (!result.allowed) {
    const retryAfter = Math.ceil((result.resetTime - Date.now()) / 1000);
    return {
      success: false,
      error: `Trop de requêtes. Réessayez dans ${retryAfter} secondes.`,
      headers: {
        ...headers,
        "Retry-After": retryAfter.toString(),
      },
    };
  }
  
  return {
    success: true,
    headers,
  };
}

export { rateLimiter };
