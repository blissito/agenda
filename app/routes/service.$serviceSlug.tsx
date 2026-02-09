/**
 * Clean URL route for subdomains/custom domains: /:serviceSlug
 * Org is resolved from the hostname, not from URL params.
 */
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import toast from "react-hot-toast"
import { Form, redirect, useFetcher } from "react-router"
import { twMerge } from "tailwind-merge"
import { z } from "zod"
import { createPreference, getValidAccessToken } from "~/.server/mercadopago"
import { getService } from "~/.server/userGetters"
import { Footer, Header, InfoShower } from "~/components/agenda/components"
import { Success } from "~/components/agenda/success"
import { getMaxDate } from "~/components/agenda/utils"
import { PrimaryButton } from "~/components/common/primaryButton"
import { MonthView } from "~/components/forms/agenda/MonthView"
import TimeView from "~/components/forms/agenda/TimeView"
import { BasicInput } from "~/components/forms/BasicInput"
import type { WeekTuples } from "~/components/forms/TimesForm"
import { db } from "~/utils/db.server"
import {
  sendAppointmentToCustomer,
  sendAppointmentToOwner,
} from "~/utils/emails/sendAppointment"
import { resolveOrgFromRequest } from "~/utils/host.server"
import {
  createDateInTimezone,
  DEFAULT_TIMEZONE,
  formatTimeOnly,
  type SupportedTimezone,
} from "~/utils/timezone"
import { DEFAULT_WEEK_DAYS, normalizeWeekDays } from "~/utils/weekDays"
import type { Route } from "./+types/service.$serviceSlug"

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
    const events = await db.event.findMany({
      where: {
        start: {
          gte: new Date(selectedDate),
          lte: new Date(tommorrow),
        },
      },
    })
    return { events }
  }
  if (intent === "create_event") {
    const data = JSON.parse(formData.get("data") as string)

    // Org is resolved from hostname (subdomain or custom domain)
    const org = await resolveOrgFromRequest(request, undefined)
    if (!org) throw new Response("Org not found", { status: 404 })

    // Buscar servicio para verificar si requiere pago
    const service = await db.service.findUnique({
      where: { id: data.serviceId },
    })
    if (!service) throw new Response("Service not found", { status: 404 })

    // Check if User with this email already exists
    const existingUser = await db.user.findUnique({
      where: { email: data.customer.email },
    })

    const customer = await db.customer.create({
      data: {
        displayName: data.customer.displayName,
        email: data.customer.email,
        tel: data.customer.tel || "",
        comments: data.customer.comments || "",
        org: { connect: { id: org.id } },
        createdAt: new Date(),
        updatedAt: new Date(),
        // Link to existing User if found
        ...(existingUser && { user: { connect: { id: existingUser.id } } }),
      },
    })

    const startDate = new Date(data.start)
    const endDate = new Date(startDate.getTime() + data.duration * 60 * 1000)

    // Si el servicio requiere pago, redirigir a MP
    if (service.payment && Number(service.price) > 0) {
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
          price: Number(service.price),
          customerId: customer.id,
          start: startDate.toISOString(),
          end: endDate.toISOString(),
          backUrl: appUrl,
          webhookUrl: `${appUrl}/mercadopago/webhook`,
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

    // Servicio gratuito o sin MP configurado: crear evento directamente
    let event
    try {
      event = await db.event.create({
        data: {
          start: startDate,
          end: endDate,
          duration: data.duration,
          service: { connect: { id: data.serviceId } },
          title: data.title,
          status: data.status,
          org: { connect: { id: org.id } },
          customer: { connect: { id: customer.id } },
          allDay: false,
          archived: false,
          createdAt: new Date(),
          paid: !service.payment, // true si es gratuito
          type: "appointment",
          userId: org.ownerId,
          updatedAt: new Date(),
        },
        include: {
          customer: true,
          service: { include: { org: true } },
        },
      })
    } catch (e: unknown) {
      // Handle unique constraint violation (slot already taken)
      if (
        e &&
        typeof e === "object" &&
        "code" in e &&
        (e as { code: string }).code === "P2002"
      ) {
        return {
          success: false,
          error:
            "Este horario acaba de ser reservado. Por favor selecciona otro.",
        }
      }
      throw e
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
      )
    } catch (e) {
      console.error("Failed to schedule notifications:", e)
    }

    return { success: true, event, org }
  }
  return null
}

