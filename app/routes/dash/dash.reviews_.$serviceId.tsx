import { BsEnvelope, BsTrash } from "react-icons/bs"
import { Link, useLoaderData } from "react-router"
import { getUserAndOrgOrRedirect } from "~/.server/userGetters"
import { Image } from "~/components/common/Image"
import { DropdownMenu, MenuButton } from "~/components/common/DropDownMenu"
import { EmptyStateReviews } from "~/components/reviews/EmptyStateReviews"
import { db } from "~/utils/db.server"
import { generateLink } from "~/utils/generateSlug"
import type { Route } from "./+types/dash.reviews_.$serviceId"

type Review = {
  id: string
  customerName: string
  customerEmail: string
  rating: number
  comment: string | null
  createdAt: Date | string
  avatarUrl?: string
}

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const { org } = await getUserAndOrgOrRedirect(request)
  if (!org) throw new Response("Org not found", { status: 404 })
  const link = generateLink(request.url, org.slug)
  const { serviceId } = params

  const service = await db.service.findUnique({
    where: { id: serviceId },
  })

  if (!service) {
    throw new Response("Servicio no encontrado", { status: 404 })
  }

  // Get real reviews from SurveyResponse
  const surveyResponses = await db.surveyResponse.findMany({
    where: { serviceId },
    include: { customer: true },
    orderBy: { createdAt: "desc" },
  })

  const reviews: Review[] = surveyResponses.map((response) => ({
    id: response.id,
    customerName: response.customer.displayName ?? "Cliente",
    customerEmail: response.customer.email,
    rating: response.rating,
    comment: response.comment,
    createdAt: response.createdAt,
  }))

  // Calculate rating distribution
  const ratingDistribution = [0, 0, 0, 0, 0] // index 0 = 1 star, index 4 = 5 stars
  reviews.forEach((r) => {
    if (r.rating >= 1 && r.rating <= 5) {
      ratingDistribution[r.rating - 1]++
    }
  })

  const totalReviews = reviews.length
  const averageRating =
    totalReviews > 0
      ? reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews
      : 0

  // Unique customers
  const uniqueCustomers = new Set(reviews.map((r) => r.customerEmail)).size

  return {
    service,
    reviews,
    link,
    stats: {
      averageRating,
      totalReviews,
      uniqueCustomers,
      ratingDistribution,
    },
  }
}

export default function ServiceReviewDetail() {
  const { service, reviews, stats, link } = useLoaderData<typeof loader>()

  return (
    <main className="max-w-8xl mx-auto h-full flex flex-col">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm mb-4 md:mb-6 font-satoMedium">
        <Link
          to="/dash/evaluaciones"
          className="text-brand_gray hover:text-brand_blue"
        >
          Evaluaciones
        </Link>
        <ChevronRight />
        <span className="text-brand_dark">{service.name}</span>
      </nav>

      {/* Service Header Card */}
      <ServiceHeaderCard service={service} stats={stats} />

      {/* Reviews List */}
      <section className={`bg-white rounded-2xl mt-4 md:mt-6 shadow-[0px_4px_16px_0px_rgba(204,204,204,0.15)] p-4 md:p-[24px] max-w-[845px] flex flex-col ${reviews.length <= 1 ? "" : "flex-1"}`}>
        {reviews.length > 0 ? (
          reviews.map((review, index) => (
            <ReviewCard
              key={review.id}
              review={review}
              showDivider={index < reviews.length - 1}
            />
          ))
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <EmptyStateReviews link={link} />
          </div>
        )}
      </section>
    </main>
  )
}

