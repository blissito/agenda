import * as react_jsx_runtime from 'react/jsx-runtime';
import { ReactNode, RefObject } from 'react';

/**
 * Resource definition for day/resource view mode
 * Use this to represent courts, rooms, employees, etc.
 */
interface Resource {
    /** Unique identifier for the resource */
    id: string;
    /** Display name */
    name: string;
    /** Optional icon/avatar */
    icon?: ReactNode;
}
/**
 * Participant/attendee for an event
 */
interface EventParticipant {
    /** Unique identifier */
    id: string;
    /** Display name (shown on hover/tooltip) */
    name?: string;
    /** Avatar URL */
    avatar?: string;
    /** Fallback color for initials when no avatar */
    avatarColor?: string;
}
/**
 * Color presets for events
 */
type EventColorPreset = "blue" | "green" | "orange" | "pink" | "purple" | "red" | "yellow" | "gray";
/**
 * Custom color mapping for presets
 */
interface EventColors {
    blue?: string;
    green?: string;
    orange?: string;
    pink?: string;
    purple?: string;
    red?: string;
    yellow?: string;
    gray?: string;
    default?: string;
}
/**
 * Time display configuration
 */
interface TimeDisplayConfig {
    /** Show time on all events by default */
    enabled?: boolean;
    /** Time format: "12h" or "24h" */
    format?: "12h" | "24h";
    /** Custom formatter function */
    formatter?: (start: Date, end: Date, locale: string) => string;
}
/**
 * Participants display configuration
 */
interface ParticipantsDisplayConfig {
    /** Maximum avatars to show before "+N" (default: 4) */
    maxVisible?: number;
    /** Avatar size in pixels (default: 20) */
    size?: number;
}
/**
 * Props passed to custom column header renderer
 * Use this to build custom headers for resources (courts, rooms, employees, etc.)
 */
interface ColumnHeaderProps {
    /** The date for this column */
    date: Date;
    /** Column index */
    index: number;
    /** Whether this column represents today */
    isToday: boolean;
    /** The configured locale */
    locale: string;
    /** Resource data (only in resource mode) */
    resource?: Resource;
}
/**
 * Generic calendar event - decoupled from any ORM
 */
interface CalendarEvent {
    id: string;
    start: Date;
    duration: number;
    title?: string | null;
    type?: "BLOCK" | "EVENT";
    service?: {
        name: string;
    } | null;
    /** Resource ID for day/resource view (court, room, etc.) */
    resourceId?: string;
    /**
     * Event color - can be a preset, tailwind class, or hex color
     * @example "green" | "bg-emerald-500" | "#10B981"
     */
    color?: EventColorPreset | string;
    /**
     * Event participants/attendees with avatars
     */
    participants?: EventParticipant[];
    /**
     * Whether to show time range on the event card (overrides config)
     */
    showTime?: boolean;
}
/**
 * Props passed to custom event renderer
 */
interface EventRenderProps {
    event: CalendarEvent;
    /** Computed time string (e.g., "8:00 - 9:30am") */
    timeString: string;
    /** Computed background color class */
    colorClass: string;
    /** Is event being dragged */
    isDragging: boolean;
    /** Click handler */
    onClick: () => void;
}
/**
 * Calendar configuration options
 */
interface CalendarConfig {
    /** Start hour for the calendar grid (default: 0) */
    hoursStart?: number;
    /** End hour for the calendar grid (default: 24) */
    hoursEnd?: number;
    /** Locale for date formatting (default: "es-MX") */
    locale?: string;
    /** Custom icons for the calendar UI */
    icons?: {
        trash?: ReactNode;
        edit?: ReactNode;
        close?: ReactNode;
    };
    /**
     * Custom renderer for column headers.
     * Use this to display resources (courts, rooms, employees) instead of weekdays.
     *
     * @example
     * // Padel courts
     * renderColumnHeader: ({ index }) => <span>Court {index + 1}</span>
     *
     * @example
     * // With custom styling
     * renderColumnHeader: ({ date, isToday }) => (
     *   <div className={isToday ? "font-bold" : ""}>
     *     {date.toLocaleDateString("en", { weekday: "short" })}
     *   </div>
     * )
     */
    renderColumnHeader?: (props: ColumnHeaderProps) => ReactNode;
    /**
     * Custom color mapping for presets
     */
    colors?: EventColors;
    /**
     * Configure time display on events
     * @example { enabled: true, format: "12h" }
     */
    eventTime?: TimeDisplayConfig;
    /**
     * Configure participant avatars display
     * @example { maxVisible: 3, size: 24 }
     */
    participants?: ParticipantsDisplayConfig;
    /**
     * Custom event renderer for complete control
     */
    renderEvent?: (props: EventRenderProps) => ReactNode;
}
/**
 * Calendar component props
 */
