// Transform week days between Spanish with accents (frontend) and Spanish without accents (Prisma/DB)

const DAYS_MAP = {
  // Spanish with accents to Spanish without accents (for Prisma)
  lunes: "lunes",
  martes: "martes",
  miércoles: "mi_rcoles", // miércoles → mi_rcoles
  jueves: "jueves",
  viernes: "viernes",
  sábado: "s_bado", // sábado → s_bado
  domingo: "domingo",
} as const

const DAYS_MAP_REVERSE = {
  // Spanish without accents to Spanish with accents (for frontend)
  lunes: "lunes",
  martes: "martes",
  mi_rcoles: "miércoles",
  jueves: "jueves",
  viernes: "viernes",
  s_bado: "sábado",
  domingo: "domingo",
} as const

type SpanishDayWithAccent = keyof typeof DAYS_MAP
type SpanishDayWithoutAccent = keyof typeof DAYS_MAP_REVERSE

/**
 * Convert Spanish day names with accents to without accents for Prisma
 * @param weekDays Object with Spanish day names (with accents) as keys
 * @returns Object with Spanish day names (without accents) as keys
 */
export function spanishToEnglish<T>(
  weekDays: Record<string, T>,
): Record<string, T> {
  const result: Record<string, T> = {}

  for (const [key, value] of Object.entries(weekDays)) {
    const noAccentKey = DAYS_MAP[key as SpanishDayWithAccent]
    if (noAccentKey) {
      result[noAccentKey] = value
    }
  }

  return result
}

/**
 * Convert Spanish day names without accents to with accents for frontend
 * @param weekDays Object with Spanish day names (without accents) as keys
 * @returns Object with Spanish day names (with accents) as keys
 */
export function englishToSpanish<T>(
  weekDays: Record<string, T>,
): Record<string, T> {
  const result: Record<string, T> = {}

  for (const [key, value] of Object.entries(weekDays)) {
    const withAccentKey = DAYS_MAP_REVERSE[key as SpanishDayWithoutAccent]
    if (withAccentKey) {
      result[withAccentKey] = value
    }
  }

  return result
}
