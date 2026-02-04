// Public API for the calendar component
// Can be extracted as a separate npm package

// Utilities
export {
  addDaysToDate,
  addMinutesToDate,
  areSameDates,
  completeWeek,
  fromDateToTimeString,
  fromMinsToLocaleTimeString,
  fromMinsToTimeString,
  generateHours,
  generateWeek,
  getDaysInMonth,
  getMonday,
  isToday,
} from "./agendaUtils"
// Main component
export { SimpleBigWeekView } from "./SimpleBigWeekView"

// Types
export type {
  CalendarConfig,
  CalendarEvent,
  CalendarProps,
} from "./types"
// Headless hook for overlap detection
export { useEventOverlap } from "./useEventOverlap"
