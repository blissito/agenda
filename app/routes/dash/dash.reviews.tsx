import { Link, useLoaderData } from "react-router"
import { Image } from "~/components/common/Image"
import { getServices, getUserAndOrgOrRedirect } from "~/.server/userGetters"
import { EmptyStateReviews } from "~/components/reviews/EmptyStateReviews"
import { RouteTitle } from "~/components/sideBar/routeTitle"
import { db } from "~/utils/db.server"
import { generateLink } from "~/utils/generateSlug"
import type { Route } from "./+types/dash.reviews"

type ServiceReview = {
  id: string
  name: string
  image: string | null
  reviewCount: number
  averageRating: number
}

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { org } = await getUserAndOrgOrRedirect(request)
  if (!org) {
    throw new Response("Organization not found", { status: 404 })
  }
  const link = generateLink(request.url, org.slug)
  const services = await getServices(request)

  // Get review stats grouped by service
  const reviewStats = await db.surveyResponse.groupBy({
    by: ["serviceId"],
    where: { orgId: org.id },
    _count: true,
    _avg: { rating: true },
  })

  // Create a map for quick lookup
  const statsMap = new Map(
    reviewStats.map((stat) => [
      stat.serviceId,
      { count: stat._count, avg: stat._avg.rating ?? 0 },
    ]),
  )

  const serviceReviews: ServiceReview[] = services.map((service) => {
    const stats = statsMap.get(service.id)
    return {
      id: service.id,
      name: service.name,
      image: service.gallery?.[0] ?? null,
      reviewCount: stats?.count ?? 0,
      averageRating: stats?.avg ?? 0,
    }
  })

  // Calculate overall average
  const totalReviews = serviceReviews.reduce((acc, s) => acc + s.reviewCount, 0)
  const overallAverage =
    totalReviews > 0
      ? serviceReviews.reduce(
          (acc, s) => acc + s.averageRating * s.reviewCount,
          0,
        ) / totalReviews
      : 0

  return {
    serviceReviews,
    overallAverage,
    totalReviews,
    link,
  }
}

export default function Reviews() {
  const { serviceReviews, overallAverage, link } =
    useLoaderData<typeof loader>()

  const hasServices = serviceReviews.length > 0

  return (
    <main className="max-w-8xl mx-auto">
      <RouteTitle>Evaluaciones</RouteTitle>

      {hasServices ? (
        <>
          <SummaryCard average={overallAverage} />
          <ReviewsTable services={serviceReviews} />
        </>
      ) : (
        <EmptyStateReviews link={link} />
      )}
    </main>
  )
}

const SummaryCard = ({ average }: { average: number }) => {
  return (
    <section className="bg-white rounded-2xl px-6 py-6 shadow-[0px_4px_16px_0px_rgba(204,204,204,0.15)] w-fit">
      <p className="text-lg text-brand_gray font-satoMedium">
        Tus clientes han hablado ✓ ... la calificación promedio de tus
        servicios es
      </p>
      <div className="flex items-center gap-6 mt-6">
        <div className="flex gap-5">
          {[1, 2, 3, 4, 5].map((star) => (
            <StarIcon
              key={star}
              filled={star <= Math.floor(average)}
              partial={star === Math.ceil(average) && average % 1 !== 0}
              size={64}
            />
          ))}
        </div>
        <span className="text-5xl font-satoBold text-brand_dark">
          {average.toFixed(1)}
        </span>
      </div>
    </section>
  )
}

const ReviewsTable = ({ services }: { services: ServiceReview[] }) => {
  return (
    <section className="bg-white rounded-2xl mt-6 shadow-[0px_4px_16px_0px_rgba(204,204,204,0.15)] overflow-hidden max-w-6xl">
      {/* Header */}
      <div className="grid grid-cols-[1fr_auto_auto] text-xs text-[#606264] font-satoMedium py-3 px-10">
        <span>Servicio</span>
        <span className="w-28 text-center">Opiniones</span>
        <span className="w-52 text-center">Puntuación</span>
      </div>
      {/* Divider line */}
      <div className="h-px bg-gray-100 mx-0" />

      {/* Rows */}
      {services.map((service) => (
        <ServiceRow key={service.id} service={service} />
      ))}
    </section>
  )
}

const ServiceRow = ({ service }: { service: ServiceReview }) => {
  return (
    <Link
      to={`/dash/evaluaciones/${service.id}`}
      className="grid grid-cols-[1fr_auto_auto] items-center py-4 px-10 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors cursor-pointer"
    >
      {/* Service info */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-200 flex-shrink-0">
          <Image
            src={service.image || "/images/serviceDefault.png"}
            alt={service.name}
            className="w-full h-full object-cover"
          />
        </div>
        <span className="font-satoBold text-sm text-brand_dark">
          {service.name}
        </span>
      </div>

      {/* Review count */}
      <div className="w-28 text-center">
        <span className="text-sm text-brand_gray font-satoMedium">
          {service.reviewCount}
        </span>
      </div>

      {/* Rating */}
      <div className="w-52 flex items-center justify-center gap-3">
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <StarIcon
              key={star}
              filled={star <= Math.floor(service.averageRating)}
              partial={
                star === Math.ceil(service.averageRating) &&
                service.averageRating % 1 !== 0
              }
              size={24}
            />
          ))}
        </div>
        <span className="text-sm text-[#606264] font-satoMedium">
          {service.averageRating.toFixed(1)}
        </span>
      </div>
    </Link>
  )
}

const StarIcon = ({
  filled,
  partial = false,
  size = 24,
}: {
  filled: boolean
  partial?: boolean
  size?: number
}) => {
  const fillColor = "#F5A623"
  const emptyColor = "#E5E7EB"

  if (partial) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id={`partial-${size}`}>
            <stop offset="50%" stopColor={fillColor} />
            <stop offset="50%" stopColor={emptyColor} />
          </linearGradient>
        </defs>
        <path
          d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
          fill={`url(#partial-${size})`}
        />
      </svg>
    )
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
        fill={filled ? fillColor : emptyColor}
      />
    </svg>
  )
}

