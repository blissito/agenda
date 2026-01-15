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
 * Participant/attendee for an event
 */
export interface EventParticipant {
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
export type EventColorPreset =
  | "blue"
  | "green"
  | "orange"
  | "pink"
  | "purple"
  | "red"
  | "yellow"
  | "gray";

/**
 * Custom color mapping for presets
 */
export interface EventColors {
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
export interface TimeDisplayConfig {
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
export interface ParticipantsDisplayConfig {
  /** Maximum avatars to show before "+N" (default: 4) */
  maxVisible?: number;
  /** Avatar size in pixels (default: 20) */
  size?: number;
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
export interface EventRenderProps {
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
