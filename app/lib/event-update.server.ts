import { cancelEventJobs } from "~/jobs/agenda.server"
import { scheduleReminder, scheduleSurvey } from "~/jobs/definitions.server"
import { patchMeetEvent } from "~/lib/google-meet.server"
import { awardPoints } from "~/lib/loyalty.server"
import { patchZoomMeeting } from "~/lib/zoom.server"
import { db } from "~/utils/db.server"
import {
  sendEventRescheduledToCustomer,
  sendEventRescheduledToOwner,
} from "~/utils/emails/sendEventRescheduled"

type UpdateEventChanges = {
  start?: Date
  end?: Date
  duration?: number
  customerId?: string
  employeeId?: string | null
  serviceId?: string
  paid?: boolean
  payment_method?: string
  notes?: string
  title?: string
}

/**
 * Universal event updater.
 *
 *  - Persists the changes
 *  - If `start` changed: cancels pending jobs (confirmation/reminder/survey),
 *    reschedules them against the new start, and emails customer + owner.
 *  - If `start` changed and the event was already confirmed, resets it to
 *    pending and clears `confirmationSentAt` so the new confirmation flow runs.
 *  - Failures in jobs/emails are logged but do NOT abort the update — the
 *    event already moved in DB.
 *
 *  @param orgId optional: validates the event belongs to that org.
 *  @returns the updated event with relations, or null if not found / not allowed.
 */
export async function updateEventFully({
  eventId,
  changes,
  orgId,
}: {
  eventId: string
  changes: UpdateEventChanges
  orgId?: string
}) {
  const before = await db.event.findUnique({
    where: { id: eventId },
    include: {
      customer: true,
      service: { include: { org: true } },
    },
  })

  if (!before) return null
  if (orgId && before.orgId !== orgId) return null

  const startChanged =
    !!changes.start &&
    changes.start.getTime() !== before.start.getTime()

  const wasConfirmed =
    before.status === "confirmed" ||
    before.status === "CONFIRMED" ||
    before.status === "ACTIVE"

  // On reschedule: the reschedule email itself acts as the confirmation
  // request (it carries the "Confirmar cita" button), so we mark the
  // confirmation as already sent (no separate 12h job will be programmed)
  // and reset reminderSentAt so the reminder fires fresh against the new start.
  // If the event was already confirmed, we revert to "pending" because the
  // customer needs to confirm the new date.
  const data: Record<string, unknown> = {
    ...changes,
    updatedAt: new Date(),
  }
  if (startChanged) {
    data.confirmationSentAt = new Date()
    data.reminderSentAt = null
    if (wasConfirmed) data.status = "pending"
  }

  const updated = (await db.event.update({
    where: { id: eventId },
    data: data as any,
    include: {
      customer: true,
      service: { include: { org: true } },
    },
  })) as typeof before

  // Award loyalty points when the event transitions to paid (manual mark from dash).
  // awardPoints itself no-ops if the org doesn't have loyalty enabled and is
  // idempotente per event. Los puntos vienen explícitamente de `service.points`
  // (definido por el owner). Si es 0 → no se acreditan puntos.
  const becamePaid =
    changes.paid === true && !before.paid && updated.customerId && updated.service
  if (becamePaid) {
    const basePoints = Number(updated.service!.points)
    if (Number.isFinite(basePoints) && basePoints > 0) {
      try {
        await awardPoints({
          customerId: updated.customerId as string,
          orgId: updated.orgId,
          eventId: updated.id,
          basePoints,
        })
      } catch (e) {
        console.error(
          "[updateEventFully] awardPoints failed:",
          e instanceof Error ? e.message : e,
        )
      }
    }
  }

  if (!startChanged) return updated

  // Update external calendar (Google Meet) if linked
  if (updated.calendarEventId && updated.start && updated.end && updated.service?.org) {
    try {
      await patchMeetEvent({
        org: updated.service.org as any,
        calendarEventId: updated.calendarEventId,
        start: updated.start,
        end: updated.end,
      })
    } catch (e) {
      console.error(
        "[updateEventFully] patchMeetEvent failed:",
        e instanceof Error ? e.message : e,
      )
    }
  }

  // Update external Zoom meeting if linked
  if (updated.zoomMeetingId && updated.start && updated.duration && updated.service?.org) {
    try {
      await patchZoomMeeting({
        org: updated.service.org as any,
        meetingId: updated.zoomMeetingId,
        start: updated.start,
        duration: Number(updated.duration),
      })
    } catch (e) {
      console.error(
        "[updateEventFully] patchZoomMeeting failed:",
        e instanceof Error ? e.message : e,
      )
    }
  }

  // Reschedule jobs against the new start
  try {
    await cancelEventJobs(eventId)
  } catch (e) {
    console.error(
      "[updateEventFully] cancelEventJobs failed:",
      e instanceof Error ? e.message : e,
    )
  }

  // On reschedule: re-program reminder + survey, but NOT confirmation —
  // the rescheduled email itself doubles as the confirmation request.
  if (updated.start && updated.end && updated.service) {
    const config = updated.service.config as
      | {
          reminder?: boolean
          survey?: boolean
          reminderHours?: number | null
        }
      | undefined

    if (config?.reminder !== false) {
      try {
        await scheduleReminder(
          eventId,
          updated.start,
          config?.reminderHours ?? undefined,
        )
      } catch (e) {
        console.error(
          "[updateEventFully] reschedule reminder failed:",
          e instanceof Error ? e.message : e,
        )
      }
    }

    if (config?.survey !== false) {
      try {
        await scheduleSurvey(
          eventId,
          updated.end,
          (updated.service.org as { timezone?: string | null }).timezone,
        )
      } catch (e) {
        console.error(
          "[updateEventFully] reschedule survey failed:",
          e instanceof Error ? e.message : e,
        )
      }
    }
  }

  // Notify customer + owner
  if (updated.customer?.email && updated.service) {
    try {
      await sendEventRescheduledToCustomer({
        email: updated.customer.email,
        event: updated as any,
        oldStart: before.start,
      })
    } catch (e) {
      console.error(
        "[updateEventFully] customer email failed:",
        e instanceof Error ? e.message : e,
      )
    }
  }

  const ownerId = (updated.service?.org as { ownerId?: string } | undefined)?.ownerId
  const owner = ownerId
    ? await db.user.findUnique({ where: { id: ownerId } })
    : null
  const notifyEmail =
    owner?.email ||
    (updated.service?.org as { email?: string } | undefined)?.email
  if (notifyEmail) {
    try {
      await sendEventRescheduledToOwner({
        email: notifyEmail,
        event: updated as any,
        oldStart: before.start,
      })
    } catch (e) {
      console.error(
        "[updateEventFully] owner email failed:",
        e instanceof Error ? e.message : e,
      )
    }
  }

  return updated
}
