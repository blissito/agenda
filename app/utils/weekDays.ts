/**
 * Centralized weekDays i18n dictionary.
 * DB and all logic use English keys. Spanish is only for UI display.
 */

export const WEEK_DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const

export type WeekDay = (typeof WEEK_DAYS)[number]

export const DAY_LABELS: Record<WeekDay, string> = {
  monday: "Lunes",
  tuesday: "Martes",
  wednesday: "Miércoles",
  thursday: "Jueves",
  friday: "Viernes",
  saturday: "Sábado",
  sunday: "Domingo",
}

export const DAY_LABELS_SHORT: Record<WeekDay, string> = {
  monday: "Lun",
  tuesday: "Mar",
  wednesday: "Mié",
  thursday: "Jue",
  friday: "Vie",
  saturday: "Sáb",
  sunday: "Dom",
}

export const DAY_LABELS_MIN: Record<WeekDay, string> = {
  monday: "Lu",
  tuesday: "Ma",
  wednesday: "Mi",
  thursday: "Ju",
  friday: "Vi",
  saturday: "Sa",
  sunday: "Do",
}

export const DEFAULT_WEEK_DAYS: Record<string, string[][]> = {
  monday: [["09:00", "18:00"]],
  tuesday: [["09:00", "18:00"]],
  wednesday: [["09:00", "18:00"]],
  thursday: [["09:00", "18:00"]],
  friday: [["09:00", "18:00"]],
}

/**
 * Map of ALL legacy Spanish variants to English day names.
 * Used by normalizeWeekDays() and the migration script.
 */
export const LEGACY_TO_ENGLISH: Record<string, WeekDay> = {
  // Standard Spanish with accents (from old TimesForm)
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
 * Idempotent helper: normalizes weekDays from any format to English keys.
 * If keys are already in English, returns as-is.
 * If keys are in any Spanish variant, converts to English.
 * Returns DEFAULT_WEEK_DAYS if input is empty/null and useDefault=true.
 */
export function normalizeWeekDays(
  weekDays: Record<string, any> | null | undefined,
  useDefaultIfEmpty = true,
): Record<string, any> {
  if (!weekDays || Object.keys(weekDays).length === 0) {
    return useDefaultIfEmpty ? { ...DEFAULT_WEEK_DAYS } : {}
  }

  const result: Record<string, any> = {}
  for (const [key, value] of Object.entries(weekDays)) {
    if (!value) continue

    // Already English?
    if (WEEK_DAYS.includes(key as WeekDay)) {
      result[key] = value
      continue
    }

    // Legacy Spanish variant?
    const englishKey = LEGACY_TO_ENGLISH[key]
    if (englishKey) {
      result[englishKey] = value
    }
  }

  if (Object.keys(result).length === 0 && useDefaultIfEmpty) {
    return { ...DEFAULT_WEEK_DAYS }
  }

  return result
}
