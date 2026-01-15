// Public API for the calendar component
// Can be extracted as a separate npm package

// Main component
export { SimpleBigWeekView } from "./SimpleBigWeekView";

// Headless hook for overlap detection
export { useEventOverlap } from "./useEventOverlap";

// Types
export type {
  CalendarEvent,
  CalendarProps,
  CalendarConfig,
} from "./types";

// Utilities
export {
  completeWeek,
  generateWeek,
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
} from "./agendaUtils";
