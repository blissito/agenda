/**
 * Route: /event/:eventId/reschedule
 * Customer-facing reschedule flow.
 * Auth: token-from-email session, logged-in owner, or logged-in customer (email match).
 */
import { useEffect, useState } from "react"
import { data, redirect, useFetcher } from "react-router"
import { getUserOrNull } from "~/.server/userGetters"
import { Spinner } from "~/components/common/Spinner"
import { validateBookingWindow } from "~/components/agenda/utils"
import { MonthView } from "~/components/forms/agenda/MonthView"
import TimeView from "~/components/forms/agenda/TimeView"
import { updateEventFully } from "~/lib/event-update.server"
import { DEFAULT_ORG_CONFIG } from "~/routes/dash/dash.ajustes.constants"
import { getSession } from "~/sessions"
import { db } from "~/utils/db.server"
import {
  DEFAULT_TIMEZONE,
  formatFullDateInTimezone,
  type SupportedTimezone,
} from "~/utils/timezone"
import { normalizeWeekDays } from "~/utils/weekDays"
import type { Route } from "./+types/event.$eventId.reschedule"

type RescheduleBlockReason =
  | null
  | "cancelled"
  | "out_of_window"
  | "max_reached"
  | "disabled"

// `maxReschedules` se guarda como string en config — incluye el valor "unlimited"
// (ver dash.ajustes.constants TIMES). Number("unlimited") es NaN, lo que
// rompe cualquier comparación numérica. Este helper normaliza a número finito
// o Infinity, y cae al default si el valor es desconocido.
function parseMaxReschedules(value: string | null | undefined): number {
  const v = value ?? ""
  if (v === "unlimited") return Number.POSITIVE_INFINITY
  const n = Number(v)
  if (Number.isFinite(n) && n >= 0) return n
  return Number(DEFAULT_ORG_CONFIG.maxReschedules)
}

function parseRescheduleWindow(value: string | null | undefined): number {
  const n = Number(value ?? "")
  if (Number.isFinite(n) && n >= 0) return n
  return Number(DEFAULT_ORG_CONFIG.rescheduleWindow)
}

function evaluateRescheduleEligibility({
  status,
  start,
  rescheduleCount,
  rescheduleWindowMinutes,
  maxReschedules,
}: {
  status: string
  start: Date
  rescheduleCount: number
  rescheduleWindowMinutes: number
  maxReschedules: number
}): { canReschedule: boolean; reason: RescheduleBlockReason } {
  if (status === "CANCELLED" || status === "canceled") {
    return { canReschedule: false, reason: "cancelled" }
  }
  if (maxReschedules <= 0) {
    return { canReschedule: false, reason: "disabled" }
  }
  if (rescheduleCount >= maxReschedules) {
    return { canReschedule: false, reason: "max_reached" }
  }
  if (rescheduleWindowMinutes > 0) {
    const deadline = new Date(start.getTime() - rescheduleWindowMinutes * 60 * 1000)
    if (new Date() > deadline) {
      return { canReschedule: false, reason: "out_of_window" }
    }
  }
  return { canReschedule: true, reason: null }
}

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const session = await getSession(request.headers.get("Cookie"))
  const access = session.get("customerEventAccess")
  const user = await getUserOrNull(request)

  const event = await db.event.findUnique({
    where: { id: params.eventId },
    include: {
      customer: true,
      service: { include: { org: true } },
    },
  })
  if (!event) throw redirect("/error?reason=event_not_found")

  const hasTokenAccess =
    !!access &&
    access.eventId === params.eventId &&
    access.expiresAt > Date.now()
  const isOwner = !!user && event.service?.org.ownerId === user.id
  const isCustomerLoggedIn =
    !!user && !!event.customer?.email && user.email === event.customer.email

  if (!hasTokenAccess && !isOwner && !isCustomerLoggedIn) {
    throw redirect("/error?reason=unauthorized")
  }

  const org = event.service?.org
  if (!org || !event.service) throw redirect("/error?reason=event_not_found")

  const orgConfig = (org.config as Record<string, string> | null) ?? {}
  const rescheduleWindowMinutes = parseRescheduleWindow(orgConfig.rescheduleWindow)
  const maxReschedules = parseMaxReschedules(orgConfig.maxReschedules)

  const eligibility = evaluateRescheduleEligibility({
    status: event.status,
    start: event.start,
    rescheduleCount: event.rescheduleCount ?? 0,
    rescheduleWindowMinutes,
    maxReschedules,
  })

  const timezone =
    ((org as { timezone?: string }).timezone as SupportedTimezone) ||
    DEFAULT_TIMEZONE

  const serviceWeekDays = normalizeWeekDays(
    event.service.weekDays as Record<string, any>,
    false,
  )
  const orgWeekDays = normalizeWeekDays(
    org.weekDays as Record<string, any>,
    true,
  )
  const weekDays =
    Object.keys(serviceWeekDays).length > 0 ? serviceWeekDays : orgWeekDays

  // CSRF token: set cookie + return token to embed in confirm submit
  const { generateCsrfToken, setCsrfCookie } = await import("~/.server/csrf")
  const csrfToken = generateCsrfToken()
  const headers = new Headers()
  setCsrfCookie(headers, csrfToken)

  return data(
    {
      event: {
        id: event.id,
        start: event.start.toISOString(),
        startFormatted: formatFullDateInTimezone(event.start, timezone),
        status: event.status,
        rescheduleCount: event.rescheduleCount ?? 0,
      },
      service: {
        name: event.service.name,
        slug: event.service.slug,
        duration: Number(event.service.duration),
        weekDays,
      },
      org: {
        name: org.name,
        timezone,
        minBookingAdvance: Number(
          orgConfig.minBookingAdvance ?? DEFAULT_ORG_CONFIG.minBookingAdvance,
        ),
      },
      limits: { rescheduleWindowMinutes, maxReschedules },
      eligibility,
      csrfToken,
    },
    { headers },
  )
}