export const loader = async ({ request, params }: Route.LoaderArgs) => {
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
          status: "ACTIVE",
        },
      },
    },
  })
  if (!service) throw new Response(null, { status: 404 })

  // Verify service belongs to org
  if (service.orgId !== org.id) throw new Response(null, { status: 404 })

  // Normalize weekDays (idempotent: handles both legacy Spanish and English keys)
  const serviceWeekDays = normalizeWeekDays(
    service.weekDays as Record<string, any>,
    false,
  )
  const orgWeekDays = normalizeWeekDays(
    org.weekDays as Record<string, any>,
    true,
  )

  const serviceWithEnglishDays = {
    ...service,
    weekDays: Object.keys(serviceWeekDays).length > 0 ? serviceWeekDays : null,
    // Convert BigInt to Number for client-side usage
    duration: Number(service.duration),
    price: Number(service.price),
    points: Number(service.points),
    seats: Number(service.seats),
  }
  const orgWithNormalizedDays = {
    ...org,
    weekDays: orgWeekDays,
    // Include timezone from org or use default
    timezone: (org.timezone as SupportedTimezone) || DEFAULT_TIMEZONE,
  }

  return { org: orgWithNormalizedDays, service: serviceWithEnglishDays }
}

export default function Page({ loaderData }: Route.ComponentProps) {
  const { org, service } = loaderData
  const [time, setTime] = useState<string>()
  const [date, setDate] = useState<Date>()
  const [show, setShow] = useState("")
  const [timezone, setTimezone] = useState<SupportedTimezone>(
    org.timezone as SupportedTimezone,
  )
  const fetcher = useFetcher<typeof action>()

  const onSubmit = (vals: UserInfoForm) => {
    const result = userInfoSchema.safeParse(vals)
    if (!result.success) {
      result.error.issues.forEach((e) => {
        setError(e.path[0] as keyof UserInfoForm, { message: e.message })
      })
      return
    }
    if (!date) return
    const customer = result.data
    fetcher.submit(
      {
        intent: "create_event",
        data: JSON.stringify({
          start: date.toISOString(),
          dateString: date.toISOString(),
          customer,
          duration: service.duration,
          serviceId: service.id,
          title: service.name,
          status: "ACTIVE",
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

  const maxDate = getMaxDate(
    new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
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
      <article className="bg-[#f8f8f8] min-h-screen relative">
        <Header org={org} />
        <main className="shadow mx-auto rounded-xl p-8 min-h-[506px] md:w-max w-1/2 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand_blue mx-auto mb-4"></div>
            <p className="text-brand_gray">Reservando tu cita...</p>
          </div>
        </main>
      </article>
    )
  }

  return (
    <article className=" bg-[#f8f8f8] relative">
      <Header org={org} />
      <main className="shadow mx-auto rounded-xl p-8 min-h-[506px] md:w-max w-1/2">
        <section className={twMerge("flex flex-wrap")}>
          <InfoShower
            service={service}
            org={org}
            date={date}
            timezone={timezone}
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
                  onTimezoneChange={handleTimezoneChange}
                  selectedTime={time}
                />
              )}
            </>
          )}
          {show === "user_info" && (
            <Form onSubmit={handleSubmit(onSubmit)} className="flex-1">
              <h3 className="text-lg font-bold mb-6 text-brand_dark">
                Cuéntanos sobre ti
              </h3>
              <BasicInput
                register={register}
                name="displayName"
                label="Nombre"
                placeholder="Nombre completo"
                error={errors.displayName}
              />
              <div className="flex gap-4">
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
              isDisabled={!isValid || fetcher.state !== "idle"}
              onClick={handleSubmit(onSubmit)}
              type="button"
            >
              {fetcher.state !== "idle" ? "Agendando..." : "Continuar"}
            </PrimaryButton>
          </div>
        )}
      </main>
    </article>
  )
}
