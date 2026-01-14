import type { ReactNode } from "react";

/**
 * Props passed to custom column header renderer
 * Use this to build custom headers for resources (courts, rooms, employees, etc.)
 */
export interface ColumnHeaderProps {
  /** The date for this column */
  date: Date;
  /** Column index (0-6) */
  index: number;
  /** Whether this column represents today */
  isToday: boolean;
  /** The configured locale */
  locale: string;
}

/**
 * Generic calendar event - decoupled from any ORM
 */
export interface CalendarEvent {
  id: string;
  start: Date;
  duration: number; // in minutes
  title?: string | null;
  type?: "BLOCK" | "EVENT";
  service?: { name: string } | null;
}

/**
 * Calendar configuration options
 */
export interface CalendarConfig {
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
}

/**
 * Calendar component props
 */
export interface CalendarProps {
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
