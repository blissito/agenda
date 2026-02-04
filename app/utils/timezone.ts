/**
 * Timezone utilities for multi-country support
 * Supported countries: México, España, Perú, Colombia, Argentina
 */

export const SUPPORTED_TIMEZONES = [
  { value: "America/Mexico_City", label: "México/Ciudad_de_México", offset: -6 },
  { value: "Europe/Madrid", label: "España/Madrid", offset: 1 },
  { value: "America/Lima", label: "Perú/Lima", offset: -5 },
  { value: "America/Bogota", label: "Colombia/Bogotá", offset: -5 },
  { value: "America/Argentina/Buenos_Aires", label: "Argentina/Buenos_Aires", offset: -3 },
] as const;

export type SupportedTimezone = (typeof SUPPORTED_TIMEZONES)[number]["value"];

export const DEFAULT_TIMEZONE: SupportedTimezone = "America/Mexico_City";

/**
 * Format a date in a specific timezone
 */
export function formatTimeInTimezone(
  date: Date,
  timezone: string,
  options: Intl.DateTimeFormatOptions = {}
): string {
  return date.toLocaleString("es-MX", {
    timeZone: timezone,
    ...options,
  });
}

/**
 * Format just the time (HH:MM) in a specific timezone
 * Uses formatToParts for consistent output format across locales
 */
export function formatTimeOnly(date: Date, timezone: string): string {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const parts = formatter.formatToParts(date);
  const hour = parts.find((p) => p.type === "hour")?.value || "00";
  const minute = parts.find((p) => p.type === "minute")?.value || "00";
  return `${hour}:${minute}`;
}

/**
 * Get date formatted for display in a specific timezone
 */
export function formatDateInTimezone(
  date: Date,
  timezone: string,
  options: Intl.DateTimeFormatOptions = {
    month: "long",
    day: "numeric",
    year: "numeric",
  }
): string {
  return date.toLocaleString("es-MX", {
    timeZone: timezone,
    ...options,
  });
}

/**
 * Get full date and time formatted for display
 */
