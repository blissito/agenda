/**
 * Route: /event/:eventId/confirm
 * Shows confirmation success page after customer clicks email link
 * The event is already confirmed in event.action.tsx
 */
import { data, redirect } from "react-router"
import { commitSession, getSession } from "~/sessions"
import { db } from "~/utils/db.server"
import { DEFAULT_TIMEZONE, formatFullDateInTimezone } from "~/utils/timezone"
import type { Route } from "./+types/event.$eventId.confirm"

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

  // Check if a new user account was created
  const newUserCreated = session.get("newUserCreated") || false
  if (newUserCreated) {
    session.unset("newUserCreated")
  }

  const timezone =
    (event.service?.org as { timezone?: string })?.timezone || DEFAULT_TIMEZONE

  const headers: HeadersInit = {}
  if (newUserCreated) {
    headers["Set-Cookie"] = await commitSession(session)
  }

  return data(
    {
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
        email: event.customer?.email,
      },
      newUserCreated,
    },
    { headers },
  )
}

export default function ConfirmEventPage({ loaderData }: Route.ComponentProps) {
  const { event, service, customer, newUserCreated } = loaderData

  return (
    <main className="min-h-screen bg-[#f8f8f8] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
        <a href="https://denik.me" target="_blank" rel="noopener noreferrer">
          <img
            src="https://i.imgur.com/sunNMiV.png"
            alt="Denik"
            className="w-28 mx-auto mb-6"
          />
        </a>
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          ¡Cita Confirmada!
        </h1>
        <p className="text-gray-600 mb-6">
          Tu cita ha sido confirmada exitosamente.
        </p>

        <div className="text-left space-y-4 border-t pt-6">
          <div>
            <p className="text-sm text-gray-500">Servicio</p>
            <p className="font-medium">{service?.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Fecha y hora</p>
            <p className="font-medium">{event.startFormatted}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Negocio</p>
            <p className="font-medium">{service?.orgName}</p>
          </div>
        </div>

        {newUserCreated && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6 text-left">
            <p className="text-blue-800 text-sm">
              Tu cuenta Denik ha sido creada con{" "}
              <strong>{customer?.email}</strong>. Podrás ver todas tus citas
              desde tu portal.
            </p>
          </div>
        )}
      </div>
    </main>
  )
}
