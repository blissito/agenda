/**
 * Clean URL route for subdomains/custom domains: /:serviceSlug
 * Org is resolved from the hostname, not from URL params.
 */
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import toast from "react-hot-toast"
import { data, Form, redirect, useFetcher } from "react-router"
import { twMerge } from "tailwind-merge"
import { z } from "zod"
import { createPreference, getValidAccessToken } from "~/.server/mercadopago"
import { getService, getUserOrNull } from "~/.server/userGetters"
import {
  branchEventFilter,
  resolveServiceBookingContext,
} from "~/lib/branches.server"
import { BookingScopeBar } from "~/components/agenda/BookingScopeBar"
import { Footer, Header, InfoShower } from "~/components/agenda/components"
import { CouponField } from "~/components/agenda/CouponField"
import { Success } from "~/components/agenda/success"
import { getMaxDate, validateBookingWindow } from "~/components/agenda/utils"
import { ChatWidget } from "~/components/chatbot/ChatWidget"
import { PrimaryButton } from "~/components/common/primaryButton"
import { MonthView } from "~/components/forms/agenda/MonthView"
import TimeView from "~/components/forms/agenda/TimeView"
import { BasicInput } from "~/components/forms/BasicInput"
import type { WeekTuples } from "~/components/forms/TimesForm"
import { validateCouponByCode, type ValidCoupon } from "~/lib/coupons.server"
import { createMeetLink } from "~/lib/google-meet.server"
import { getLevelDiscount } from "~/lib/loyalty.server"
import {
  createEventInFreeSlot,
  getServiceCapacity,
} from "~/lib/slot-capacity.server"
import { createZoomMeeting } from "~/lib/zoom.server"
import { DEFAULT_ORG_CONFIG } from "~/routes/dash/dash.ajustes.constants"
import { db } from "~/utils/db.server"
import {
  sendAppointmentToCustomer,
  sendAppointmentToOwner,
} from "~/utils/emails/sendAppointment"
import { getMetaTags } from "~/utils/getMetaTags"
import { resolveOrgFromRequest } from "~/utils/host.server"
import {
  createDateInTimezone,
  DEFAULT_TIMEZONE,
  formatTimeOnly,
  type SupportedTimezone,
} from "~/utils/timezone"
import { DEFAULT_OG_IMAGE, getPublicImageUrl, getServicePublicUrl } from "~/utils/urls"
import { resolveVideoProvider } from "~/utils/videoProvider.server"
import { normalizeWeekDays } from "~/utils/weekDays"
import type { Route } from "./+types/service.$serviceSlug"

export const meta = ({ data }: Route.MetaArgs) => {
  if (!data) return getMetaTags({})
  const { org, service } = data
  const image = getPublicImageUrl(service.gallery?.[0]) || DEFAULT_OG_IMAGE
  return getMetaTags({
    title: `${service.name} — ${org.name || "Deník"}`,
    description: `Reserva ${service.name}${service.price ? ` · $${service.price}` : ""} · ${service.duration} min`,
    image,
    url: getServicePublicUrl(org.slug, service.slug),
  })
}

type WeekDaysType = Record<string, string[][]>

export const userInfoSchema = z.object({
  displayName: z.string().min(1),
  comments: z.string(),
  email: z.string().email("Email no válido"),
  tel: z
    .string()
    .min(10, { message: "El teléfono debe ser de al menos 10 dígitos" }),
})

type UserInfoForm = z.infer<typeof userInfoSchema>

