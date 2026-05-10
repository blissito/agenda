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

/**
 * Calcula la ventana horaria [hoursStart, hoursEnd] para mostrar en el calendario,
 * basada en los horarios de trabajo de la org. La ventana arranca a la hora de
 * apertura más temprana y termina 1 hora después del cierre más tardío.
 *
 * - Acepta cualquier formato de weekDays (Spanish/English) — se normaliza internamente.
 * - Cada día puede tener varios rangos `[["09:00", "13:00"], ["15:00", "18:00"]]`.
 * - Si no hay datos válidos, regresa el default `[8, 21]`.
 */
export function computeCalendarHoursRange(
  weekDays: Record<string, any> | null | undefined,
  defaultRange: [number, number] = [8, 21],
): [number, number] {
  const normalized = normalizeWeekDays(weekDays, false)
  let earliest = Number.POSITIVE_INFINITY
  let latest = Number.NEGATIVE_INFINITY

  for (const ranges of Object.values(normalized)) {
    if (!Array.isArray(ranges)) continue
    for (const range of ranges) {
      if (!Array.isArray(range) || range.length < 2) continue
      const [openStr, closeStr] = range
      const open = parseTimeToHours(openStr)
      const close = parseTimeToHours(closeStr)
      if (open !== null && open < earliest) earliest = open
      if (close !== null && close > latest) latest = close
    }
  }

  if (!Number.isFinite(earliest) || !Number.isFinite(latest)) {
    return defaultRange
  }

  const start = Math.max(0, Math.floor(earliest))
  const end = Math.min(24, Math.ceil(latest) + 1)
  if (end <= start) return defaultRange
  return [start, end]
}

function parseTimeToHours(value: unknown): number | null {
  if (typeof value !== "string") return null
  const [h, m] = value.split(":").map(Number)
  if (!Number.isFinite(h) || !Number.isFinite(m)) return null
  return h + m / 60
}

const DAY_BY_INDEX: WeekDay[] = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
]

/**
 * Devuelve true si el bloque horario `[hour, hour+1)` está dentro de algún
 * rango de apertura del día indicado. Se considera abierto si existe un rango
 * `[open, close]` tal que `open <= hour && hour < close` (los rangos de cierre
 * exclusivos: si cierras 13:00, la fila "13:00" se marca cerrada).
 */
export function isHourOpen(
  weekDays: Record<string, any> | null | undefined,
  date: Date,
  hour: number,
): boolean {
  const normalized = normalizeWeekDays(weekDays, false)
  const dayKey = DAY_BY_INDEX[date.getDay()]
  const ranges = normalized[dayKey]
  if (!Array.isArray(ranges) || ranges.length === 0) return false
  for (const range of ranges) {
    if (!Array.isArray(range) || range.length < 2) continue
    const open = parseTimeToHours(range[0])
    const close = parseTimeToHours(range[1])
    if (open === null || close === null) continue
    if (open <= hour && hour < close) return true
  }
  return false
}
