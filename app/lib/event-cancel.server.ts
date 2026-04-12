import { cancelEventJobs } from "~/jobs/agenda.server"
import { cancelMeetEvent } from "~/lib/google-meet.server"
import { cancelZoomMeeting } from "~/lib/zoom.server"
import { db } from "~/utils/db.server"

/**
 * Cancelación universal de un evento:
 *   - cancela meeting en Google Calendar (si `calendarEventId`)
 *   - cancela meeting en Zoom (si `zoomMeetingId`)
 *   - cancela jobs pendientes (recordatorio, encuesta)
 *   - marca `status: "CANCELLED"` + `archived: true`
 *
 * Los fallos de integraciones se loggean pero no abortan la cancelación
 * — el evento debe quedar marcado aunque alguna API externa falle.
 *
 * @param orgId opcional: si se pasa, valida que el evento pertenezca a esa org.
 * @returns el evento actualizado, o null si no existe / no pertenece a la org.
 */
export async function cancelEventFully({
  eventId,
  orgId,
}: {
  eventId: string
  orgId?: string
}) {
  const event = await db.event.findUnique({
    where: { id: eventId },
    include: { service: { include: { org: true } } },
  })

  if (!event) return null
  if (orgId && event.orgId !== orgId) return null

  const org = event.service?.org

  if (org && event.calendarEventId) {
    try {
      await cancelMeetEvent(org, event.calendarEventId)
    } catch (e) {
      console.error("[cancelEventFully] Meet cancel failed:", e instanceof Error ? e.message : e)
    }
  }

  if (org && event.zoomMeetingId) {
    try {
      await cancelZoomMeeting(org, event.zoomMeetingId)
    } catch (e) {
      console.error("[cancelEventFully] Zoom cancel failed:", e instanceof Error ? e.message : e)
    }
  }

  try {
    await cancelEventJobs(eventId)
  } catch (e) {
    console.error("[cancelEventFully] jobs cancel failed:", e instanceof Error ? e.message : e)
  }

  return db.event.update({
    where: { id: eventId },
    data: {
      status: "CANCELLED",
      archived: true,
      updatedAt: new Date(),
    },
  })
}