export const action = async ({ request, params }: Route.ActionArgs) => {
  const formData = await request.formData()
  const intent = formData.get("intent")

  if (intent === "get_times_for_selected_date") {
    const service = await getService(params.serviceSlug)
    if (!service) throw new Response(null, { status: 404 })
    const dateStr = formData.get("date") as string
    const selectedDate = new Date(dateStr)
    const tommorrow = new Date(selectedDate)
    tommorrow.setDate(selectedDate.getDate() + 1)

    // Scope por sede: si el booking envía branchId válido de la misma org,
    // filtramos por esa sede (la principal atrapa también eventos sin branchId).
    const branchId = formData.get("branchId")
    let branchFilter = {}
    if (typeof branchId === "string" && branchId) {
      const branch = await db.branch.findFirst({
        where: { id: branchId, orgId: service.orgId },
        select: { id: true, isDefault: true },
      })
      if (branch) branchFilter = branchEventFilter(branch)
    }

    // Solo retornamos `start` y SOLO de este servicio (cierra fuga de PII: antes
    // devolvía el objeto Event completo de toda la plataforma en esa fecha).
    const events = await db.event.findMany({
      where: {
        serviceId: service.id,
        status: { notIn: ["CANCELLED", "canceled"] },
        start: {
          gte: new Date(selectedDate),
          lte: new Date(tommorrow),
        },
        ...branchFilter,
      },
      select: { start: true },
    })

    const capacity = getServiceCapacity(service)

    // Eje 1 (recurso único): por default (toggle OFF) la org NO permite
    // servicios distintos en simultáneo. Intervalos ocupados de OTROS servicios.
    let busy: { start: Date; end: Date | null }[] = []
    const orgCfg = await db.org.findUnique({
      where: { id: service.orgId },
      select: { config: true },
    })
    if (orgCfg?.config?.simultaneousServices !== true) {
      busy = await db.event.findMany({
        where: {
          orgId: service.orgId,
          serviceId: { not: service.id },
          status: { notIn: ["CANCELLED", "canceled"] },
          archived: false,
          start: { gte: new Date(selectedDate), lte: new Date(tommorrow) },
          ...branchFilter,
        },
        select: { start: true, end: true },
      })
    }
    return { events, capacity, busy }
  }
  if (intent === "validate_coupon") {
    const code = formData.get("code")
    const serviceId = formData.get("serviceId")
    if (typeof code !== "string" || typeof serviceId !== "string") {
      return { ok: false as const, error: "Datos inválidos" }
    }
    const orgForCoupon = await resolveOrgFromRequest(request, undefined)
    if (!orgForCoupon) {
      return { ok: false as const, error: "Organización no encontrada" }
    }
    const serviceForCoupon = await db.service.findUnique({
      where: { id: serviceId },
      select: { id: true, price: true, orgId: true },
    })
    if (!serviceForCoupon || serviceForCoupon.orgId !== orgForCoupon.id) {
      return { ok: false as const, error: "Servicio no encontrado" }
    }
    return validateCouponByCode({
      code,
      orgId: orgForCoupon.id,
      serviceId: serviceForCoupon.id,
      servicePrice: Number(serviceForCoupon.price),
    })
  }

  if (intent === "create_event") {
    // CSRF validation
    const { validateCsrf } = await import("~/.server/csrf")
    const csrfToken = formData.get("_csrf") as string | null
    if (!validateCsrf(request, csrfToken)) {
      return {
        success: false,
        error: "Sesión expirada. Recarga la página e intenta de nuevo.",
      }
    }

    // Rate limit
    const { checkRateLimit, getClientIP, rateLimitPresets, rateLimitResponse } =
      await import("~/.server/rateLimit")
    const ip = getClientIP(request)
    const rl = checkRateLimit(`booking:${ip}`, rateLimitPresets.booking)
    if (!rl.success) return rateLimitResponse(rl.resetAt)

    // Server-side validation
    const rawData = formData.get("data")
    if (!rawData || typeof rawData !== "string")
      return { success: false, error: "Datos inválidos" }
    let data: any
    try {
      data = JSON.parse(rawData)
    } catch {
      return { success: false, error: "Datos inválidos" }
    }

    // Honeypot
    if (data.customer?.website)
      return { success: false, error: "Datos inválidos" }

    // Validate customer fields server-side
    const customerResult = userInfoSchema.safeParse(data.customer)
    if (!customerResult.success)
      return { success: false, error: "Datos del cliente inválidos" }

    const validatedCustomer = customerResult.data

    // Org is resolved from hostname (subdomain or custom domain)
    const org = await resolveOrgFromRequest(request, undefined)
    if (!org) throw new Response("Org not found", { status: 404 })

    // Buscar servicio para verificar si requiere pago
    const service = await db.service.findUnique({
      where: { id: data.serviceId },
    })
    if (!service) throw new Response("Service not found", { status: 404 })
    // Servicios desactivados no son agendables (defensa ante POST directo).
    if (!service.isActive)
      throw new Response("Service not found", { status: 404 })

    // Sede del booking: validar que pertenezca a la org (cierra IDOR). Si es
    // válida, se snapshotea en el Event y se resuelve el precio por capa.
    let validBranchId: string | null = null
    let branchPrice: bigint | null = null
    if (typeof data.branchId === "string" && data.branchId) {
      const branch = await db.branch.findFirst({
        where: { id: data.branchId, orgId: org.id },
        select: { id: true },
      })
      if (branch) {
        validBranchId = branch.id
        const sb = await db.serviceBranch.findFirst({
          where: { serviceId: service.id, branchId: branch.id },
          select: { price: true },
        })
        branchPrice = sb?.price ?? null
      }
    }

    // Enforce booking window (min advance / max calendar availability)
    const windowCheck = validateBookingWindow(
      org.config as any,
      new Date(data.start),
    )
    if (!windowCheck.ok) {
      return { success: false, error: windowCheck.error }
    }

    // Check if User with this email already exists
    const existingUser = await db.user.findUnique({
      where: { email: validatedCustomer.email },
    })

    const now = new Date()
    const customer = await db.customer.upsert({
      where: { email_orgId: { email: validatedCustomer.email, orgId: org.id } },
      update: {
        displayName: validatedCustomer.displayName,
        tel: validatedCustomer.tel || undefined,
        updatedAt: now,
        ...(existingUser && { user: { connect: { id: existingUser.id } } }),
      },
      create: {
        displayName: validatedCustomer.displayName,
        email: validatedCustomer.email,
        tel: validatedCustomer.tel || "",
        comments: validatedCustomer.comments || "",
        org: { connect: { id: org.id } },
        createdAt: now,
        updatedAt: now,
        ...(existingUser && { user: { connect: { id: existingUser.id } } }),
      },
    })

    // Loyalty discount lookup
    let discountPercent = 0
    let levelName: string | null = null
    try {
      const discount = await getLevelDiscount({
        customerId: customer.id,
        serviceId: service.id,
      })
      if (discount) {
        discountPercent = discount.discountPercent
        levelName = discount.levelName
      }
    } catch (e) {
      console.error("Loyalty discount lookup failed:", e)
    }

    // Precio efectivo: override de la sede (ServiceBranch.price) ?? Service.price
    const basePrice = Number(branchPrice ?? service.price)
    const loyaltyDiscountAmount =
      discountPercent > 0 ? basePrice * (discountPercent / 100) : 0

    // Coupon validation (excluyente con loyalty: gana el descuento mayor)
    let coupon: ValidCoupon | null = null
    const couponCode =
      typeof data.couponCode === "string" ? data.couponCode.trim() : ""
    if (couponCode) {
      const result = await validateCouponByCode({
        code: couponCode,
        orgId: org.id,
        serviceId: service.id,
        servicePrice: basePrice,
      })
      if (!result.ok) {
        return { success: false, error: result.error }
      }
      coupon = result.coupon
    }

    if (coupon && coupon.discountAmount <= loyaltyDiscountAmount) {
      coupon = null
    } else if (coupon) {
      discountPercent = 0
      levelName = null
    }

    const effectivePrice = coupon
      ? Math.max(0, basePrice - coupon.discountAmount)
      : discountPercent > 0
        ? basePrice * (1 - discountPercent / 100)
        : basePrice

    const startDate = new Date(data.start)
    const endDate = new Date(startDate.getTime() + data.duration * 60 * 1000)

    // Si el servicio requiere pago, redirigir a MP
    if (service.payment && effectivePrice > 0) {
      // Obtener owner para tokens de MP
      const owner = await db.user.findUnique({
        where: { id: org.ownerId },
      })

      const accessToken = await getValidAccessToken(owner)
      if (!accessToken) {
        return {
          error:
            "Este servicio requiere pago pero el negocio no tiene configurado su método de pago. Por favor contacta directamente al negocio.",
        }
      }

      // Use main app URL for MP callbacks (subdomains may not be whitelisted in MP)
      const appUrl = process.env.APP_URL || new URL(request.url).origin

      try {
        const preference = await createPreference(accessToken, {
          serviceId: service.id,
          serviceName: service.name,
          price: coupon ? basePrice : effectivePrice,
          customerId: customer.id,
          branchId: validBranchId,
          start: startDate.toISOString(),
          end: endDate.toISOString(),
          backUrl: appUrl,
          webhookUrl: `${appUrl}/mercadopago/webhook`,
          coupon: coupon
            ? {
                rewardId: coupon.rewardId,
                label: coupon.label,
                discountAmount: coupon.discountAmount,
              }
            : undefined,
        })

        if (preference.init_point) {
          // Redirigir a MP, el evento se crea en el webhook
          throw redirect(preference.init_point)
        }
      } catch (e) {
        // Re-throw redirects
        if (e instanceof Response) throw e
        console.error("MercadoPago preference error:", e)
        return {
          error: "Error al procesar el pago. Por favor intenta de nuevo.",
        }
      }
    }

    // Servicio gratuito o sin MP configurado: crear evento directamente,
    // respetando capacidad (seats) y bloqueo cross-service (recurso único).
    const slotResult = await createEventInFreeSlot(
      {
        org,
        service,
        branchId: validBranchId ?? null,
        branchWhere: {
          orgId: org.id,
          ...(validBranchId ? { branchId: validBranchId } : {}),
        },
        start: startDate,
        end: endDate,
      },
      (slotIndex) =>
        db.event.create({
          data: {
            start: startDate,
            end: endDate,
            duration: data.duration,
            slotIndex,
            service: { connect: { id: data.serviceId } },
            title: data.title,
            status: data.status,
            org: { connect: { id: org.id } },
            customer: { connect: { id: customer.id } },
            ...(validBranchId
              ? { branch: { connect: { id: validBranchId } } }
              : {}),
            allDay: false,
            archived: false,
            createdAt: new Date(),
            paid: basePrice === 0, // true solo si es realmente gratis
            type: "appointment",
            userId: org.ownerId,
            updatedAt: new Date(),
          },
          include: {
            customer: true,
            service: { include: { org: true } },
          },
        }),
    )
    if (!slotResult.ok) {
      return {
        success: false,
        error:
          slotResult.reason === "conflict"
            ? "Ese horario se cruza con otra cita. Por favor selecciona otro."
            : "Este horario acaba de ser reservado. Por favor selecciona otro.",
      }
    }
    let event = slotResult.event

    // Crear link de llamada (Meet/Zoom) según videoProvider del servicio
    const provider = resolveVideoProvider({ org, service })
    if (provider === "meet") {
      try {
        const { meetingLink, calendarEventId, calendarHtmlLink } =
          await createMeetLink({ org, event, service, customer })
        const updated = await db.event.update({
          where: { id: event.id },
          data: {
            meetingLink,
            calendarEventId,
            calendarHtmlLink,
            videoProvider: "meet",
          },
          include: {
            customer: true,
            service: { include: { org: true } },
          },
        })
        event = updated
      } catch (e) {
        console.error(
          "[booking público] Meet creation failed:",
          e instanceof Error ? e.message : e,
        )
        await db.event.update({
          where: { id: event.id },
          data: { videoProvider: "none" },
        })
      }
    } else if (provider === "zoom") {
      try {
        const { meetingLink, meetingId } = await createZoomMeeting({
          org,
          event,
          service,
          customer,
        })
        const updated = await db.event.update({
          where: { id: event.id },
          data: {
            meetingLink,
            zoomMeetingId: meetingId,
            videoProvider: "zoom",
          },
          include: {
            customer: true,
            service: { include: { org: true } },
          },
        })
        event = updated
      } catch (e) {
        console.error(
          "[booking público] Zoom creation failed:",
          e instanceof Error ? e.message : e,
        )
        await db.event.update({
          where: { id: event.id },
          data: { videoProvider: "none" },
        })
      }
    } else {
      await db.event.update({
        where: { id: event.id },
        data: { videoProvider: "none" },
      })
    }

    // Emit booking.created event for plugins
    const { emit } = await import("~/plugins/index.server")
    await import("~/plugins/register.server")
    await emit("booking.created", { event, service, customer }, org.id)

    try {
      await sendAppointmentToCustomer({
        email: customer.email,
        event: event as any,
      })
      if (org.email) {
        await sendAppointmentToOwner({
          email: org.email,
          event: event as any,
        })
      }
    } catch (e) {
      console.error("Email send failed:", e)
    }

    // Schedule reminder and survey notifications
    try {
      const { scheduleEventNotifications } = await import(
        "~/jobs/definitions.server"
      )
      await scheduleEventNotifications(
        event.id,
        startDate,
        endDate,
        service.config as
          | {
              reminder?: boolean
              survey?: boolean
              reminderHours?: number | null
            }
          | undefined,
        org.timezone,
      )
    } catch (e) {
      console.error("Failed to schedule notifications:", e)
    }

    return { success: true, event, org, discountPercent, levelName }
  }
  return null
}

