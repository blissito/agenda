import type { Customer, Event, Org, Service } from "@prisma/client"
import { DEFAULT_TIMEZONE, formatFullDateInTimezone } from "~/utils/timezone"
import { generateEventActionToken } from "~/utils/tokens"
import reminderTemplate from "./reminderTemplate"
import { getRemitent, getSesTransport } from "./ses"

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
      }),
    })
    .catch((e: unknown) => {
      console.error("Error sending reminder email:", e)
      throw e
    })
}
