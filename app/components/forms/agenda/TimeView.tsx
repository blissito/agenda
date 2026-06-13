import { useEffect, useState } from "react"
import { useFetcher } from "react-router"
import { Spinner } from "~/components/common/Spinner"
import { convertDayToString } from "~/components/dash/agenda/agendaUtils"
import { cn } from "~/utils/cn"
import {
  convertTimeSlotsToTimezone,
  DEFAULT_TIMEZONE,
  formatDateInTimezone,
  formatTime12h,
  formatTimeOnly,
  isTimePassed,
  type SupportedTimezone,
} from "~/utils/timezone"
import { generateTimesFromRange } from "../TimePicker"
import type { DayTuple, WeekTuples } from "../TimesForm"

export default function TimeView({
  selected,
  action,
  weekDays,
  onSelect,
  slotDuration,
  intent,
  timezone = DEFAULT_TIMEZONE,
  orgTimezone = DEFAULT_TIMEZONE,
  selectedTime,
  minBookingAdvance,
  branchId,
}: {
  onSelect?: (timeString: string) => void
  selected: Date
  action: string
  weekDays: WeekTuples
  slotDuration: number
  intent: string
  timezone?: SupportedTimezone
  orgTimezone?: SupportedTimezone
  selectedTime?: string
  minBookingAdvance?: number
  branchId?: string | null
}) {
  const [time, setTime] = useState(selectedTime || "")
  const fetcher = useFetcher()

  // Sync with parent's selectedTime prop
  useEffect(() => {
    if (selectedTime !== undefined) {
      setTime(selectedTime)
    }
  }, [selectedTime])

  useEffect(() => {
    if (selected) {
      fetcher.submit(
        {
          intent,
          date: new Date(
            selected.getFullYear(),
            selected.getMonth(),
            selected.getDate(),
          ).toISOString(),
          ...(branchId ? { branchId } : {}),
        },
        { method: "post", action },
      )
    }
    // fetcher is intentionally excluded - including it causes infinite loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, action, intent, branchId])

  const dayString = convertDayToString(selected.getDay())
  const dayRanges = (weekDays as Record<string, DayTuple>)[dayString]

  // Generate slots in org timezone, then convert to user timezone
  const rawRanges = dayRanges?.flatMap((range: string[]) =>
    generateTimesFromRange(range, slotDuration),
  )

  // Convert slots from org timezone to user's selected timezone
  const ranges = rawRanges
    ? convertTimeSlotsToTimezone(rawRanges, selected, orgTimezone, timezone)
    : undefined

  const handleClick = (timeString: string) => () => {
    setTime(timeString)
    onSelect?.(timeString)
  }

  // Convert scheduled events to time strings in the correct timezone
  const scheduledEvents: string[] =
    fetcher.data &&
    Array.isArray(fetcher.data.events) &&
    fetcher.data.events.length > 0
      ? fetcher.data.events.map((event: { start: string | Date }) =>
          formatTimeOnly(new Date(event.start), timezone),
        )
      : []

  // Capacidad del servicio (cuántas reservas del mismo servicio caben por slot).
  // Cuento cuántas citas hay en cada hora y bloqueo cuando se alcanza la capacidad.
  const capacity: number = fetcher.data?.capacity ?? 1
  const slotCounts = new Map<string, number>()
  for (const t of scheduledEvents) {
    slotCounts.set(t, (slotCounts.get(t) ?? 0) + 1)
  }

  // Eje 1 (recurso único): intervalos ocupados de cualquier servicio en la sede.
  const busy: { start: string; end: string | null }[] = Array.isArray(
    fetcher.data?.busy,
  )
    ? fetcher.data.busy
    : []

  // Check if selected date is today to filter passed times
  const isToday = (() => {
    const today = new Date()
    return (
      selected.getDate() === today.getDate() &&
      selected.getMonth() === today.getMonth() &&
      selected.getFullYear() === today.getFullYear()
    )
  })()

  // Filter out full slots (capacity reached), overlapping busy times (single
  // resource), and passed times (for today)
  const availableRanges = ranges?.filter((t) => {
    if ((slotCounts.get(t) ?? 0) >= capacity) return false
    const [hours, minutes] = t.split(":").map(Number)
    const slotStart = new Date(selected)
    slotStart.setHours(hours, minutes, 0, 0)
    const slotEnd = new Date(slotStart.getTime() + slotDuration * 60 * 1000)
    if (busy.length) {
      const overlaps = busy.some((b) => {
        const bs = new Date(b.start).getTime()
        const be = b.end
          ? new Date(b.end).getTime()
          : bs + slotDuration * 60 * 1000
        return bs < slotEnd.getTime() && be > slotStart.getTime()
      })
      if (overlaps) return false
    }
    if (isToday && isTimePassed(t, timezone)) return false
    if (minBookingAdvance && minBookingAdvance > 0) {
      const advanceMs = minBookingAdvance * 60 * 1000
      if (slotStart.getTime() < Date.now() + advanceMs) return false
    }
    return true
  })

  const isLoading = fetcher.state !== "idle"

  return (
    <section className="flex items-center flex-col flex-grow w-full md:w-auto md:ml-8 mt-6 md:mt-0">
      <h3>
        {selected &&
          formatDateInTimezone(selected, timezone, {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
      </h3>
      <div
        className={cn("grid grid-cols-2 gap-x-4 gap-y-2 mt-6 relative w-full", {
          "opacity-50 pointer-events-none": isLoading,
        })}
      >
        {availableRanges?.map((timeString) => (
          <TimeButton
            isActive={timeString === time}
            onClick={handleClick(timeString)}
            key={timeString}
            timeString={timeString}
          />
        ))}
        {!isLoading && availableRanges && availableRanges.length < 1 && (
          <h2 className="col-span-2 text-brand_gray text-sm">
            No hay horarios disponíbles
          </h2>
        )}
        {isLoading && <Spinner className="absolute inset-0 m-auto" />}
      </div>

    </section>
  )
}

const TimeButton = ({
  timeString,
  isActive,
  onClick,
}: {
  onClick?: () => void
  isActive?: boolean
  timeString: string
}) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "hover:bg-brand_blue hover:text-white transition-all w-full px-4 md:px-12 py-1 rounded border border-brand_blue text-brand_blue",
        {
          "bg-brand_blue text-white": isActive,
        },
      )}
    >
      {formatTime12h(timeString)}
    </button>
  )
}
