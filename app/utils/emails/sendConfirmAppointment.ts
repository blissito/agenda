import type { Customer, Event, Org, Service } from "@prisma/client"
import { getDefaultTermsAndConditions } from "~/routes/dash/dash.ajustes.constants"
import { DEFAULT_TIMEZONE, formatFullDateInTimezone } from "~/utils/timezone"
import { generateEventActionToken } from "~/utils/tokens"
import confirmAppointmentTemplate from "./confirmAppointmentTemplate"
import { getRemitent, getSesTransport } from "./ses"

function resolveTermsAndConditions(org: Org): string {
  const config = (org as Org & { config?: Record<string, unknown> | null }).config
  const stored = config?.termsAndConditions as string | null | undefined
  if (stored) return stored
  return getDefaultTermsAndConditions({
    cancellationWindowMinutes: config?.cancellationWindow as string | undefined,
    rescheduleWindowMinutes: config?.rescheduleWindow as string | undefined,
    maxReschedulesValue: config?.maxReschedules as string | undefined,
    orgName: org.name,
  })
}

type ServiceWithOrg = Service & {
  org: Org
}

type FullEvent = Event & {
  service: ServiceWithOrg
  customer: Customer
}

/**
 * Send confirmation request email to customer (typically 12 hours before the appointment)
 */
export const sendConfirmAppointment = async ({
  email,
  event,
}: {
  event: FullEvent
  email: string
}) => {
  const baseUrl = process.env.APP_URL || "https://denik.me"

  const confirmToken = generateEventActionToken({
    eventId: event.id,
    customerId: event.customer.id,
    action: "confirm",
  })

  const confirmLink = `${baseUrl}/event/action?token=${confirmToken}`

  const timezone =
    (event.service.org as Org & { timezone?: string }).timezone ||
    DEFAULT_TIMEZONE

  const now = new Date()
  const hoursUntil = Math.round(
    (event.start.getTime() - now.getTime()) / (1000 * 60 * 60),
  )

  const sesTransport = getSesTransport()

  return sesTransport
    .sendMail({
      from: getRemitent(),
      subject: `Confirma tu cita en ${event.service.org.name}`,
      to: email,
      html: confirmAppointmentTemplate({
        displayName: event.service.org.shopKeeper ?? undefined,
        confirmLink,
        meetingLink: (event as any).meetingLink ?? undefined,
        address: event.service.org.address ?? undefined,
        dateString: formatFullDateInTimezone(event.start, timezone),
        minutes: event.duration ? Number(event.duration) : undefined,
        serviceName: event.service.name,
        orgName: event.service.org.name,
        customerName: event.customer.displayName ?? undefined,
        hoursUntil,
        termsAndConditions: resolveTermsAndConditions(event.service.org),
      }),
    })
    .catch((e: unknown) => {
      console.error("Error sending confirmation email:", e)
      throw e
    })
}
