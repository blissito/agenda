/**
 * Simple in-memory rate limiter for auth endpoints.
 * For production with multiple instances, consider Redis-based solution.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (entry.resetAt < now) {
      store.delete(key);
    }
  }
}, 5 * 60 * 1000);

interface RateLimitConfig {
  /** Max requests allowed in the window */
  limit: number;
  /** Time window in seconds */
  windowSeconds: number;
}

interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * Check rate limit for a given key (usually IP or IP+action)
 */
export function checkRateLimit(
  key: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const windowMs = config.windowSeconds * 1000;

  let entry = store.get(key);

  // If no entry or window expired, create new entry
  if (!entry || entry.resetAt < now) {
    entry = {
      count: 1,
      resetAt: now + windowMs,
    };
    store.set(key, entry);
    return {
      success: true,
      remaining: config.limit - 1,
      resetAt: entry.resetAt,
    };
  }

  // Increment count
  entry.count++;

  // Check if over limit
  if (entry.count > config.limit) {
    return {
      success: false,
      remaining: 0,
      resetAt: entry.resetAt,
    };
  }

  return {
    success: true,
    remaining: config.limit - entry.count,
    resetAt: entry.resetAt,
  };
}

/**
 * Get client IP from request headers
 */
export function getClientIP(request: Request): string {
  // Check common proxy headers
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    // Take the first IP in the chain
    return forwardedFor.split(",")[0].trim();
  }

  const realIP = request.headers.get("x-real-ip");
  if (realIP) {
    return realIP;
  }

  // Fly.io specific
  const flyClientIP = request.headers.get("fly-client-ip");
  if (flyClientIP) {
    return flyClientIP;
  }

  // Fallback (won't work in production behind proxy)
  return "unknown";
}

// Preset configurations for different endpoints
export const rateLimitPresets = {
  /** Magic link requests: 5 per 15 minutes per IP */
  magicLink: {
    limit: 5,
    windowSeconds: 15 * 60,
  },
  /** General auth attempts: 10 per minute per IP */
  authGeneral: {
    limit: 10,
    windowSeconds: 60,
  },
  /** API requests: 100 per minute per IP */
  api: {
    limit: 100,
    windowSeconds: 60,
  },
} as const;

/**
 * Helper to create rate limit error response
 */
export function rateLimitResponse(resetAt: number) {
  const retryAfter = Math.ceil((resetAt - Date.now()) / 1000);
  return {
    success: false,
    error: {
      message: `Demasiados intentos. Por favor espera ${Math.ceil(retryAfter / 60)} minutos.`,
      retryAfter,
    },
    rateLimited: true,
  };
}
