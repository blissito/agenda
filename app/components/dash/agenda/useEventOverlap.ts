import { useCallback, useMemo } from "react"
import { type CalendarEvent } from "./types"

/**
 * Hook for detecting event overlaps in a calendar
 * Can be used standalone (headless) or with the Calendar component
 */
export function useEventOverlap(events: CalendarEvent[]) {
  /**
   * Check if a time slot overlaps with existing events
   * @param start - Start date/time of the slot
   * @param duration - Duration in minutes
   * @param excludeId - Optional event ID to exclude (for move operations)
   */
  const hasOverlap = useCallback(
    (start: Date, duration: number, excludeId?: string): boolean => {
      const hour = start.getHours() + start.getMinutes() / 60
      const endHour = hour + duration / 60

      return events.some((existing) => {
        if (excludeId && existing.id === excludeId) return false

        const existingStart = new Date(existing.start)
        // Check if same day
        if (
          existingStart.getDate() !== start.getDate() ||
          existingStart.getMonth() !== start.getMonth() ||
          existingStart.getFullYear() !== start.getFullYear()
        ) {
          return false
        }

        const existingHour =
          existingStart.getHours() + existingStart.getMinutes() / 60
        const existingEnd = existingHour + existing.duration / 60

        // Check time overlap
        return (
          (hour >= existingHour && hour < existingEnd) ||
          (endHour > existingHour && endHour <= existingEnd) ||
          (hour <= existingHour && endHour >= existingEnd)
        )
      })
    },
    [events],
  )

  /**
   * Find all events that conflict with a given time slot
   */
  const findConflicts = useCallback(
    (start: Date, duration: number, excludeId?: string): CalendarEvent[] => {
      const hour = start.getHours() + start.getMinutes() / 60
      const endHour = hour + duration / 60

      return events.filter((existing) => {
        if (excludeId && existing.id === excludeId) return false

        const existingStart = new Date(existing.start)
        if (
          existingStart.getDate() !== start.getDate() ||
          existingStart.getMonth() !== start.getMonth() ||
          existingStart.getFullYear() !== start.getFullYear()
        ) {
          return false
        }

        const existingHour =
          existingStart.getHours() + existingStart.getMinutes() / 60
        const existingEnd = existingHour + existing.duration / 60

        return (
          (hour >= existingHour && hour < existingEnd) ||
          (endHour > existingHour && endHour <= existingEnd) ||
          (hour <= existingHour && endHour >= existingEnd)
        )
      })
    },
    [events],
  )

  /**
   * Check if an event can be moved to a new time
   */
  const canMove = useCallback(
    (eventId: string, newStart: Date): boolean => {
      const event = events.find((e) => e.id === eventId)
      if (!event) return false
      return !hasOverlap(newStart, event.duration, eventId)
    },
    [events, hasOverlap],
  )

  /**
   * Get events for a specific day
   */
  const getEventsForDay = useMemo(() => {
    return (date: Date): CalendarEvent[] => {
      return events.filter((event) => {
        const eventDate = new Date(event.start)
        return (
          eventDate.getDate() === date.getDate() &&
          eventDate.getMonth() === date.getMonth() &&
          eventDate.getFullYear() === date.getFullYear()
        )
      })
    }
  }, [events])

  return {
    hasOverlap,
    findConflicts,
    canMove,
    getEventsForDay,
  }
}
