/**
 * Calendar utility functions
 */

export interface Day {
  day: string;
  date: Date;
  meta?: Record<string, unknown>;
}

/**
 * Get the Monday of the week for a given date
 */
export const getMonday = (today: Date = new Date()): Date => {
  const d = new Date(today);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
};

/**
 * Get all 7 days of the week starting from the Monday of the given date
 */
export const completeWeek = (date: Date): Date[] => {
  const startDate = new Date(date);
  const day = startDate.getDay();
  const offset = day === 0 ? -6 : 1 - day; // Monday offset
  startDate.setDate(startDate.getDate() + offset);

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    return d;
  });
};

/**
 * Generate an array of hour strings (e.g., ["08:00", "09:00", ...])
 */
export const generateHours = ({
  fromHour,
  toHour,
}: {
  fromHour: number;
  toHour: number;
}): string[] => {
  return Array.from({ length: toHour - fromHour }, (_, index) => {
    const hour = fromHour + index;
    return hour < 10 ? `0${hour}:00` : `${hour}:00`;
  });
};

/**
 * Check if a date is today
 */
export const isToday = (date: Date): boolean => {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

/**
 * Check if two dates are the same day
 */
export const areSameDates = (d1: Date | null, d2: Date | null): boolean => {
  if (!d1 || !d2) return false;
  return (
    d1.getDate() === d2.getDate() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getFullYear() === d2.getFullYear()
  );
};

/**
 * Add days to a date
 */
export const addDaysToDate = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

/**
 * Add minutes to a date
 */
export const addMinutesToDate = (date: Date, mins: number): Date => {
  const result = new Date(date);
  result.setMinutes(result.getMinutes() + mins);
  return result;
};

/**
 * Convert minutes to time string (e.g., 120 -> "02:00")
 */
export const fromMinsToTimeString = (mins: number): string => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h < 10 ? "0" + h : h}:${m < 10 ? "0" + m : m}`;
};

/**
 * Convert minutes to locale time string
 */
export const fromMinsToLocaleTimeString = (
  mins: number,
  locale: string = "es-MX"
): string => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  const today = new Date();
  today.setHours(h, m, 0, 0);
  return today.toLocaleTimeString(locale);
};

/**
 * Format a date to locale time string
 */
export const fromDateToTimeString = (
  date: Date,
  locale: string = "es-MX"
): string => {
  return new Date(date).toLocaleTimeString(locale);
};

/**
 * Get all days in a month (including padding days for calendar grid)
 */
export const getDaysInMonth = (date: Date): Date[] => {
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  const numberOfMissing = 6 - lastDay.getDay();
  const leftOffset = firstDay.getDay();

  firstDay.setDate(firstDay.getDate() - leftOffset);

  const days: Date[] = [];
  days.push(new Date(firstDay));

  while (firstDay < lastDay) {
    firstDay.setDate(firstDay.getDate() + 1);
    days.push(new Date(firstDay));
  }

  for (let i = 0; i < numberOfMissing; i++) {
    firstDay.setDate(firstDay.getDate() + 1);
    days.push(new Date(firstDay));
  }

  return days;
};
