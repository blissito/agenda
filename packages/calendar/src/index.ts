// Main component
export { Calendar, SimpleBigWeekView } from "./Calendar";

// Headless hook for calendar events management
export { useCalendarEvents, useEventOverlap } from "./useCalendarEvents";

// Types
export type {
  CalendarEvent,
  CalendarProps,
  CalendarConfig,
  ColumnHeaderProps,
} from "./types";

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
