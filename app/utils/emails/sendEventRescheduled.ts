import type { Customer, Event, Org, Service, User } from "@prisma/client"
import { getDefaultTermsAndConditions } from "~/routes/dash/dash.ajustes.constants"
import { DEFAULT_TIMEZONE, formatFullDateInTimezone } from "~/utils/timezone"
import { generateEventActionToken, generateUserToken } from "~/utils/tokens"
import eventRescheduledTemplate from "./eventRescheduledTemplate"
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

type ServiceWithOrg = Service & { org: Org & { owner?: User } }
type FullEvent = Event & { service: ServiceWithOrg; customer: Customer }

const formatStart = (event: FullEvent, start: Date) => {
  const tz =
    (event.service.org as Org & { timezone?: string }).timezone ||
    DEFAULT_TIMEZONE
  return formatFullDateInTimezone(start, tz)
}

export const sendEventRescheduledToCustomer = async ({
  email,
  event,
  oldStart,
}: {
  email: string
  event: FullEvent
  oldStart: Date
}) => {
  const baseUrl = process.env.APP_URL || "https://denik.me"

  const confirmToken = generateEventActionToken({
    eventId: event.id,
    customerId: event.customer.id,
    action: "confirm",
  })
  const confirmLink = `${baseUrl}/event/action?token=${confirmToken}`

  const sesTransport = getSesTransport()

  return sesTransport
    .sendMail({
      from: getRemitent(),
      subject: `🗓️ Tu cita en ${event.service.org.name} cambió de fecha`,
      to: email,
      html: eventRescheduledTemplate({
        recipient: "customer",
        oldDateString: formatStart(event, oldStart),
        newDateString: formatStart(event, event.start),
        displayName: event.service.org.shopKeeper ?? undefined,
        address: event.service.org.address ?? undefined,
        minutes: event.duration ? Number(event.duration) : undefined,
        serviceName: event.service.name,
        orgName: event.service.org.name,
        customerName: event.customer.displayName ?? undefined,
        meetingLink: (event as any).meetingLink ?? undefined,
        confirmLink,
        manageLink: `${baseUrl}/mi-cuenta`,
        termsAndConditions: resolveTermsAndConditions(event.service.org),
      }),
    })
    .catch((e: unknown) => {
      console.error("Error sending reschedule email to customer:", e)
    })
}

export const sendEventRescheduledToOwner = async ({
  email,
  event,
  oldStart,
}: {
  email: string
  event: FullEvent
  oldStart: Date
}) => {
  if (!email) return
  const baseUrl = process.env.APP_URL || "https://denik.me"
  const ownerToken = generateUserToken(email)
  const link = `${baseUrl}/signin?token=${ownerToken}&next=${encodeURIComponent("/dash/agenda")}`

  const sesTransport = getSesTransport()

  return sesTransport
    .sendMail({
      from: getRemitent(),
      subject: `🗓️ ${event.customer.displayName ?? "Una cita"} reagendó su cita`,
      to: email,
      html: eventRescheduledTemplate({
        recipient: "owner",
        oldDateString: formatStart(event, oldStart),
        newDateString: formatStart(event, event.start),
        displayName: event.service.org.shopKeeper ?? undefined,
        address: event.service.org.address ?? undefined,
        minutes: event.duration ? Number(event.duration) : undefined,
        serviceName: event.service.name,
        orgName: event.service.org.name,
        customerName: event.customer.displayName ?? undefined,
        manageLink: link,
        termsAndConditions: resolveTermsAndConditions(event.service.org),
      }),
    })
    .catch((e: unknown) => {
      console.error("Error sending reschedule email to owner:", e)
    })
}
