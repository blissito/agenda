import * as react_jsx_runtime from 'react/jsx-runtime';
import { ReactNode, RefObject } from 'react';

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
}
/**
 * Calendar component props
 */
interface CalendarProps {
    /** Current date to display (defaults to today) */
    date?: Date;
    /** Array of events to display */
    events?: CalendarEvent[];
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

declare function Calendar({ date, events, onEventClick, onNewEvent, onEventMove, onAddBlock, onRemoveBlock, config, }: CalendarProps): react_jsx_runtime.JSX.Element;

/**
 * Hook for detecting event overlaps in a calendar
 * Can be used standalone (headless) or with the Calendar component
 */
declare function useEventOverlap(events: CalendarEvent[]): {
    hasOverlap: (start: Date, duration: number, excludeId?: string) => boolean;
    findConflicts: (start: Date, duration: number, excludeId?: string) => CalendarEvent[];
    canMove: (eventId: string, newStart: Date) => boolean;
    getEventsForDay: (date: Date) => CalendarEvent[];
};

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

export { Calendar, type CalendarConfig, type CalendarEvent, type CalendarProps, Calendar as SimpleBigWeekView, addDaysToDate, addMinutesToDate, areSameDates, completeWeek, formatDate, fromDateToTimeString, fromMinsToLocaleTimeString, fromMinsToTimeString, generateHours, getDaysInMonth, getMonday, isToday, useClickOutside, useEventOverlap };
