import type { ReactNode } from "react";

/**
 * Resource definition for day/resource view mode
 * Use this to represent courts, rooms, employees, etc.
 */
export interface Resource {
  /** Unique identifier for the resource */
  id: string;
  /** Display name */
  name: string;
  /** Optional icon/avatar */
  icon?: ReactNode;
}

/**
 * Props passed to custom column header renderer
 * Use this to build custom headers for resources (courts, rooms, employees, etc.)
 */
export interface ColumnHeaderProps {
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
export interface CalendarEvent {
  id: string;
  start: Date;
  duration: number; // in minutes
  title?: string | null;
  type?: "BLOCK" | "EVENT";
  service?: { name: string } | null;
  /** Resource ID for day/resource view (court, room, etc.) */
  resourceId?: string;
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
