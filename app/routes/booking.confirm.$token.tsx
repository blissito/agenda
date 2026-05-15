/**
 * /booking/confirm/:token
 *
 * Lands the customer here from the email triggered by `createPublicBooking`.
 * On first visit:
 *   1. validates the token
 *   2. marks Event.confirmedAt = now() + status = "confirmed"
 *   3. creates Meet/Zoom (snapshots videoProvider on the event)
 *   4. notifies the owner + sends the customer their own copy with the meeting link
 *   5. schedules reminders / survey
 *
 * Idempotent: re-visiting the link after confirmation just renders the success page.
 */
import { data } from "react-router"
import { createMeetLink } from "~/lib/google-meet.server"
import { createZoomMeeting } from "~/lib/zoom.server"
import { db } from "~/utils/db.server"
import {
  sendAppointmentToCustomer,
  sendAppointmentToOwner,
} from "~/utils/emails/sendAppointment"
import { verifyEventActionToken } from "~/utils/tokens"
import { resolveVideoProvider } from "~/utils/videoProvider.server"
import type { Route } from "./+types/booking.confirm.$token"

export const loader = async ({ params }: Route.LoaderArgs) => {
  const payload = verifyEventActionToken(params.token)
  if (!payload || payload.action !== "confirm") {
    return data(
      { ok: false as const, reason: "invalid_token" as const },
      { status: 400 },
    )
  }

  const event = await db.event.findUnique({
    where: { id: payload.eventId },
    include: {
      customer: true,
      service: { include: { org: true } },
    },
  })

  if (!event || !event.service || !event.customer) {
    return data({ ok: false as const, reason: "not_found" as const }, { status: 404 })
  }

  if (event.customerId !== payload.customerId) {
    return data({ ok: false as const, reason: "unauthorized" as const }, { status: 403 })
  }

  // Already confirmed? Just render the success view.
  if (event.confirmedAt) {
    return {
      ok: true as const,
      alreadyConfirmed: true,
      event: serializeEvent(event),
    }
  }

  const now = new Date()
  let updated = await db.event.update({
    where: { id: event.id },
    data: { confirmedAt: now, status: "confirmed", updatedAt: now },
    include: {
      customer: true,
      service: { include: { org: true } },
    },
  })

  // Create Meet/Zoom link (best-effort).
  const provider = resolveVideoProvider({ org: updated.service!.org, service: updated.service! })
  if (provider === "meet") {
    try {
      const { meetingLink, calendarEventId, calendarHtmlLink } = await createMeetLink({
        org: updated.service!.org,
        event: updated,
        service: updated.service!,
        customer: updated.customer!,
      })
      updated = await db.event.update({
        where: { id: updated.id },
        data: {
          meetingLink,
          calendarEventId,
          calendarHtmlLink,
          videoProvider: "meet",
        },
        include: { customer: true, service: { include: { org: true } } },
      })
    } catch (e) {
      console.error("[booking.confirm] Meet creation failed:", e)
      await db.event.update({
        where: { id: updated.id },
        data: { videoProvider: "none" },
      })
    }
  } else if (provider === "zoom") {
    try {
      const { meetingLink, meetingId } = await createZoomMeeting({
        org: updated.service!.org,
        event: updated,
        service: updated.service!,
        customer: updated.customer!,
      })
      updated = await db.event.update({
        where: { id: updated.id },
        data: {
          meetingLink,
          zoomMeetingId: meetingId,
          videoProvider: "zoom",
        },
        include: { customer: true, service: { include: { org: true } } },
      })
    } catch (e) {
      console.error("[booking.confirm] Zoom creation failed:", e)
      await db.event.update({
        where: { id: updated.id },
        data: { videoProvider: "none" },
      })
    }
  } else {
    await db.event.update({
      where: { id: updated.id },
      data: { videoProvider: "none" },
    })
  }

  const { emit } = await import("~/plugins/index.server")
  await import("~/plugins/register.server")
  await emit(
    "booking.created",
    { event: updated, service: updated.service!, customer: updated.customer! },
    updated.service!.org.id,
  )

  try {
    await sendAppointmentToCustomer({
      email: updated.customer!.email,
      event: updated as any,
    })
    if (updated.service!.org.email) {
      await sendAppointmentToOwner({
        email: updated.service!.org.email,
        event: updated as any,
      })
    }
  } catch (e) {
    console.error("[booking.confirm] Email send failed:", e)
  }

  try {
    const { scheduleEventNotifications } = await import("~/jobs/definitions.server")
    await scheduleEventNotifications(
      updated.id,
      updated.start,
      updated.end ?? new Date(updated.start.getTime() + Number(updated.duration) * 60000),
      updated.service!.config as
        | { reminder?: boolean; survey?: boolean; reminderHours?: number | null }
        | undefined,
      updated.service!.org.timezone,
    )
  } catch (e) {
    console.error("[booking.confirm] Failed to schedule notifications:", e)
  }

  return {
    ok: true as const,
    alreadyConfirmed: false,
    event: serializeEvent(updated),
  }
}

function serializeEvent(e: any) {
  return {
    id: e.id,
    title: e.title,
    start: e.start,
    duration: Number(e.duration),
    meetingLink: e.meetingLink,
    calendarHtmlLink: e.calendarHtmlLink,
    orgName: e.service?.org?.name,
    serviceName: e.service?.name,
    address: e.service?.org?.address,
  }
}

export default function BookingConfirmPage({ loaderData }: Route.ComponentProps) {
  if (!loaderData.ok) {
    const messages: Record<string, string> = {
      invalid_token: "El link es inválido o ya expiró.",
      not_found: "No encontramos tu reserva.",
      unauthorized: "Este link no corresponde a tu cuenta.",
    }
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#f8f8f8] px-4">
        <div className="max-w-md text-center bg-white rounded-2xl p-8 shadow">
          <h1 className="text-xl font-bold text-brand_dark mb-2">Ups</h1>
          <p className="text-brand_gray">
            {messages[loaderData.reason] ?? "Algo salió mal."}
          </p>
        </div>
      </main>
    )
  }

  const { event, alreadyConfirmed } = loaderData
  return (
    <main className="min-h-screen flex items-center justify-center bg-[#f8f8f8] px-4">
      <div className="max-w-md w-full text-center bg-white rounded-2xl p-8 shadow">
        <div className="text-5xl mb-4">✓</div>
        <h1 className="text-2xl font-bold text-brand_dark mb-2">
          {alreadyConfirmed ? "Tu reserva ya estaba confirmada" : "¡Reserva confirmada!"}
        </h1>
        <p className="text-brand_gray mb-6">
          {event.serviceName} en {event.orgName}
        </p>
        <div className="text-left bg-[#f5f5f5] rounded-xl p-4 mb-4">
          <p className="text-sm text-brand_dark">
            <strong>Cuándo:</strong>{" "}
            {new Date(event.start).toLocaleString("es-MX", {
              dateStyle: "full",
              timeStyle: "short",
            })}
          </p>
          <p className="text-sm text-brand_dark mt-1">
            <strong>Duración:</strong> {event.duration} min
          </p>
          {event.address ? (
            <p className="text-sm text-brand_dark mt-1">
              <strong>Dónde:</strong> {event.address}
            </p>
          ) : null}
        </div>
        {event.meetingLink ? (
          <a
            href={event.meetingLink}
            target="_blank"
            rel="noreferrer"
            className="inline-block bg-brand_blue text-white px-6 py-3 rounded-full font-medium"
          >
            Unirme a la reunión
          </a>
        ) : null}
      </div>
    </main>
  )
}