export const action = async ({ request, params }: Route.ActionArgs) => {
  const session = await getSession(request.headers.get("Cookie"))
  const access = session.get("customerEventAccess")
  const user = await getUserOrNull(request)

  const event = await db.event.findUnique({
    where: { id: params.eventId },
    include: { customer: true, service: { include: { org: true } } },
  })
  if (!event) return { ok: false, error: "Evento no encontrado" }

  const hasTokenAccess =
    !!access &&
    access.eventId === params.eventId &&
    access.expiresAt > Date.now()
  const isOwner = !!user && event.service?.org.ownerId === user.id
  const isCustomerLoggedIn =
    !!user && !!event.customer?.email && user.email === event.customer.email

  if (!hasTokenAccess && !isOwner && !isCustomerLoggedIn) {
    throw redirect("/error?reason=unauthorized")
  }

  const formData = await request.formData()
  const intent = formData.get("intent")

  // List taken slots for a date (excluding the event being rescheduled).
  // Same shape as service.$serviceSlug action so TimeView can be reused.
  // Filtrado a solo los eventos del MISMO servicio + selección de campos
  // mínima (start) — evita filtrar PII de otras orgs/clientes.
  if (intent === "get_times_for_selected_date") {
    if (!event.serviceId) return { events: [] }
    const dateStr = formData.get("date") as string
    const selectedDate = new Date(dateStr)
    if (Number.isNaN(selectedDate.getTime())) return { events: [] }
    const tomorrow = new Date(selectedDate)
    tomorrow.setDate(selectedDate.getDate() + 1)
    const events = await db.event.findMany({
      where: {
        id: { not: params.eventId },
        serviceId: event.serviceId,
        start: { gte: selectedDate, lte: tomorrow },
        status: { notIn: ["CANCELLED", "canceled"] },
      },
      select: { start: true },
    })
    return { events }
  }

  if (intent === "confirm") {
    // CSRF
    const { validateCsrf } = await import("~/.server/csrf")
    const csrfToken = formData.get("_csrf") as string | null
    if (!validateCsrf(request, csrfToken)) {
      return {
        ok: false,
        error: "Sesión expirada. Recarga la página e intenta de nuevo.",
      }
    }

    // Rate limit
    const { checkRateLimit, getClientIP, rateLimitPresets, rateLimitResponse } =
      await import("~/.server/rateLimit")
    const ip = getClientIP(request)
    const rl = checkRateLimit(`reschedule:${ip}`, rateLimitPresets.booking)
    if (!rl.success) return rateLimitResponse(rl.resetAt)

    if (event.service?.archived) {
      return {
        ok: false,
        error: "Este servicio ya no está disponible. Contacta al negocio.",
      }
    }

    const orgConfig = (event.service?.org.config as Record<string, string> | null) ?? {}
    const rescheduleWindowMinutes = parseRescheduleWindow(orgConfig.rescheduleWindow)
    const maxReschedules = parseMaxReschedules(orgConfig.maxReschedules)

    const eligibility = evaluateRescheduleEligibility({
      status: event.status,
      start: event.start,
      rescheduleCount: event.rescheduleCount ?? 0,
      rescheduleWindowMinutes,
      maxReschedules,
    })
    if (!eligibility.canReschedule) {
      return { ok: false, error: "Esta cita ya no se puede reagendar." }
    }

    const startStr = formData.get("start") as string | null
    if (!startStr) return { ok: false, error: "Falta la nueva fecha." }

    const newStart = new Date(startStr)
    if (Number.isNaN(newStart.getTime())) {
      return { ok: false, error: "Fecha inválida." }
    }
    if (newStart.getTime() === event.start.getTime()) {
      return { ok: false, error: "Selecciona una fecha distinta a la actual." }
    }

    // Future + minBookingAdvance + max calendar window (mismo helper que booking)
    const windowCheck = validateBookingWindow(orgConfig as any, newStart)
    if (!windowCheck.ok) {
      return { ok: false, error: windowCheck.error }
    }

    const duration = Number(event.duration)
    const newEnd = new Date(newStart.getTime() + duration * 60 * 1000)
    const previousStatus = event.status

    try {
      await updateEventFully({
        eventId: event.id,
        changes: { start: newStart, end: newEnd },
      })
    } catch (e: unknown) {
      if (
        e &&
        typeof e === "object" &&
        "code" in e &&
        (e as { code: string }).code === "P2002"
      ) {
        return {
          ok: false,
          error: "Ese horario acaba de ser ocupado. Selecciona otro.",
        }
      }
      throw e
    }

    // updateEventFully resetea status a "pending" cuando cambia start.
    // Para reschedule iniciado por el cliente preservamos el status anterior
    // (el cliente acaba de elegir el nuevo horario, no tiene que re-confirmar).
    //
    // Nota: NO usamos `{ increment: 1 }` porque Prisma+MongoDB lo trata como
    // no-op cuando el campo no existe en el documento (caso común en docs
    // creados antes de añadir `rescheduleCount` al schema). Leemos y escribimos
    // explícitamente para garantizar que el campo se inicialice y persista.
    const newCount = (event.rescheduleCount ?? 0) + 1
    await db.event.update({
      where: { id: event.id },
      data: {
        status: previousStatus,
        rescheduleCount: newCount,
      },
    })

    return { ok: true }
  }

  return { ok: false, error: "Acción no válida" }
}

