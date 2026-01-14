import type { ReactNode } from "react";

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
