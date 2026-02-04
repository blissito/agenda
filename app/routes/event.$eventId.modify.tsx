/**
 * Route: /event/:eventId/modify
 * Allows customer to modify their appointment via email link
 */
import { redirect } from "react-router";
import type { Route } from "./+types/event.$eventId.modify";
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
      notes: event.notes,
    },
    service: event.service
      ? {
          name: event.service.name,
          orgName: event.service.org.name,
          orgSlug: event.service.org.slug,
          serviceSlug: event.service.slug,
        }
      : null,
    customer: {
      displayName: event.customer?.displayName,
      email: event.customer?.email,
      tel: event.customer?.tel,
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

  if (intent === "update_notes") {
    const notes = formData.get("notes") as string;

    await db.event.update({
      where: { id: params.eventId },
      data: {
        notes,
        updatedAt: new Date(),
      },
    });

    return { success: true, message: "Notas actualizadas" };
  }

  return { success: false, message: "Acción no válida" };
};

export default function ModifyEventPage({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const { event, service, customer } = loaderData;

  return (
    <main className="min-h-screen bg-[#f8f8f8] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Modificar Cita
        </h1>

        {actionData?.success && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg text-center">
            {actionData.message}
          </div>
        )}

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
          <div className="border-b pb-4">
            <p className="text-sm text-gray-500">Cliente</p>
            <p className="font-medium">{customer.displayName}</p>
            <p className="text-sm text-gray-500">{customer.email}</p>
          </div>
        </div>

        <form method="post" className="space-y-4">
          <input type="hidden" name="intent" value="update_notes" />

          <div>
            <label
              htmlFor="notes"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Notas adicionales
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              defaultValue={event.notes || ""}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand_blue focus:border-transparent"
              placeholder="Agrega notas o comentarios para tu cita..."
            />
          </div>

          <button
            type="submit"
            className="w-full bg-brand_blue text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Guardar cambios
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500 mb-2">
            ¿Necesitas cambiar la fecha u hora?
          </p>
          <a
            href={`/event/${event.id}/cancel`}
            className="text-red-600 hover:text-red-700 text-sm font-medium"
          >
            Cancelar y reagendar
          </a>
        </div>
      </div>
    </main>
  );
}
