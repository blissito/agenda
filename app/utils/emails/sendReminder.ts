import type { Customer, Event, Org, Service } from "@prisma/client"
import { getDefaultTermsAndConditions } from "~/routes/dash/dash.ajustes.constants"
import { DEFAULT_TIMEZONE, formatFullDateInTimezone } from "~/utils/timezone"
import { generateEventActionToken } from "~/utils/tokens"
import reminderTemplate from "./reminderTemplate"
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
 * Send appointment reminder email to customer
 */
export const sendReminder = async ({
  email,
  event,
}: {
  event: FullEvent
  email: string
}) => {
  const baseUrl = process.env.APP_URL || "https://denik.me"

  // Generate tokens for event actions
  const modifyToken = generateEventActionToken({
    eventId: event.id,
    customerId: event.customer.id,
    action: "modify",
  })
  const cancelToken = generateEventActionToken({
    eventId: event.id,
    customerId: event.customer.id,
    action: "cancel",
  })

  const modifyLink = `${baseUrl}/event/action?token=${modifyToken}`
  const cancelLink = `${baseUrl}/event/action?token=${cancelToken}`

  // Get timezone from org or use default
  const timezone =
    (event.service.org as Org & { timezone?: string }).timezone ||
    DEFAULT_TIMEZONE

  // Calculate hours until appointment
  const now = new Date()
  const hoursUntil = Math.round(
    (event.start.getTime() - now.getTime()) / (1000 * 60 * 60),
  )

  const sesTransport = getSesTransport()

  return sesTransport
    .sendMail({
      from: getRemitent(),
      subject: `Recordatorio: Tu cita en ${event.service.org.name} es ${hoursUntil === 1 ? "en 1 hora" : `en ${hoursUntil} horas`}`,
      to: email,
      html: reminderTemplate({
        displayName: event.service.org.shopKeeper ?? undefined,
        modifyLink,
        cancelLink,
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
      console.error("Error sending reminder email:", e)
      throw e
    })
}