interface CalendarProps {
    /** Current date to display (defaults to today) */
    date?: Date;
    /** Array of events to display */
    events?: CalendarEvent[];
    /**
     * Resources for day/resource view mode.
     * When provided, columns represent resources instead of weekdays.
     * Events are filtered by date and grouped by resourceId.
     *
     * @example
     * resources={[
     *   { id: "court-1", name: "Cancha 1", icon: <PadelIcon /> },
     *   { id: "court-2", name: "Cancha 2", icon: <PadelIcon /> },
     * ]}
     */
    resources?: Resource[];
    /** Callback when an event is clicked */
    onEventClick?: (event: CalendarEvent) => void;
    /** Callback when an event is moved via drag & drop */
    onEventMove?: (eventId: string, newStart: Date) => Promise<void> | void;
    /** Callback when a block is added */
    onAddBlock?: (start: Date) => Promise<void> | void;
    /** Callback when a block is removed */
    onRemoveBlock?: (eventId: string) => Promise<void> | void;
    /** Callback when creating a new event */
    onNewEvent?: (start: Date) => void;
    /** Configuration options */
    config?: CalendarConfig;
}

declare function Calendar({ date, events, resources, onEventClick, onNewEvent, onEventMove, onAddBlock, onRemoveBlock, config, }: CalendarProps): react_jsx_runtime.JSX.Element;

type CalendarView = "week" | "day";
interface UseCalendarControlsOptions {
    /** Initial date (default: today) */
    initialDate?: Date;
    /** Initial view mode (default: "week") */
    initialView?: CalendarView;
    /** Locale for date formatting (default: "es-MX") */
    locale?: string;
}
interface CalendarControls$1 {
    /** Current date */
    date: Date;
    /** Current view mode */
    view: CalendarView;
    /** Week days array (Mon-Sun) */
    week: Date[];
    /** Formatted label for current date/week */
    label: string;
    /** Navigate to today */
    goToToday: () => void;
    /** Navigate to previous period (week or day) */
    goToPrev: () => void;
    /** Navigate to next period (week or day) */
    goToNext: () => void;
    /** Toggle between week and day view */
    toggleView: () => void;
    /** Set specific date */
    setDate: (date: Date) => void;
    /** Set specific view */
    setView: (view: CalendarView) => void;
    /** Check if current date is today */
    isToday: boolean;
}
/**
 * Hook for calendar navigation controls
 *
 * @example
 * const controls = useCalendarControls();
 *
 * <button onClick={controls.goToToday}>HOY</button>
 * <button onClick={controls.goToPrev}>←</button>
 * <button onClick={controls.goToNext}>→</button>
 * <span>{controls.label}</span>
 *
 * <Calendar
 *   date={controls.date}
 *   resources={controls.view === "day" ? courts : undefined}
 * />
 */
declare function useCalendarControls(options?: UseCalendarControlsOptions): CalendarControls$1;

