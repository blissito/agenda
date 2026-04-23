import type { Event } from "@prisma/client"
import { getDaysInMonth } from "~/components/dash/agenda/agendaUtils"

type WeekDaysType = Record<string, string[][]>

// Extended Event type with dateString (added at query time)
type EventWithDateString = Event & { dateString: string }

export const weekDictionary: Record<number, string> = {
  1: "monday",
  2: "tuesday",
  3: "wednesday",
  4: "thursday",
  5: "friday",
  6: "saturday",
  0: "sunday",
}

const MONTHS_BY_AVAILABILITY: Record<string, number> = {
  "3m": 3,
  "6m": 6,
  "1y": 12,
}

export const getMaxDate = (calendarAvailability?: string | null) => {
  const months = MONTHS_BY_AVAILABILITY[calendarAvailability ?? ""] ?? 3
  const date = new Date()
  date.setMonth(date.getMonth() + months)
  return date
}

const formatMinutes = (min: number): string => {
  if (min >= 60 && min % 60 === 0) {
    const hours = min / 60
    return `${hours} hora${hours === 1 ? "" : "s"}`
  }
  return `${min} minutos`
}

export type BookingWindowConfig = {
  minBookingAdvance?: string | null
  calendarAvailability?: string | null
} | null | undefined

export const validateBookingWindow = (
  orgConfig: BookingWindowConfig,
  requestedStart: Date,
): { ok: true } | { ok: false; error: string } => {
  if (Number.isNaN(requestedStart.getTime())) {
    return { ok: false, error: "Fecha inválida" }
  }
  const parsed = parseInt(orgConfig?.minBookingAdvance ?? "60", 10)
  const minAdvance = Number.isFinite(parsed) ? parsed : 60
  if (requestedStart.getTime() < Date.now() + minAdvance * 60 * 1000) {
    return {
      ok: false,
      error: `Debes agendar con al menos ${formatMinutes(minAdvance)} de anticipación.`,
    }
  }
  const maxDate = getMaxDate(orgConfig?.calendarAvailability)
  if (requestedStart.getTime() > maxDate.getTime()) {
    return {
      ok: false,
      error: "La fecha seleccionada está fuera de la ventana de agendamiento.",
    }
  }
  return { ok: true }
}

export const getAvailableDays = (weekDays: WeekDaysType): string[] => {
  let days = getDaysInMonth(new Date())
  const daysInNextMonth = getDaysInMonth(
    new Date(new Date().getFullYear(), new Date().getMonth() + 1),
  )
  const daysInAnotherMonth = getDaysInMonth(
    new Date(new Date().getFullYear(), new Date().getMonth() + 2),
  )
  days = days.concat(daysInNextMonth).concat(daysInAnotherMonth)

  const availableDays = days
    .filter((day: Date) => {
      const date = new Date(day)
      const includedDays = Object.keys(weekDays)
      const today = new Date()
      const dateTime = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
      ).getTime()
      const todayTime = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
      ).getTime()

      if (dateTime < todayTime) {
        return false
      }
      return includedDays.includes(weekDictionary[date.getDay()])
    })
    .map((d: Date) => `${d.getMonth()}/${d.getDate()}`)

  return availableDays
}

export const getScheduledDates = (
  events: EventWithDateString[],
): Record<string, Record<string, string[]>> => {
  if (!events || !events.length) return {}

  const obj: Record<string, Record<string, string[]>> = {}

  events.forEach((e) => {
    const month = String(Number(e.dateString.split("/")[1]) - 1)
    const date = e.dateString.split("/")[0]
    const timeString = e.dateString.split(",")[1]?.trim() ?? ""

    obj[month] ||= {}
    obj[month][date] ||= []
    obj[month][date] = [...new Set([...obj[month][date], timeString])]
  })

  return obj
}