const CRAWLER_UA_REGEX_PAGE =
  /(facebookexternalhit|facebookcatalog|meta-externalagent|twitterbot|linkedinbot|whatsapp|slackbot|telegrambot|discordbot|skypeuripreview|googlebot|bingbot|applebot|pinterest|redditbot|embedly|vkshare|w3c_validator)/i

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const ua = request.headers.get("user-agent") || ""
  const isCrawler = CRAWLER_UA_REGEX_PAGE.test(ua)
  if (!isCrawler) {
    const { checkRateLimit, getClientIP, rateLimitPresets } = await import(
      "~/.server/rateLimit"
    )
    const ip = getClientIP(request)
    const rl = checkRateLimit(`page:${ip}`, rateLimitPresets.pageLoad)
    if (!rl.success) {
      throw new Response("Too many requests", {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)),
        },
      })
    }
  }

  // Org is resolved from hostname (subdomain or custom domain)
  const org = await resolveOrgFromRequest(request, undefined)
  if (!org) throw new Response("Org not found", { status: 404 })

  const service = await db.service.findUnique({
    where: {
      slug: params.serviceSlug,
    },
    include: {
      events: {
        where: {
          status: { notIn: ["CANCELLED", "canceled"] },
        },
      },
    },
  })
  if (!service) throw new Response(null, { status: 404 })

  // Verify service belongs to org
  if (service.orgId !== org.id) throw new Response(null, { status: 404 })

  // Servicios desactivados no son agendables públicamente.
  if (!service.isActive) throw new Response(null, { status: 404 })

  // Contexto de sede: sedes activas que ofrecen este servicio + sede activa
  // (de `?sucursal=` o la default) + override del ServiceBranch. Para orgs
  // single-location queda 1 sola sede y el booking se comporta como antes.
  const sucursalSlug = new URL(request.url).searchParams.get("sucursal")
  const { branches, activeBranch, activeServiceBranch } =
    await resolveServiceBookingContext({
      serviceId: service.id,
      orgId: org.id,
      branchSlug: sucursalSlug,
    })

  // Resolución por capas (horario/precio/timezone):
  //   weekDays  = ServiceBranch ?? Service ?? Branch ?? Org
  //   price     = ServiceBranch ?? Service
  //   timezone  = Branch ?? Org
  const effectiveServiceWeekDays =
    (activeServiceBranch?.weekDays as Record<string, any> | null) ??
    (service.weekDays as Record<string, any> | null) ??
    (activeBranch?.weekDays as Record<string, any> | null) ??
    null
  const serviceWeekDays = normalizeWeekDays(
    effectiveServiceWeekDays as Record<string, any>,
    false,
  )
  const orgWeekDays = normalizeWeekDays(
    org.weekDays as Record<string, any>,
    true,
  )
  const effectivePrice = Number(activeServiceBranch?.price ?? service.price)
  const effectiveTimezone =
    (activeBranch?.timezone as SupportedTimezone) ||
    (org.timezone as SupportedTimezone) ||
    DEFAULT_TIMEZONE

  // Servicios activos de la org para el switcher del step 1.
  const orgServices = await db.service.findMany({
    where: { orgId: org.id, isActive: true, archived: false },
    select: { name: true, slug: true },
    orderBy: { name: "asc" },
  })

  const serviceWithEnglishDays = {
    ...service,
    weekDays: Object.keys(serviceWeekDays).length > 0 ? serviceWeekDays : null,
    // Convert BigInt to Number for client-side usage
    duration: Number(service.duration),
    price: effectivePrice,
    points: Number(service.points),
    seats: Number(service.seats),
  }
  const orgWithNormalizedDays = {
    ...org,
    weekDays: orgWeekDays,
    // Include timezone from org or use default (branch-aware)
    timezone: effectiveTimezone,
  }
  const branchOptions = branches.map((b) => ({
    id: b.id,
    name: b.name,
    slug: b.slug,
    address: b.address,
  }))
  const activeBranchLite = activeBranch
    ? { id: activeBranch.id, name: activeBranch.name, slug: activeBranch.slug }
    : null

  // CSRF token for booking form
  const { generateCsrfToken, setCsrfCookie } = await import("~/.server/csrf")
  const csrfToken = generateCsrfToken()
  const headers = new Headers()
  setCsrfCookie(headers, csrfToken)

  const user = await getUserOrNull(request)

  return data(
    {
      org: orgWithNormalizedDays,
      service: serviceWithEnglishDays,
      branches: branchOptions,
      activeBranch: activeBranchLite,
      orgServices,
      csrfToken,
      isLoggedIn: !!user,
    },
    { headers },
  )
}

