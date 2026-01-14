import { useCallback } from "react";
import type { CalendarEvent } from "./types";
import { completeWeek } from "./utils";

/**
 * Hook for managing calendar events - overlap detection, filtering, and availability
 */
export function useCalendarEvents(events: CalendarEvent[]) {
  /**
   * Check if a time slot overlaps with existing events
   */
  const hasOverlap = useCallback(
    (start: Date, duration: number, excludeId?: string): boolean => {
      const hour = start.getHours() + start.getMinutes() / 60;
      const endHour = hour + duration / 60;

      return events.some((existing) => {
        if (excludeId && existing.id === excludeId) return false;

        const existingStart = new Date(existing.start);
        if (
          existingStart.getDate() !== start.getDate() ||
          existingStart.getMonth() !== start.getMonth() ||
          existingStart.getFullYear() !== start.getFullYear()
        ) {
          return false;
        }

        const existingHour =
          existingStart.getHours() + existingStart.getMinutes() / 60;
        const existingEnd = existingHour + existing.duration / 60;

        return (
          (hour >= existingHour && hour < existingEnd) ||
          (endHour > existingHour && endHour <= existingEnd) ||
          (hour <= existingHour && endHour >= existingEnd)
        );
      });
    },
    [events]
  );

  /**
   * Find all events that conflict with a given time slot
   */
  const findConflicts = useCallback(
    (start: Date, duration: number, excludeId?: string): CalendarEvent[] => {
      const hour = start.getHours() + start.getMinutes() / 60;
      const endHour = hour + duration / 60;

      return events.filter((existing) => {
        if (excludeId && existing.id === excludeId) return false;

        const existingStart = new Date(existing.start);
        if (
          existingStart.getDate() !== start.getDate() ||
          existingStart.getMonth() !== start.getMonth() ||
          existingStart.getFullYear() !== start.getFullYear()
        ) {
          return false;
        }

        const existingHour =
          existingStart.getHours() + existingStart.getMinutes() / 60;
        const existingEnd = existingHour + existing.duration / 60;

        return (
          (hour >= existingHour && hour < existingEnd) ||
          (endHour > existingHour && endHour <= existingEnd) ||
          (hour <= existingHour && endHour >= existingEnd)
        );
      });
    },
    [events]
  );

  /**
   * Check if an event can be moved to a new time
   */
  const canMove = useCallback(
    (eventId: string, newStart: Date): boolean => {
      const event = events.find((e) => e.id === eventId);
      if (!event) return false;
      return !hasOverlap(newStart, event.duration, eventId);
    },
    [events, hasOverlap]
  );

  /**
   * Get events for a specific day
   */
  const getEventsForDay = useCallback(
    (date: Date): CalendarEvent[] => {
      return events.filter((event) => {
        const eventDate = new Date(event.start);
        return (
          eventDate.getDate() === date.getDate() &&
          eventDate.getMonth() === date.getMonth() &&
          eventDate.getFullYear() === date.getFullYear()
        );
      });
    },
    [events]
  );

  /**
   * Get events for a week (Mon-Sun)
   */
  const getEventsForWeek = useCallback(
    (date: Date): CalendarEvent[] => {
      const week = completeWeek(date);
      const start = week[0];
      const end = new Date(week[6]);
      end.setHours(23, 59, 59, 999);

      return events.filter((event) => {
        const eventDate = new Date(event.start);
        return eventDate >= start && eventDate <= end;
      });
    },
    [events]
  );

  /**
   * Find available time slots for a given day and duration
   */
  const findAvailableSlots = useCallback(
    (date: Date, duration: number, startHour = 8, endHour = 18): Date[] => {
      const slots: Date[] = [];
      const dayEvents = getEventsForDay(date);

      for (let hour = startHour; hour <= endHour - duration / 60; hour++) {
        const slotStart = new Date(date);
        slotStart.setHours(hour, 0, 0, 0);

        const hasConflict = dayEvents.some((event) => {
          const eventStart = new Date(event.start);
          const eventHour = eventStart.getHours();
          const eventEnd = eventHour + event.duration / 60;
          const slotEnd = hour + duration / 60;

          return (
            (hour >= eventHour && hour < eventEnd) ||
            (slotEnd > eventHour && slotEnd <= eventEnd) ||
            (hour <= eventHour && slotEnd >= eventEnd)
          );
        });

        if (!hasConflict) {
          slots.push(slotStart);
        }
      }

      return slots;
    },
    [getEventsForDay]
  );

  return {
    hasOverlap,
    findConflicts,
    canMove,
    getEventsForDay,
    getEventsForWeek,
    findAvailableSlots,
  };
}

// Backwards compatibility
export const useEventOverlap = useCalendarEvents;
