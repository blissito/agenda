/**
 * Route: /survey?token=xxx&rating=N (optional)
 * Allows customer to submit feedback after their appointment
 */
import { redirect, data } from "react-router";
import type { Route } from "./+types/survey";
import { db } from "~/utils/db.server";
import { verifySurveyToken } from "~/utils/emails/sendSurvey";
import { formatFullDateInTimezone, DEFAULT_TIMEZONE } from "~/utils/timezone";
import { RatingPicker } from "~/components/survey/RatingPicker";
import { sendNegativeReviewAlert } from "~/utils/emails/sendNegativeReviewAlert";

export const loader = async ({ request }: Route.LoaderArgs) => {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  const preRating = url.searchParams.get("rating");

  if (!token) {
    return {
      error: "Token requerido",
      errorType: "missing_token" as const,
    };
  }

  const payload = verifySurveyToken(token);

  if (!payload) {
    return {
      error: "El link ha expirado o no es válido",
      errorType: "invalid_token" as const,
    };
  }

  // Check if already responded
  const existing = await db.surveyResponse.findUnique({
    where: { eventId: payload.eventId },
  });

  if (existing) {
    return {
      alreadySubmitted: true,
      rating: existing.rating,
    };
  }

  // Load event info
  const event = await db.event.findUnique({
    where: { id: payload.eventId },
    include: {
      customer: true,
      service: { include: { org: true } },
    },
  });

  if (!event) {
    return {
      error: "Evento no encontrado",
      errorType: "event_not_found" as const,
    };
  }

  if (event.customerId !== payload.customerId) {
    return {
      error: "No autorizado",
      errorType: "unauthorized" as const,
    };
  }

  const timezone =
    (event.service?.org as { timezone?: string })?.timezone || DEFAULT_TIMEZONE;

  return {
    event: {
      id: event.id,
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
    preRating: preRating ? parseInt(preRating, 10) : null,
    token, // Pass token to form for action
  };
};

export const action = async ({ request }: Route.ActionArgs) => {
  const formData = await request.formData();
  const token = formData.get("token") as string;
  const rating = parseInt(formData.get("rating") as string, 10);
  const comment = (formData.get("comment") as string) || null;

  if (!token) {
    return data({ error: "Token requerido" }, { status: 400 });
  }

  const payload = verifySurveyToken(token);

  if (!payload) {
    return data({ error: "Token inválido o expirado" }, { status: 400 });
  }

  // Validate rating
  if (isNaN(rating) || rating < 1 || rating > 5) {
    return data({ error: "Calificación inválida (debe ser 1-5)" }, { status: 400 });
  }

  // Check if already responded
  const existing = await db.surveyResponse.findUnique({
    where: { eventId: payload.eventId },
  });

  if (existing) {
    return { success: true, alreadySubmitted: true, rating: existing.rating };
  }

  // Load event to get orgId and serviceId
  const event = await db.event.findUnique({
    where: { id: payload.eventId },
  });

  if (!event || !event.serviceId) {
    return data({ error: "Evento no encontrado" }, { status: 404 });
  }

  // Create survey response
  await db.surveyResponse.create({
    data: {
      eventId: payload.eventId,
      customerId: payload.customerId,
      orgId: event.orgId,
      serviceId: event.serviceId,
      rating,
      comment,
      createdAt: new Date(),
    },
  });

  // Send alert to business owner if rating is low (< 3)
  if (rating < 3) {
    const eventWithDetails = await db.event.findUnique({
      where: { id: payload.eventId },
      include: {
        customer: true,
        service: { include: { org: true } },
      },
    });

    if (eventWithDetails?.service?.org) {
      const owner = await db.user.findUnique({
        where: { id: eventWithDetails.service.org.ownerId },
      });

      if (owner) {
        await sendNegativeReviewAlert({
          email: owner.email,
          customerName: eventWithDetails.customer?.displayName ?? "Cliente",
          serviceName: eventWithDetails.service.name,
          rating,
          comment,
          orgName: eventWithDetails.service.org.name,
        });
      }
    }
  }

  return { success: true, rating };
};

export default function SurveyPage({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  // Error states
  if ("error" in loaderData && loaderData.error) {
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
            Error
          </h1>
          <p className="text-gray-600">{loaderData.error}</p>
        </div>
      </main>
    );
  }

  // Already submitted state
  if ("alreadySubmitted" in loaderData && loaderData.alreadySubmitted) {
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
            Ya compartiste tu opinión
          </h1>
          <p className="text-gray-600">
            Gracias por tu feedback. Ya habías calificado esta experiencia.
          </p>
        </div>
      </main>
    );
  }

  // Success state after submission
  if (actionData && "success" in actionData && actionData.success) {
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
            ¡Gracias por tu opinión!
          </h1>
          <p className="text-gray-600">
            Tu feedback nos ayuda a mejorar.
          </p>
        </div>
      </main>
    );
  }

  // Form state
  const { event, service, customer, preRating, token } = loaderData as {
    event: { id: string; startFormatted: string };
    service: { name: string; orgName: string } | null;
    customer: { displayName: string | undefined };
    preRating: number | null;
    token: string;
  };

  return (
    <main className="min-h-screen bg-[#f8f8f8] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            ¿Cómo fue tu experiencia?
          </h1>
          <p className="text-gray-600">
            {customer.displayName && `Hola ${customer.displayName}, `}
            cuéntanos qué te pareció tu visita
            {service?.orgName && ` a ${service.orgName}`}.
          </p>
        </div>

        <div className="space-y-4 mb-6 text-sm">
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-500">Servicio</span>
            <span className="font-medium">{service?.name}</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-500">Fecha</span>
            <span className="font-medium">{event.startFormatted}</span>
          </div>
        </div>

        {actionData && "error" in actionData && actionData.error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-center text-sm">
            {actionData.error}
          </div>
        )}

        <form method="post" className="space-y-6">
          <input type="hidden" name="token" value={token} />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
              Califica tu experiencia
            </label>
            <RatingPicker value={preRating ?? undefined} />
          </div>

          <div>
            <label
              htmlFor="comment"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Comentarios (opcional)
            </label>
            <textarea
              id="comment"
              name="comment"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand_blue focus:border-transparent"
              placeholder="¿Qué te gustó? ¿Qué podríamos mejorar?"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-brand_blue text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Enviar mi opinión
          </button>
        </form>
      </div>
    </main>
  );
}