export default function ReschedulePage({ loaderData }: Route.ComponentProps) {
  const { event, service, org, limits, eligibility, csrfToken } = loaderData
  const fetcher = useFetcher<typeof action>()
  const [date, setDate] = useState<Date>()
  const [time, setTime] = useState<string>("")

  const isSubmitting = fetcher.state !== "idle" && fetcher.formData?.get("intent") === "confirm"
  const success = fetcher.data && "ok" in fetcher.data && fetcher.data.ok
  const errorMessage = fetcher.data && "error" in fetcher.data ? fetcher.data.error : undefined

  useEffect(() => {
    if (success) {
      // Pequeño delay para mostrar el estado de éxito antes de salir
      const t = setTimeout(() => {
        window.location.href = "/mi-cuenta/perfil"
      }, 1200)
      return () => clearTimeout(t)
    }
  }, [success])

  const handleSubmit = () => {
    if (!date || !time) return
    const [h, m] = time.split(":").map(Number)
    const newStart = new Date(date)
    newStart.setHours(h, m, 0, 0)
    fetcher.submit(
      {
        intent: "confirm",
        start: newStart.toISOString(),
        _csrf: csrfToken,
      },
      { method: "post" },
    )
  }

  if (!eligibility.canReschedule) {
    const messages: Record<string, string> = {
      cancelled: "Esta cita ya fue cancelada y no se puede reagendar.",
      out_of_window: `Las reagendaciones deben hacerse con al menos ${limits.rescheduleWindowMinutes / 60} horas de anticipación.`,
      max_reached: `Ya alcanzaste el máximo de ${limits.maxReschedules} reagendaciones para esta cita.`,
      disabled: "Este negocio no permite reagendar citas. Contacta directamente al negocio.",
    }
    return (
      <main className="min-h-screen bg-[#f8f8f8] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <h1 className="text-2xl font-satoBold text-brand_dark mb-3">
            No se puede reagendar
          </h1>
          <p className="text-brand_gray mb-6">
            {messages[eligibility.reason ?? "disabled"]}
          </p>
          <a
            href="/mi-cuenta/perfil"
            className="inline-block bg-brand_blue text-white py-3 px-6 rounded-full font-satoMedium hover:bg-blue-700 transition-colors"
          >
            Volver a mi cuenta
          </a>
        </div>
      </main>
    )
  }

  if (success) {
    return (
      <main className="min-h-screen bg-[#f8f8f8] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <h1 className="text-2xl font-satoBold text-brand_dark mb-3">
            ¡Cita reagendada!
          </h1>
          <p className="text-brand_gray">Te estamos llevando a tu cuenta…</p>
        </div>
      </main>
    )
  }

  return (
    <article className="bg-[#f8f8f8] min-h-svh relative pb-24 md:pb-8 pt-8">
      <main className="bg-white shadow mx-auto rounded-xl p-4 md:p-8 min-h-[506px] md:w-max w-full max-w-[calc(100vw-2rem)] md:max-w-none">
        <h1 className="text-2xl font-satoBold text-brand_dark">
          Reagendar tu cita
        </h1>
        <div className="mt-3 mb-6 bg-brand_blue/10 border border-brand_blue/20 rounded-xl px-4 py-3">
          <p className="text-sm text-brand_dark">
            Reagendando tu cita de{" "}
            <span className="font-satoBold">{service.name}</span> en{" "}
            <span className="font-satoBold">{org.name}</span>.
          </p>
          <p className="text-sm text-brand_gray mt-1">
            Fecha actual: {event.startFormatted}. No se cobrará nuevamente.
          </p>
        </div>

        <section className="flex flex-wrap">
          <MonthView
            selected={date}
            onSelect={setDate}
            weekDays={service.weekDays as any}
          />
          {date && (
            <TimeView
              intent="get_times_for_selected_date"
              slotDuration={service.duration}
              onSelect={setTime}
              weekDays={service.weekDays as any}
              selected={date}
              action={`/event/${event.id}/reschedule`}
              timezone={org.timezone}
              orgTimezone={org.timezone}
              selectedTime={time}
              minBookingAdvance={org.minBookingAdvance}
            />
          )}
        </section>

        {errorMessage && !isSubmitting && (
          <p className="mt-4 text-sm text-red-600">{errorMessage}</p>
        )}

        <div className="mt-8 flex items-center justify-end gap-3">
          <a
            href="/mi-cuenta/perfil"
            className="px-5 py-3 rounded-full text-brand_dark hover:bg-gray-100 transition-colors font-satoMedium"
          >
            Cancelar
          </a>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!date || !time || isSubmitting}
            className="px-6 py-3 rounded-full bg-brand_blue text-white font-satoMedium hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting && <Spinner />}
            {isSubmitting ? "Reagendando…" : "Confirmar nueva fecha"}
          </button>
        </div>
      </main>
    </article>
  )
}