const ServiceHeaderCard = ({
  service,
  stats,
}: {
  service: {
    name: string
    description?: string | null
    gallery?: string[] | null
  }
  stats: {
    averageRating: number
    totalReviews: number
    uniqueCustomers: number
    ratingDistribution: number[]
  }
}) => {
  const maxRatingCount = Math.max(...stats.ratingDistribution, 1)

  return (
    <section className="bg-white rounded-2xl p-4 md:p-6 shadow-[0px_4px_16px_0px_rgba(204,204,204,0.15)] max-w-[845px]">
      <div className="flex flex-col md:flex-row gap-4 md:gap-6">
        {/* Service Image */}
        <div className="w-full h-[160px] md:w-[193px] md:h-[120px] rounded-2xl overflow-hidden bg-gray-200 flex-shrink-0">
          <Image
            src={service.gallery?.[0] || "/images/serviceDefault.png"}
            alt={service.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Service Info */}
        <div className="flex-1 min-w-0">
          <h2 className="text-xl md:text-2xl font-satoBold text-brand_dark">
            {service.name}
          </h2>
          {service.description && (
            <p className="text-sm md:text-base text-[#606264] font-satoMedium mt-1">
              {service.description}
            </p>
          )}
        </div>
      </div>

      {/* Stats Section */}
      <div className="flex flex-col md:flex-row mt-6 gap-4 md:gap-6">
        {/* Rating Number and Stars */}
        <div className="flex-shrink-0 flex md:block items-center gap-4">
          <p className="text-5xl md:text-6xl font-satoBold text-black">
            {stats.averageRating.toFixed(1)}
          </p>
          <div className="flex gap-1.5 md:gap-2 md:mt-2 [&_svg]:w-5 [&_svg]:h-5 md:[&_svg]:w-6 md:[&_svg]:h-6">
            {[1, 2, 3, 4, 5].map((star) => (
              <StarIcon
                key={star}
                filled={star <= Math.floor(stats.averageRating)}
                partial={
                  star === Math.ceil(stats.averageRating) &&
                  stats.averageRating % 1 !== 0
                }
                size={24}
              />
            ))}
          </div>
        </div>

        {/* Rating Distribution Bars */}
        <div className="flex-1 flex flex-col justify-center gap-2 min-w-0">
          {[5, 4, 3, 2, 1].map((rating) => {
            const count = stats.ratingDistribution[rating - 1]
            const percentage = (count / maxRatingCount) * 100
            return (
              <div key={rating} className="flex items-center gap-3">
                <span className="text-sm md:text-base text-[#606264] font-satoMedium w-4">
                  {rating}
                </span>
                <div className="flex-1 h-3 bg-[#e5e7f0] rounded-full overflow-hidden max-w-full">
                  <div
                    className="h-full bg-[#ffc166] rounded-full transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>

        {/* Divider */}
        <div className="hidden md:block w-px bg-gray-200" />

        {/* Stats Numbers */}
        <div className="flex md:flex-col flex-row items-center md:items-start justify-around md:justify-center gap-6 md:gap-4 pt-2 md:pt-0 border-t md:border-t-0 border-gray-100">
          <div className="flex flex-col items-center md:items-start">
            <div className="flex items-center gap-2">
              <span className="text-xl md:text-2xl font-satoBold text-brand_dark">
                {stats.totalReviews}
              </span>
              <StarIcon filled size={20} />
            </div>
            <span className="text-xs text-[#606264] font-satoMedium mt-1 md:-mt-1">
              {stats.totalReviews === 1 ? "comentario" : "comentarios"}
            </span>
          </div>

          <div className="flex flex-col items-center md:items-start">
            <span className="text-xl md:text-2xl font-satoBold text-brand_dark">
              {stats.uniqueCustomers}
            </span>
            <span className="text-xs text-[#606264] font-satoMedium mt-1 md:-mt-1">
              clientes
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}

const ReviewCard = ({
  review,
  showDivider,
}: {
  review: Review
  showDivider: boolean
}) => {
  const initials = review.customerName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <>
      <div className="flex flex-col md:flex-row gap-3 md:gap-6 py-5 md:py-6">
        {/* Customer row (avatar + name) */}
        <div className="flex items-center gap-3 md:gap-6 md:items-start">
          <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0 overflow-hidden">
            {review.avatarUrl ? (
              <img
                src={review.avatarUrl}
                alt={review.customerName}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-sm font-satoBold text-gray-600">
                {initials}
              </span>
            )}
          </div>

          <div className="flex-1 md:flex-shrink-0 md:w-[200px] min-w-0">
            <p className="font-satoBold text-sm text-brand_dark truncate">
              {review.customerName}
            </p>
            <p className="text-xs text-[#606264] font-satoMedium truncate">
              {review.customerEmail}
            </p>
          </div>
        </div>

        {/* Rating and Comment */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex gap-1.5 md:gap-2 [&_svg]:w-5 [&_svg]:h-5 md:[&_svg]:w-6 md:[&_svg]:h-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <StarIcon key={star} filled={star <= review.rating} size={24} />
              ))}
            </div>
            <DropdownMenu hideDefaultButton>
              <MenuButton
                onClick={() => {}}
                variant="danger"
                icon={<BsTrash />}
              >
                Eliminar comentario
              </MenuButton>
              <MenuButton
                to={`/dash/clientes/${review.customerEmail}`}
                variant="default"
                icon={<BsEnvelope />}
              >
                Contactar cliente
              </MenuButton>
            </DropdownMenu>
          </div>
          <p className="text-sm text-[#606264] mt-4 leading-relaxed font-satoMedium">
            {review.comment}
          </p>
        </div>
      </div>
      {showDivider && <div className="h-px bg-gray-100" />}
    </>
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
          <linearGradient id={`partial-detail-${size}`}>
            <stop offset="50%" stopColor={fillColor} />
            <stop offset="50%" stopColor={emptyColor} />
          </linearGradient>
        </defs>
        <path
          d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
          fill={`url(#partial-detail-${size})`}
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

const ChevronRight = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M9 18L15 12L9 6"
      stroke="#606264"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)
