// Main component
export { Calendar, SimpleBigWeekView } from "./Calendar";

// Headless hook for overlap detection
export { useEventOverlap } from "./useEventOverlap";

// Types
export type { CalendarEvent, CalendarProps, CalendarConfig } from "./types";

// Utilities
export {
  completeWeek,
  generateHours,
  getMonday,
  isToday,
  areSameDates,
  addDaysToDate,
  addMinutesToDate,
  fromMinsToTimeString,
  fromMinsToLocaleTimeString,
  fromDateToTimeString,
  getDaysInMonth,
} from "./utils";

// Hooks
export { useClickOutside, formatDate } from "./hooks";
