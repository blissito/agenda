/**
 * Route: /event/:eventId/cancel
 * Allows customer to cancel their appointment via email link
 */

import { useState } from "react"
import { redirect } from "react-router"
import { cancelEventJobs } from "~/jobs/agenda.server"
import { getSession } from "~/sessions"
import { db } from "~/utils/db.server"
import { DEFAULT_TIMEZONE, formatFullDateInTimezone } from "~/utils/timezone"
import { getServicePublicUrl } from "~/utils/urls"
import type { Route } from "./+types/event.$eventId.cancel"

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const session = await getSession(request.headers.get("Cookie"))
  const access = session.get("customerEventAccess")

  // Verify session access
  if (
    !access ||
    access.eventId !== params.eventId ||
    access.expiresAt < Date.now()
  ) {
    throw redirect("/error?reason=session_expired")
  }

  const event = await db.event.findUnique({
    where: { id: params.eventId },
    include: {
      customer: true,
      service: { include: { org: true } },
    },
  })

  if (!event) {
    throw redirect("/error?reason=event_not_found")
  }

  const timezone =
    (event.service?.org as { timezone?: string })?.timezone || DEFAULT_TIMEZONE

  // Generate rebooking URL
  const rebookUrl = event.service
    ? getServicePublicUrl(event.service.org.slug, event.service.slug)
    : null

  return {
    event: {
      id: event.id,
      status: event.status,
      start: event.start.toISOString(),
      startFormatted: formatFullDateInTimezone(event.start, timezone),
    },
    service: event.service
      ? {
          name: event.service.name,
          orgName: event.service.org.name,
        }
      : null,
    customer: {
      displayName: event.customer?.displayName,
    },
    rebookUrl,
  }
}

export const action = async ({ request, params }: Route.ActionArgs) => {
  const session = await getSession(request.headers.get("Cookie"))
  const access = session.get("customerEventAccess")

  // Verify session access
  if (
    !access ||
    access.eventId !== params.eventId ||
    access.expiresAt < Date.now()
  ) {
    throw redirect("/error?reason=session_expired")
  }

  const formData = await request.formData()
  const intent = formData.get("intent")

  if (intent === "cancel") {
    // Cancel pending jobs (reminder, survey)
    await cancelEventJobs(params.eventId)

    await db.event.update({
      where: { id: params.eventId },
      data: {
        status: "CANCELLED",
        archived: true,
        updatedAt: new Date(),
      },
    })

    return { success: true, cancelled: true, message: "Cita cancelada" }
  }

  return { success: false, message: "Acción no válida" }
}

export default function CancelEventPage({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const { event, service, customer, rebookUrl } = loaderData
  const [showConfirm, setShowConfirm] = useState(false)

  if (actionData?.cancelled) {
    return (
      <main className="min-h-screen bg-[#f8f8f8] flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Cita Cancelada
          </h1>
          <p className="text-gray-600 mb-6">Tu cita ha sido cancelada.</p>

          {rebookUrl && (
            <a
              href={rebookUrl}
              className="inline-block bg-brand_blue text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Agendar nueva cita
            </a>
          )}
        </div>
      </main>
    )
  }

  if (event.status === "CANCELLED") {
    return (
      <main className="min-h-screen bg-[#f8f8f8] flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Cita ya cancelada
          </h1>
          <p className="text-gray-600 mb-6">
            Esta cita ya fue cancelada anteriormente.
          </p>

          {rebookUrl && (
            <a
              href={rebookUrl}
              className="inline-block bg-brand_blue text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Agendar nueva cita
            </a>
          )}
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#f8f8f8] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Cancelar Cita
        </h1>

        <div className="space-y-4 mb-8">
          <div className="border-b pb-4">
            <p className="text-sm text-gray-500">Servicio</p>
            <p className="font-medium">{service?.name}</p>
          </div>
          <div className="border-b pb-4">
            <p className="text-sm text-gray-500">Fecha y hora</p>
            <p className="font-medium">{event.startFormatted}</p>
          </div>
          <div className="border-b pb-4">
            <p className="text-sm text-gray-500">Negocio</p>
            <p className="font-medium">{service?.orgName}</p>
          </div>
        </div>

        {!showConfirm ? (
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800 text-sm">
                <strong>Atención:</strong> Esta acción no se puede deshacer.
                ¿Estás seguro de que quieres cancelar tu cita?
              </p>
            </div>

            <button
              onClick={() => setShowConfirm(true)}
              className="w-full bg-red-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-red-700 transition-colors"
            >
              Cancelar mi cita
            </button>

            <a
              href={`/event/${event.id}/modify`}
              className="block w-full text-center py-3 px-6 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Volver
            </a>
          </div>
        ) : (
          <form method="post" className="space-y-4">
            <input type="hidden" name="intent" value="cancel" />

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 text-sm font-medium">
                Confirma la cancelación de tu cita
              </p>
            </div>

            <button
              type="submit"
              className="w-full bg-red-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-red-700 transition-colors"
            >
              Sí, cancelar definitivamente
            </button>

            <button
              type="button"
              onClick={() => setShowConfirm(false)}
              className="w-full py-3 px-6 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              No, mantener mi cita
            </button>
          </form>
        )}
      </div>
    </main>
  )
}
