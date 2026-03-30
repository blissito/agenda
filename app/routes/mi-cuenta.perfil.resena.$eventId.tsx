import { useState } from "react"
import { data, useLoaderData, useNavigation } from "react-router"
import { PrimaryButton } from "~/components/common/primaryButton"
import { SecondaryButton } from "~/components/common/secondaryButton"
import { db } from "~/utils/db.server"
import type { Route } from "./+types/mi-cuenta.perfil.resena.$eventId"

export const loader = async ({ params }: Route.LoaderArgs) => {
  const event = await db.event.findUnique({
    where: { id: params.eventId },
    include: {
      service: { include: { org: true } },
      customer: true,
      surveyResponse: true,
    },
  })

  if (!event || !event.service) {
    throw new Response("Cita no encontrada", { status: 404 })
  }

  return {
    eventId: event.id,
    serviceName: event.service.name,
    orgName: event.service.org.name,
    alreadySubmitted: !!event.surveyResponse,
  }
}

export const action = async ({ request, params }: Route.ActionArgs) => {
  const formData = await request.formData()
  const rating = parseInt(formData.get("rating") as string, 10)
  const comment = (formData.get("comment") as string) || null

  if (Number.isNaN(rating) || rating < 1 || rating > 5) {
    return data({ error: "Selecciona una calificación" }, { status: 400 })
  }

  const event = await db.event.findUnique({
    where: { id: params.eventId },
  })

  if (!event || !event.serviceId || !event.customerId) {
    return data({ error: "Cita no encontrada" }, { status: 404 })
  }

  const existing = await db.surveyResponse.findUnique({
    where: { eventId: event.id },
  })

  if (existing) {
    return { success: true }
  }

  await db.surveyResponse.create({
    data: {
      eventId: event.id,
      customerId: event.customerId,
      orgId: event.orgId,
      serviceId: event.serviceId,
      rating,
      comment,
      createdAt: new Date(),
    },
  })

  return { success: true }
}

export default function ResenaPage({ actionData }: Route.ComponentProps) {
  const loaderData = useLoaderData<typeof loader>()
  const navigation = useNavigation()
  const isSubmitting = navigation.state === "submitting"

  const submitted =
    loaderData.alreadySubmitted ||
    (actionData && "success" in actionData && actionData.success)

  return (
    <main className="min-h-screen bg-[#615FFF] relative overflow-hidden flex flex-col">
      <BgDecorations />

      {/* Back link */}
      <button
        type="button"
        onClick={() => window.history.back()}
        className="relative z-10 flex items-center gap-2 text-white text-sm font-satoMedium px-6 pt-6 w-fit hover:opacity-80 transition-opacity"
      >
        <ArrowLeft />
        Volver
      </button>

      {/* Centered card */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 py-8">
        {submitted ? (
          <SuccessCard />
        ) : (
          <ReviewForm
            serviceName={loaderData.serviceName}
            orgName={loaderData.orgName}
            isSubmitting={isSubmitting}
            error={
              actionData && "error" in actionData
                ? actionData.error
                : undefined
            }
          />
        )}
      </div>
    </main>
  )
}

// ── Review Form ─────────────────────────────────────────

function ReviewForm({
  serviceName,
  orgName,
  isSubmitting,
  error,
}: {
  serviceName: string
  orgName: string
  isSubmitting: boolean
  error?: string
}) {
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)

  return (
    <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-xl">
      <h1 className="text-xl font-satoBold text-brand_dark leading-snug">
        ¿Qué tal estuvo tu {serviceName} en {orgName}?
      </h1>

      {error && (
        <p className="mt-3 text-sm text-red-600 font-satoMedium">{error}</p>
      )}

      <form method="post" className="mt-6">
        <input type="hidden" name="rating" value={rating} />

        {/* Star picker */}
        <div className="flex gap-2 mb-6">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
              className="transition-transform hover:scale-110"
              aria-label={`${star} estrella${star > 1 ? "s" : ""}`}
            >
              <StarIcon filled={star <= (hover || rating)} size={40} />
            </button>
          ))}
        </div>

        {/* Comment */}
        <textarea
          name="comment"
          rows={5}
          placeholder="Deja un comentario al creador"
          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-brand_dark placeholder:text-brand_gray focus:outline-none focus:ring-2 focus:ring-[#615FFF]/30 focus:border-[#615FFF] resize-none font-satoMedium"
        />

        {/* Submit */}
        <PrimaryButton
          type="submit"
          isDisabled={rating === 0}
          isLoading={isSubmitting}
          className="mt-4 w-full"
        >
          Enviar reseña
        </PrimaryButton>
      </form>
    </div>
  )
}

// ── Success Card ────────────────────────────────────────

function SuccessCard() {
  return (
    <div className="text-center max-w-md">
      <img
        src="/images/rank.svg"
        alt="Reseña enviada"
        className="w-40 h-40 mx-auto mb-6"
      />
      <h1 className="text-3xl font-satoBold text-white mb-4">
        ¡Gracias por tu reseña!
      </h1>
      <p className="text-sm text-white/70 font-satoMedium leading-relaxed mb-8">
        Agradecemos mucho que te hayas tomado el tiempo de compartir tu
        experiencia. Tus comentarios nos ayudan a seguir mejorando y a que
        más personas confíen en nosotros.
      </p>
      <SecondaryButton
        onClick={() => window.history.back()}
        className="bg-white px-10 mx-auto"
      >
        Volver
      </SecondaryButton>
    </div>
  )
}

// ── Icons ───────────────────────────────────────────────

const StarIcon = ({
  filled,
  size = 24,
}: {
  filled: boolean
  size?: number
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
      fill={filled ? "#F5A623" : "none"}
      stroke={filled ? "#F5A623" : "#C4C4C4"}
      strokeWidth={1.5}
      strokeLinejoin="round"
    />
  </svg>
)

const ArrowLeft = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path
      d="M19 12H5M5 12L12 19M5 12L12 5"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

// ── Background decorations ──────────────────────────────

function BgDecorations() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <img
        src="/images/review_pattern.svg"
        alt=""
        className="w-full h-full object-cover opacity-100"
      />
    </div>
  )
}
