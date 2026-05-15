import type { Customer, Event, Org, Service } from "@prisma/client"
import { DEFAULT_TIMEZONE, formatFullDateInTimezone } from "~/utils/timezone"
import bookingConfirmationLinkTemplate from "./bookingConfirmationLinkTemplate"
import { getRemitent, getSesTransport } from "./ses"

type FullEvent = Event & {
  service: Service & { org: Org }
  customer: Customer
}

/**
 * Send the "confirm your bot-initiated booking" email.
 * Triggered from `createPublicBooking` in app/lib/booking.server.ts.
 */
export const sendBookingConfirmationLink = async ({
  email,
  event,
  token,
}: {
  email: string
  event: FullEvent
  token: string
}) => {
  const baseUrl = process.env.APP_URL || "https://denik.me"
  const confirmLink = `${baseUrl}/booking/confirm/${token}`

  const timezone =
    (event.service.org as Org & { timezone?: string }).timezone ||
    DEFAULT_TIMEZONE

  return getSesTransport()
    .sendMail({
      from: getRemitent(),
      subject: `Confirma tu reserva en ${event.service.org.name}`,
      to: email,
      html: bookingConfirmationLinkTemplate({
        confirmLink,
        serviceName: event.service.name,
        dateString: formatFullDateInTimezone(event.start, timezone),
        minutes: Number(event.duration),
        customerName: event.customer.displayName ?? "",
        orgName: event.service.org.name,
        address: event.service.org.address ?? undefined,
      }),
    })
    .catch((e: unknown) => {
      console.error("Error sending booking confirmation link:", e)
      throw e
    })
}
