/**
 * Public-scope MCP endpoint for chatbots (Formmy widget, landing chatbot).
 * Auth: `X-Denik-Api-Key` with prefix `dnk_pub_` matching `Org.publicApiKey`.
 *
 * GET  ?intent=list_services
 * GET  ?intent=get_availability&serviceSlug=X&date=YYYY-MM-DD
 * POST { intent: "create_booking", serviceSlug, start, customer }
 *
 * Note: this endpoint is read-only + free-bookings. Paid services hand off to
 * the landing URL — see `createPublicBooking`.
 */
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router"
import { getOrgFromPublicApiKey } from "~/.server/apiKeyAuth"
import { createPublicBooking } from "~/lib/booking.server"
import { db } from "~/utils/db.server"
import {
  createDateInTimezone,
  DEFAULT_TIMEZONE,
  formatTimeOnly,
} from "~/utils/timezone"
import { getServicePublicUrl } from "~/utils/urls"
import { normalizeWeekDays, WEEK_DAYS } from "~/utils/weekDays"

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const org = await getOrgFromPublicApiKey(request)
  const url = new URL(request.url)
  const intent = url.searchParams.get("intent")

  if (intent === "list_services") {
    const services = await db.service.findMany({
      where: { orgId: org.id, archived: false, isActive: true },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        price: true,
        currency: true,
        duration: true,
        payment: true,
        place: true,
      },
    })
    return Response.json(
      services.map((s) => ({
        name: s.name,
        slug: s.slug,
        description: s.description,
        price: Number(s.price),
        currency: s.currency,
        durationMinutes: Number(s.duration),
        requiresPayment: s.payment && Number(s.price) > 0,
        modality: s.place,
        bookingUrl: getServicePublicUrl(org.slug, s.slug),
      })),
    )
  }

  if (intent === "get_availability") {
    const serviceSlug = url.searchParams.get("serviceSlug")
    const date = url.searchParams.get("date")
    if (!serviceSlug || !date) {
      return Response.json(
        { error: "serviceSlug and date (YYYY-MM-DD) required" },
        { status: 400 },
      )
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return Response.json(
        { error: "date must be in YYYY-MM-DD format" },
        { status: 400 },
      )
    }
    const service = await db.service.findUnique({ where: { slug: serviceSlug } })
    if (!service || service.orgId !== org.id || service.archived || !service.isActive) {
      return Response.json({ error: "service not found" }, { status: 404 })
    }

    const timezone = org.timezone || DEFAULT_TIMEZONE
    const durationMinutes = Number(service.duration)
    const slots = await computeAvailableSlots({
      service,
      org,
      date,
      timezone,
      durationMinutes,
    })

    return Response.json({
      date,
      timezone,
      durationMinutes,
      slots,
    })
  }

  return Response.json({ error: "Unknown intent" }, { status: 400 })
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const org = await getOrgFromPublicApiKey(request)
  const body = (await request.json().catch(() => ({}))) as Record<string, any>
  const intent = body.intent

  if (intent !== "create_booking") {
    return Response.json({ error: "Unknown intent" }, { status: 400 })
  }

  const { serviceSlug, start, customer } = body
  if (typeof serviceSlug !== "string" || typeof start !== "string" || !customer) {
    return Response.json(
      { error: "serviceSlug, start (ISO), and customer required" },
      { status: 400 },
    )
  }

  const result = await createPublicBooking({
    org,
    serviceSlug,
    start: new Date(start),
    customer,
  })

  if (result.status === "error") {
    return Response.json(result, { status: 400 })
  }
  return Response.json(result)
}

async function computeAvailableSlots({
  service,
  org,
  date,
  timezone,
  durationMinutes,
}: {
  service: { id: string; weekDays: any }
  org: { weekDays: any }
  date: string
  timezone: string
  durationMinutes: number
}): Promise<string[]> {
  const serviceWeekDays = normalizeWeekDays(service.weekDays, false)
  const orgWeekDays = normalizeWeekDays(org.weekDays, true)
  const effective =
    Object.keys(serviceWeekDays).length > 0 ? serviceWeekDays : orgWeekDays

  const baseDate = new Date(`${date}T12:00:00Z`)
  const dayIndex = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    weekday: "short",
  })
    .format(baseDate)
    .toLowerCase()
  const dayMap: Record<string, (typeof WEEK_DAYS)[number]> = {
    mon: "monday",
    tue: "tuesday",
    wed: "wednesday",
    thu: "thursday",
    fri: "friday",
    sat: "saturday",
    sun: "sunday",
  }
  const dayKey = dayMap[dayIndex.slice(0, 3)]
  if (!dayKey) return []
  const ranges = effective[dayKey]
  if (!Array.isArray(ranges) || ranges.length === 0) return []

  const dayStart = createDateInTimezone("00:00", baseDate, timezone)
  const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000)

  const existing = await db.event.findMany({
    where: {
      serviceId: service.id,
      start: { gte: dayStart, lt: dayEnd },
      status: { notIn: ["CANCELLED", "canceled", "cancelled"] },
      archived: false,
    },
    select: { start: true },
  })
  const blocked = new Set(
    existing.map((e) => formatTimeOnly(e.start, timezone)),
  )

  const now = Date.now()
  const slots: string[] = []
  for (const range of ranges) {
    if (!Array.isArray(range) || range.length < 2) continue
    const [openStr, closeStr] = range
    const [oh, om] = String(openStr).split(":").map(Number)
    const [ch, cm] = String(closeStr).split(":").map(Number)
    if ([oh, om, ch, cm].some((n) => !Number.isFinite(n))) continue
    let mins = oh * 60 + om
    const endMins = ch * 60 + cm
    while (mins + durationMinutes <= endMins) {
      const h = Math.floor(mins / 60)
      const m = mins % 60
      const time = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
      const slotDate = createDateInTimezone(time, baseDate, timezone)
      if (!blocked.has(time) && slotDate.getTime() > now) {
        slots.push(time)
      }
      mins += durationMinutes
    }
  }
  return slots
}
