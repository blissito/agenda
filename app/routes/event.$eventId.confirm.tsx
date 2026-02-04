/**
 * Route: /event/:eventId/confirm
 * Allows customer to confirm their appointment via email link
 */
import { redirect, data } from "react-router";
import type { Route } from "./+types/event.$eventId.confirm";
import { db } from "~/utils/db.server";
import { getSession } from "~/sessions";
import { formatFullDateInTimezone, DEFAULT_TIMEZONE } from "~/utils/timezone";

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const session = await getSession(request.headers.get("Cookie"));
  const access = session.get("customerEventAccess");

  // Verify session access
  if (
    !access ||
    access.eventId !== params.eventId ||
    access.expiresAt < Date.now()
  ) {
    throw redirect("/error?reason=session_expired");
  }

  const event = await db.event.findUnique({
    where: { id: params.eventId },
    include: {
      customer: true,
      service: { include: { org: true } },
    },
  });

  if (!event) {
    throw redirect("/error?reason=event_not_found");
  }

  const timezone =
    (event.service?.org as { timezone?: string })?.timezone || DEFAULT_TIMEZONE;

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
  };
};

export const action = async ({ request, params }: Route.ActionArgs) => {
  const session = await getSession(request.headers.get("Cookie"));
  const access = session.get("customerEventAccess");

  // Verify session access
  if (
    !access ||
    access.eventId !== params.eventId ||
    access.expiresAt < Date.now()
  ) {
    throw redirect("/error?reason=session_expired");
  }

  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "confirm") {
    await db.event.update({
      where: { id: params.eventId },
      data: {
        status: "CONFIRMED",
        updatedAt: new Date(),
      },
    });

    return { success: true, message: "Cita confirmada exitosamente" };
  }

  return { success: false, message: "Acción no válida" };
};

export default function ConfirmEventPage({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const { event, service, customer } = loaderData;

  if (actionData?.success) {
    return (
      <main className="min-h-screen bg-[#f8f8f8] flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
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
          <p className="text-gray-600">
            Tu cita ha sido confirmada exitosamente.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8f8f8] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Confirmar Cita
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
          <div>
            <p className="text-sm text-gray-500">Estado actual</p>
            <p className="font-medium">
              {event.status === "CONFIRMED" ? (
                <span className="text-green-600">Confirmada</span>
              ) : (
                <span className="text-yellow-600">Pendiente</span>
              )}
            </p>
          </div>
        </div>

        {event.status !== "CONFIRMED" && (
          <form method="post">
            <input type="hidden" name="intent" value="confirm" />
            <button
              type="submit"
              className="w-full bg-brand_blue text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Confirmar mi cita
            </button>
          </form>
        )}

        {event.status === "CONFIRMED" && (
          <div className="text-center text-green-600 font-medium">
            Esta cita ya está confirmada
          </div>
        )}
      </div>
    </main>
  );
}
