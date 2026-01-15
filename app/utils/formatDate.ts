/**
 * Date formatting utilities with timezone support.
 * Default timezone: America/Mexico_City (for Mexican businesses)
 */

const DEFAULT_TIMEZONE = "America/Mexico_City";

interface FormatOptions {
  timezone?: string;
  includeTime?: boolean;
  includeYear?: boolean;
}

/**
 * Format a date for display in emails and UI (server-safe)
 */
export function formatDateForDisplay(
  date: Date | string,
  options: FormatOptions = {}
): string {
  const { timezone = DEFAULT_TIMEZONE, includeTime = true, includeYear = true } = options;

  const d = new Date(date);

  const dateOptions: Intl.DateTimeFormatOptions = {
    timeZone: timezone,
    day: "numeric",
    month: "long",
    ...(includeYear && { year: "numeric" }),
    ...(includeTime && {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }),
  };

  return d.toLocaleDateString("es-MX", dateOptions);
}

/**
 * Format date for short display (e.g., "15 ene 2025, 3:00 pm")
 */
export function formatDateShort(
  date: Date | string,
  timezone: string = DEFAULT_TIMEZONE
): string {
  const d = new Date(date);

  return d.toLocaleDateString("es-MX", {
    timeZone: timezone,
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

/**
 * Format time only (e.g., "3:00 pm")
 */
export function formatTimeOnly(
  date: Date | string,
  timezone: string = DEFAULT_TIMEZONE
): string {
  const d = new Date(date);

  return d.toLocaleTimeString("es-MX", {
    timeZone: timezone,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

/**
 * Get current date in specified timezone
 */
export function getNowInTimezone(timezone: string = DEFAULT_TIMEZONE): Date {
  const nowStr = new Date().toLocaleString("en-US", { timeZone: timezone });
  return new Date(nowStr);
}

export { DEFAULT_TIMEZONE };