interface CalendarControlsProps {
    /** Controls from useCalendarControls hook */
    controls: CalendarControls$1;
    /** Custom "Today" button label */
    todayLabel?: string;
    /** Custom "Week" label */
    weekLabel?: string;
    /** Custom "Day" label */
    dayLabel?: string;
    /** Show view toggle (default: true) */
    showViewToggle?: boolean;
    /** Custom prev icon */
    prevIcon?: ReactNode;
    /** Custom next icon */
    nextIcon?: ReactNode;
    /** Additional action buttons (export, add, etc.) */
    actions?: ReactNode;
    /** Custom class name */
    className?: string;
}
/**
 * Pre-built calendar controls component
 *
 * @example
 * const controls = useCalendarControls();
 *
 * <CalendarControls
 *   controls={controls}
 *   actions={<button>Add Event</button>}
 * />
 * <Calendar date={controls.date} />
 */
declare function CalendarControls({ controls, todayLabel, weekLabel, dayLabel, showViewToggle, prevIcon, nextIcon, actions, className, }: CalendarControlsProps): react_jsx_runtime.JSX.Element;

/**
 * Hook for managing calendar events - overlap detection, filtering, and availability
 */
declare function useCalendarEvents(events: CalendarEvent[]): {
    hasOverlap: (start: Date, duration: number, excludeId?: string) => boolean;
    findConflicts: (start: Date, duration: number, excludeId?: string) => CalendarEvent[];
    canMove: (eventId: string, newStart: Date) => boolean;
    getEventsForDay: (date: Date) => CalendarEvent[];
    getEventsForWeek: (date: Date) => CalendarEvent[];
    findAvailableSlots: (date: Date, duration: number, startHour?: number, endHour?: number) => Date[];
};
declare const useEventOverlap: typeof useCalendarEvents;

/**
 * Get the Monday of the week for a given date
 */
declare const getMonday: (today?: Date) => Date;
/**
 * Get all 7 days of the week starting from the Monday of the given date
 */
declare const completeWeek: (date: Date) => Date[];
/**
 * Generate an array of hour strings (e.g., ["08:00", "09:00", ...])
 */
declare const generateHours: ({ fromHour, toHour, }: {
    fromHour: number;
    toHour: number;
}) => string[];
/**
 * Check if a date is today
 */
declare const isToday: (date: Date) => boolean;
/**
 * Check if two dates are the same day
 */
declare const areSameDates: (d1: Date | null, d2: Date | null) => boolean;
/**
 * Add days to a date
 */
declare const addDaysToDate: (date: Date, days: number) => Date;
/**
 * Add minutes to a date
 */
declare const addMinutesToDate: (date: Date, mins: number) => Date;
/**
 * Convert minutes to time string (e.g., 120 -> "02:00")
 */
declare const fromMinsToTimeString: (mins: number) => string;
/**
 * Convert minutes to locale time string
 */
declare const fromMinsToLocaleTimeString: (mins: number, locale?: string) => string;
/**
 * Format a date to locale time string
 */
declare const fromDateToTimeString: (date: Date, locale?: string) => string;
/**
 * Get all days in a month (including padding days for calendar grid)
 */
declare const getDaysInMonth: (date: Date) => Date[];

/**
 * Hook that detects clicks outside of a referenced element
 */
declare function useClickOutside<T extends HTMLElement>({ isActive, onOutsideClick, }: {
    isActive?: boolean;
    onOutsideClick: () => void;
}): RefObject<T | null>;
/**
 * Format a date using locale (replacement for useMexDate)
 */
declare function formatDate(date: Date, locale?: string): string;

export { Calendar, type CalendarConfig, CalendarControls, type CalendarControlsProps, type CalendarControls$1 as CalendarControlsState, type CalendarEvent, type CalendarProps, type CalendarView, type ColumnHeaderProps, type EventColorPreset, type EventColors, type EventParticipant, type EventRenderProps, type ParticipantsDisplayConfig, type Resource, Calendar as SimpleBigWeekView, type TimeDisplayConfig, type UseCalendarControlsOptions, addDaysToDate, addMinutesToDate, areSameDates, completeWeek, formatDate, fromDateToTimeString, fromMinsToLocaleTimeString, fromMinsToTimeString, generateHours, getDaysInMonth, getMonday, isToday, useCalendarControls, useCalendarEvents, useClickOutside, useEventOverlap };
