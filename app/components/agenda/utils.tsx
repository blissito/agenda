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

export const getMaxDate = (initialDate: Date) => {
  initialDate.setMonth(initialDate.getMonth() + 2)
  return new Date(initialDate)
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