export default function Page({ loaderData }: Route.ComponentProps) {
  const { org, service, branches, activeBranch, orgServices } = loaderData
  const [time, setTime] = useState<string>()
  const [date, setDate] = useState<Date>()
  const [show, setShow] = useState("")
  const [couponCode, setCouponCode] = useState("")
  const [appliedCoupon, setAppliedCoupon] = useState<ValidCoupon | null>(null)
  const [timezone, setTimezone] = useState<SupportedTimezone>(
    org.timezone as SupportedTimezone,
  )
  const fetcher = useFetcher<typeof action>()
  const couponDirty = couponCode.trim() !== "" && !appliedCoupon

  const onSubmit = (vals: UserInfoForm) => {
    const result = userInfoSchema.safeParse(vals)
    if (!result.success) {
      result.error.issues.forEach((e) => {
        setError(e.path[0] as keyof UserInfoForm, { message: e.message })
      })
      return
    }
    if (!date) return
    if (couponDirty) return
    const customer = { ...result.data, website: (vals as any).website }
    fetcher.submit(
      {
        _csrf: loaderData.csrfToken,
        intent: "create_event",
        data: JSON.stringify({
          start: date.toISOString(),
          dateString: date.toISOString(),
          customer,
          duration: service.duration,
          serviceId: service.id,
          branchId: activeBranch?.id ?? null,
          title: service.name,
          status: "pending",
          couponCode: appliedCoupon ? appliedCoupon.code : undefined,
        }),
      },
      { method: "post" },
    )
    setShow("loading")
  }

  // React to fetcher result
  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data) {
      const data = fetcher.data as {
        success?: boolean
        error?: string
        event?: unknown
      }
      if (data.success && data.event) {
        setShow("success")
      } else if (data.error) {
        // Slot was taken, go back to time selection
        setShow("")
        setTime(undefined)
        toast.error(data.error)
      }
    }
  }, [fetcher.state, fetcher.data])

  // Al cambiar de sede (navegación con `?sucursal=`) la disponibilidad cambia:
  // reseteamos fecha/hora para no arrastrar un slot de otra sucursal.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    setDate(undefined)
    setTime(undefined)
  }, [activeBranch?.id])

  const maxDate = getMaxDate(
    org.config?.calendarAvailability ?? DEFAULT_ORG_CONFIG.calendarAvailability,
  )

  const handleTimeSelection = (timeString: string) => {
    // Create date in the user's selected timezone (handles DST correctly)
    const updated = createDateInTimezone(timeString, date as Date, timezone)
    setDate(updated)
    setTime(timeString)
  }

  const handleNextForm = () => {
    if (show !== "user_info") {
      setShow("user_info")
    }
  }

  const handleTimezoneChange = (newTimezone: SupportedTimezone) => {
    // When timezone changes, the absolute moment (date) stays the same
    // We just need to display the time in the new timezone
    if (time && date) {
      // Use the existing date (which is an absolute moment) and format it in the new timezone
      const newTimeString = formatTimeOnly(date, newTimezone)
      setTime(newTimeString)
    }
    setTimezone(newTimezone)
  }

  const {
    formState: { errors, isValid },
    setError,
    handleSubmit,
    register,
  } = useForm<UserInfoForm>({
    defaultValues: { displayName: "", email: "", tel: "", comments: "" },
    mode: "onChange",
  })

  const reset = () => {
    setShow("")
    setDate(undefined)
    setTime(undefined)
  }

  // Mostrar success solo si hay evento creado
  const fetcherData = fetcher.data as {
    success?: boolean
    event?: Record<string, unknown>
    error?: string
  } | null
  if (show === "success" && fetcherData?.event) {
    return (
      <Success
        org={org}
        event={fetcherData.event as any}
        service={service}
        onFinish={reset}
      />
    )
  }

  // Show loading state while submitting
  if (show === "loading") {
    return (
      <article className="bg-[#f8f8f8] min-h-screen relative flex flex-col items-center">
        <Header org={org} />
        <div className="flex flex-col items-center justify-center flex-1 -mt-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand_blue mb-4"></div>
          <p className="text-brand_gray text-lg">Reservando tu cita...</p>
        </div>
      </article>
    )
  }

  return (
    <article className="bg-[#f8f8f8] min-h-svh relative pb-24 md:pb-0">
      <Header org={org} />
      <main className="bg-white shadow mx-auto rounded-xl p-4 md:p-8 min-h-[506px] md:w-max w-full max-w-[calc(100vw-2rem)] md:max-w-none">
        {show !== "user_info" && (
          <BookingScopeBar
            services={orgServices}
            currentServiceSlug={service.slug}
            serviceUrlFor={(slug) => `/${slug}`}
            branches={branches}
            activeBranchSlug={activeBranch?.slug ?? null}
          />
        )}
        <section className={twMerge("flex flex-wrap")}>
          <InfoShower
            service={service}
            org={org}
            date={date}
            timezone={timezone}
            onTimezoneChange={handleTimezoneChange}
          />
          {show !== "user_info" && (
            <>
              <MonthView
                selected={date}
                onSelect={setDate}
                maxDate={maxDate}
                weekDays={(service.weekDays || org.weekDays) as WeekDaysType}
              />
              {date && (
                <TimeView
                  intent="get_times_for_selected_date"
                  slotDuration={service.duration}
                  onSelect={handleTimeSelection}
                  weekDays={
                    (service.weekDays || org.weekDays) as unknown as WeekTuples
                  }
                  selected={date}
                  action={`/${service.slug}`}
                  timezone={timezone}
                  orgTimezone={org.timezone as SupportedTimezone}
                  selectedTime={time}
                  branchId={activeBranch?.id ?? null}
                  minBookingAdvance={parseInt(
                    org.config?.minBookingAdvance ??
                      DEFAULT_ORG_CONFIG.minBookingAdvance,
                    10,
                  )}
                />
              )}
            </>
          )}
          {show === "user_info" && (
            <Form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col gap-4">
              <h3 className="text-lg font-bold mb-6 text-brand_dark">
                Cuéntame sobre ti
              </h3>
              <BasicInput
                register={register}
                name="displayName"
                label="Nombre"
                placeholder="Nombre completo"
                error={errors.displayName}
              />
              <div className="flex flex-col md:flex-row gap-4">
                <BasicInput
                  error={errors.email}
                  register={register}
                  name="email"
                  label="Email"
                  placeholder="ejemplo@ejemplo.com"
                />
                <BasicInput
                  error={errors.tel}
                  name="tel"
                  register={register}
                  label="Teléfono"
                  placeholder="555 555 55 66"
                />
              </div>
              <BasicInput
                error={errors.comments}
                as="textarea"
                label="Notas o comentarios"
                register={register}
                name="comments"
                placeholder="Cualquier cosa que ayude a prepararnos para nuestra cita."
                registerOptions={{ required: false }}
                inputClassName="min-h-20"
              />
              {service.payment && Number(service.price) > 0 && (
                <CouponField
                  serviceId={service.id}
                  actionPath={`/${service.slug}`}
                  basePrice={Number(service.price)}
                  onChange={(code, applied) => {
                    setCouponCode(code)
                    setAppliedCoupon(applied)
                  }}
                />
              )}
              <input
                type="text"
                {...register("website" as any)}
                style={{ display: "none" }}
                tabIndex={-1}
                autoComplete="off"
              />
            </Form>
          )}
        </section>
        {show !== "user_info" ? (
          <Footer
            onSubmit={handleNextForm}
            isValid={!!date && !!time}
            isLoading={fetcher.state !== "idle"}
          />
        ) : (
          <div className="flex justify-between items-center mt-8">
            <button
              type="button"
              onClick={() => setShow("")}
              className="flex items-center gap-2 bg-[#f5f5f5] text-brand_dark px-4 py-3 rounded-full hover:bg-gray-200 transition-colors"
            >
              <span className="text-lg">←</span>
              <span className="font-medium">Volver</span>
            </button>
            <PrimaryButton
              isDisabled={!isValid || fetcher.state !== "idle" || couponDirty}
              onClick={handleSubmit(onSubmit)}
              type="button"
            >
              {fetcher.state !== "idle" ? "Agendando..." : "Continuar"}
            </PrimaryButton>
          </div>
        )}
      </main>
      {org.chatbotAgentId && org.chatbotConfig && (
        <ChatWidget
          agentId={org.chatbotAgentId as string}
          config={org.chatbotConfig as any}
        />
      )}
    </article>
  )
}
