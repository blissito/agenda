/**
 * Utility functions for generating public URLs and data transformations
 */

const PLATFORM_DOMAIN = "denik.me"
const TIGRIS_BUCKET = "wild-bird-2039"

/**
 * Generates the public URL for an image stored in Tigris/S3
 * The bucket is public, so no signed URLs are needed.
 */
export function getPublicImageUrl(key?: string | null): string | undefined {
  if (!key) return undefined
  return `https://${TIGRIS_BUCKET}.fly.storage.tigris.dev/denik/${key}`
}

/**
 * Mapping from Spanish day names to English day names (UI)
 * Includes all variants: with accents, without accents, and Prisma schema names
 */
const SPANISH_TO_ENGLISH_DAYS: Record<string, string> = {
  // Standard Spanish with accents (from TimesForm)
  lunes: "monday",
  martes: "tuesday",
  miércoles: "wednesday",
  jueves: "thursday",
  viernes: "friday",
  sábado: "saturday",
  domingo: "sunday",
  // Prisma schema names (without accents, with underscore)
  mi_rcoles: "wednesday",
  s_bado: "saturday",
  // Without accents (just in case)
  miercoles: "wednesday",
  sabado: "saturday",
}

/**
 * Default weekDays (Mon-Fri 9:00-18:00) used when no schedule is configured
 */
const DEFAULT_WEEK_DAYS: Record<string, string[][]> = {
  monday: [["09:00", "18:00"]],
  tuesday: [["09:00", "18:00"]],
  wednesday: [["09:00", "18:00"]],
  thursday: [["09:00", "18:00"]],
  friday: [["09:00", "18:00"]],
}

/**
 * Converts weekDays object from Spanish keys to English keys
 * Used when loading data from DB to display in UI components
 * Returns default weekDays if none configured
 */
export function convertWeekDaysToEnglish(
  weekDays: Record<string, any> | null | undefined,
  useDefaultIfEmpty = true,
): Record<string, any> {
  if (!weekDays || Object.keys(weekDays).length === 0) {
    return useDefaultIfEmpty ? DEFAULT_WEEK_DAYS : {}
  }

  const converted: Record<string, any> = {}
  for (const [spanishDay, value] of Object.entries(weekDays)) {
    const englishDay = SPANISH_TO_ENGLISH_DAYS[spanishDay]
    if (englishDay && value) {
      converted[englishDay] = value
    }
  }

  // Return default if conversion resulted in empty object
  if (Object.keys(converted).length === 0 && useDefaultIfEmpty) {
    return DEFAULT_WEEK_DAYS
  }

  return converted
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
