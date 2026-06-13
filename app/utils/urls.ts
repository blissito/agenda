/**
 * Utility functions for generating public URLs
 */

const PLATFORM_DOMAIN = "denik.me"
const TIGRIS_BUCKET = "easybits-public"

export const DEFAULT_OG_IMAGE = "https://i.imgur.com/zlnq8Jd.png"

/**
 * Formmy waitlist form — CTA de pre-lanzamiento ("Aparta tu lugar").
 * Reemplaza los antiguos CTAs de "Probar gratis" / "Crear cuenta" en las
 * rutas públicas mientras Denik está en pre-estreno.
 */
export const FORMMY_WAITLIST_URL =
  "https://www.formmy.app/preview/6a2b05f7c4c269b38adb14fb"

/**
 * Generates the public URL for an image stored in Tigris/S3
 * The bucket is public, so no signed URLs are needed.
 */
export function getPublicImageUrl(key?: string | null): string | undefined {
  if (!key) return undefined
  if (key.startsWith("http://") || key.startsWith("https://")) return key
  const path = key.startsWith("denik/") ? key : `denik/${key}`
  return `https://${TIGRIS_BUCKET}.fly.storage.tigris.dev/${path}`
}

/**
 * Generates the public URL for a service booking page
 * - Localhost: http://localhost:PORT/agenda/{orgSlug}/{serviceSlug}
 * - Production: https://{orgSlug}.denik.me/{serviceSlug}
 */
export function getServicePublicUrl(
  orgSlug: string,
  serviceSlug: string,
): string {
  if (typeof window !== "undefined") {
    const { hostname, port, protocol } = window.location
    const isLocalhost = hostname === "localhost" || hostname === "127.0.0.1"

    if (isLocalhost) {
      // In dev, use path-based route since subdomains don't work on localhost
      const portPart = port ? `:${port}` : ""
      return `${protocol}//${hostname}${portPart}/agenda/${orgSlug}/${serviceSlug}`
    }
  }

  // Production: use subdomain-based URL
  return `https://${orgSlug}.${PLATFORM_DOMAIN}/${serviceSlug}`
}

/**
 * Generates the public URL for an org's landing page
 * - Localhost: http://localhost:PORT/agenda/{orgSlug}
 * - Production: https://{orgSlug}.denik.me
 *
 * @param orgSlug - The org's slug
 * @param requestUrl - Optional request URL for server-side detection
 */
export function getOrgPublicUrl(orgSlug: string, requestUrl?: string): string {
  // Server-side detection via request URL
  if (requestUrl) {
    const url = new URL(requestUrl)
    const isLocalhost =
      url.hostname === "localhost" || url.hostname === "127.0.0.1"
    if (isLocalhost) {
      return `${url.protocol}//${url.host}/agenda/${orgSlug}`
    }
  }

  // Client-side detection
  if (typeof window !== "undefined") {
    const { hostname, port, protocol } = window.location
    const isLocalhost = hostname === "localhost" || hostname === "127.0.0.1"
    if (isLocalhost) {
      const portPart = port ? `:${port}` : ""
      return `${protocol}//${hostname}${portPart}/agenda/${orgSlug}`
    }
  }

  // Production: use subdomain-based URL
  return `https://${orgSlug}.${PLATFORM_DOMAIN}`
}
