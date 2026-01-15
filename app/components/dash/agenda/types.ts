/**
 * Generic calendar types - decoupled from Prisma
 * These types define the contract for the calendar component
 */

export interface CalendarEvent {
  id: string;
  start: Date;
  duration: number; // in minutes
  title?: string | null;
  type?: "BLOCK" | "EVENT";
  service?: { name: string } | null;
}

export interface CalendarConfig {
  hoursStart?: number; // default: 0
  hoursEnd?: number; // default: 24
  locale?: string; // default: "es-MX"
  primaryColor?: string; // default: "brand_blue"
  todayColor?: string; // default: "brand_blue/20"
}

export interface CalendarProps {
  date?: Date;
  events?: CalendarEvent[];
  // Callbacks - if not provided, component is read-only
  onEventClick?: (event: CalendarEvent) => void;
  onEventMove?: (eventId: string, newStart: Date) => Promise<void> | void;
  onAddBlock?: (start: Date) => Promise<void> | void;
  onRemoveBlock?: (eventId: string) => Promise<void> | void;
  onNewEvent?: (start: Date) => void;
  // Optional config
  config?: CalendarConfig;
}
