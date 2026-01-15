// Main component
export { Calendar, SimpleBigWeekView } from "./Calendar";

// Controls component
export { CalendarControls } from "./CalendarControls";
export type { CalendarControlsProps } from "./CalendarControls";

// Headless hooks
export { useCalendarEvents, useEventOverlap } from "./useCalendarEvents";
export { useCalendarControls } from "./useCalendarControls";
export type {
  CalendarView,
  CalendarControls as CalendarControlsState,
  UseCalendarControlsOptions,
} from "./useCalendarControls";

// Types
export type {
  CalendarEvent,
  CalendarProps,
  CalendarConfig,
  ColumnHeaderProps,
  Resource,
  EventParticipant,
  EventColorPreset,
  EventColors,
  TimeDisplayConfig,
  ParticipantsDisplayConfig,
  EventRenderProps,
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