export function formatFullDateInTimezone(date: Date, timezone: string): string {
  return date.toLocaleString("es-MX", {
    timeZone: timezone,
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

/**
 * Get the timezone offset in hours for a given timezone
 * Note: This is approximate and doesn't account for DST
 */
export function getTimezoneOffset(timezone: string): number {
  const tz = SUPPORTED_TIMEZONES.find((t) => t.value === timezone);
  return tz?.offset ?? -6; // Default to Mexico City offset
}

/**
 * Get timezone label for display
 */
export function getTimezoneLabel(timezone: string): string {
  const tz = SUPPORTED_TIMEZONES.find((t) => t.value === timezone);
  return tz?.label ?? timezone;
}

/**
 * Check if a timezone is supported
 */
export function isValidTimezone(timezone: string): timezone is SupportedTimezone {
  return SUPPORTED_TIMEZONES.some((t) => t.value === timezone);
}

/**
 * Convert a time string (HH:MM) to a Date object in a specific timezone
 * The date part is taken from the baseDate parameter
 * Handles DST correctly by using Intl API
 */
export function createDateInTimezone(
  timeString: string,
  baseDate: Date,
  timezone: string
): Date {
  const [hours, minutes] = timeString.split(":").map(Number);

  // Get the date in the target timezone
  const dateStr = baseDate.toLocaleDateString("en-CA", { timeZone: timezone });
  const [year, month, day] = dateStr.split("-").map(Number);

  // Create an ISO string for the target date/time and parse it as if it were in that timezone
  // We do this by finding the UTC offset for that specific moment in that timezone
  const targetDateTimeStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}T${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00`;

  // Create a rough date to get the actual offset at that moment (handles DST)
  const roughDate = new Date(targetDateTimeStr);

  // Get the offset by comparing local representation in target timezone vs UTC
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  // Binary search to find the correct UTC time that displays as our target in the timezone
  // Start with a guess and adjust
  let guess = new Date(`${targetDateTimeStr}Z`); // Start assuming UTC

  for (let i = 0; i < 3; i++) {
    const parts = formatter.formatToParts(guess);
    const guessHour = Number(parts.find((p) => p.type === "hour")?.value);
    const guessMinute = Number(parts.find((p) => p.type === "minute")?.value);
    const guessDay = Number(parts.find((p) => p.type === "day")?.value);

    const hourDiff = hours - guessHour;
    const minuteDiff = minutes - guessMinute;
    const dayDiff = day - guessDay;

    if (hourDiff === 0 && minuteDiff === 0 && dayDiff === 0) break;

    guess = new Date(
      guess.getTime() +
        dayDiff * 24 * 60 * 60 * 1000 +
        hourDiff * 60 * 60 * 1000 +
        minuteDiff * 60 * 1000
    );
  }

  return guess;
}

/**
 * Get the current time in a specific timezone as HH:MM string
 */
export function getCurrentTimeInTimezone(timezone: string): string {
  return formatTimeOnly(new Date(), timezone);
}

/**
 * Check if a time slot has already passed today in the given timezone
 */
export function isTimePassed(timeString: string, timezone: string): boolean {
  const currentTime = getCurrentTimeInTimezone(timezone);
  return timeString < currentTime;
}

/**
 * Get today's date at midnight in a specific timezone
 */
export function getTodayInTimezone(timezone: string): Date {
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-CA", { timeZone: timezone });
  return new Date(dateStr + "T00:00:00");
}

/**
 * Format a time string (HH:MM) to 12h format with am/pm
 * @example formatTime12h("09:00") => "9:00 am"
 * @example formatTime12h("14:30") => "2:30 pm"
 */
export function formatTime12h(timeString: string): string {
  const [hours, minutes] = timeString.split(":").map(Number);
  const period = hours >= 12 ? "pm" : "am";
  const hour12 = hours % 12 || 12;
  return `${hour12}:${minutes.toString().padStart(2, "0")} ${period}`;
}

/**
 * Convert a time slot from one timezone to another
 * @param timeString - Time in HH:MM format (e.g., "09:00")
 * @param date - The date for the slot (needed for DST calculations)
 * @param fromTimezone - Source timezone (e.g., "America/Mexico_City")
 * @param toTimezone - Target timezone (e.g., "Europe/Madrid")
 * @returns Object with converted time and whether it's on the same day
 */
export function convertTimeSlot(
  timeString: string,
  date: Date,
  fromTimezone: string,
  toTimezone: string
): { time: string; sameDay: boolean; dayOffset: number } {
  const [hours, minutes] = timeString.split(":").map(Number);

  // Create a date string in the source timezone
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();

  // Create date in source timezone
  const sourceDate = new Date(year, month, day, hours, minutes);

  // Get the time in source timezone as ISO string components
  const sourceFormatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: fromTimezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  // Get the time in target timezone
  const targetFormatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: toTimezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  // Parse source parts
  const sourceParts = sourceFormatter.formatToParts(sourceDate);
  const sourceDay = Number(sourceParts.find(p => p.type === "day")?.value);

  // Parse target parts
  const targetParts = targetFormatter.formatToParts(sourceDate);
  const targetDay = Number(targetParts.find(p => p.type === "day")?.value);
  const targetHour = targetParts.find(p => p.type === "hour")?.value || "00";
  const targetMinute = targetParts.find(p => p.type === "minute")?.value || "00";

  const dayOffset = targetDay - sourceDay;

  return {
    time: `${targetHour}:${targetMinute}`,
    sameDay: dayOffset === 0,
    dayOffset,
  };
}

/**
 * Convert an array of time slots from org timezone to user timezone
 */
export function convertTimeSlotsToTimezone(
  slots: string[],
  date: Date,
  orgTimezone: string,
  userTimezone: string
): string[] {
  if (orgTimezone === userTimezone) return slots;

  return slots
    .map(slot => {
      const converted = convertTimeSlot(slot, date, orgTimezone, userTimezone);
      // Only include slots that are on the same day
      if (!converted.sameDay) return null;
      return converted.time;
    })
    .filter((slot): slot is string => slot !== null)
    .sort();
}
