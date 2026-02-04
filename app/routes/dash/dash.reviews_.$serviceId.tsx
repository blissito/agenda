import { BsEnvelope, BsTrash } from "react-icons/bs"
import { Link, useLoaderData } from "react-router"
import { getUserAndOrgOrRedirect } from "~/.server/userGetters"
import { DropdownMenu, MenuButton } from "~/components/common/DropDownMenu"
import { db } from "~/utils/db.server"
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
  await getUserAndOrgOrRedirect(request)
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
    stats: {
      averageRating,
      totalReviews,
      uniqueCustomers,
      ratingDistribution,
    },
  }
}

export default function ServiceReviewDetail() {
  const { service, reviews, stats } = useLoaderData<typeof loader>()

  return (
    <main>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm mb-6 font-satoMedium">
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
      <section className="bg-white rounded-2xl mt-6 shadow-[0px_4px_16px_0px_rgba(204,204,204,0.15)] p-6 max-w-[845px]">
        {reviews.map((review, index) => (
          <ReviewCard
            key={review.id}
            review={review}
            showDivider={index < reviews.length - 1}
          />
        ))}

        {reviews.length === 0 && (
          <p className="text-center text-brand_gray py-8">
            Aún no hay evaluaciones para este servicio
          </p>
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
    photoURL?: string | null
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
    <section className="bg-white rounded-2xl p-6 shadow-[0px_4px_16px_0px_rgba(204,204,204,0.15)] max-w-[845px]">
      <div className="flex gap-6">
        {/* Service Image */}
        <div className="w-[193px] h-[120px] rounded-2xl overflow-hidden bg-gray-200 flex-shrink-0">
          {service.photoURL ? (
            <img
              src={service.photoURL}
              alt={service.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-brand_blue to-indigo-400" />
          )}
        </div>

        {/* Service Info */}
        <div className="flex-1">
          <h2 className="text-2xl font-satoBold text-brand_dark">
            {service.name}
          </h2>
          {service.description && (
            <p className="text-base text-[#606264] font-satoMedium mt-1">
              {service.description}
            </p>
          )}
        </div>
      </div>

      {/* Stats Section */}
      <div className="flex mt-6 gap-8">
        {/* Rating Number and Stars */}
        <div className="flex-shrink-0">
          <p className="text-6xl font-satoBold text-black">
            {stats.averageRating.toFixed(1)}
          </p>
          <div className="flex gap-2 mt-2">
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
        <div className="flex-1 flex flex-col justify-center gap-2">
          {[5, 4, 3, 2, 1].map((rating) => {
            const count = stats.ratingDistribution[rating - 1]
            const percentage = (count / maxRatingCount) * 100
            return (
              <div key={rating} className="flex items-center gap-3">
                <span className="text-base text-[#606264] font-satoMedium w-4">
                  {rating}
                </span>
                <div className="flex-1 h-3 bg-[#e5e7f0] rounded-full overflow-hidden max-w-[410px]">
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
        <div className="w-px bg-gray-200 mx-4" />

        {/* Stats Numbers */}
        <div className="flex flex-col justify-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-satoBold text-brand_dark">
              {stats.totalReviews}
            </span>
            <StarIcon filled size={20} />
          </div>
          <span className="text-xs text-[#606264] font-satoMedium -mt-3">
            comentarios
          </span>

          <span className="text-2xl font-satoBold text-brand_dark">
            {stats.uniqueCustomers}
          </span>
          <span className="text-xs text-[#606264] font-satoMedium -mt-3">
            clientes
          </span>
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
      <div className="flex gap-6 py-6">
        {/* Avatar */}
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

        {/* Customer Info */}
        <div className="flex-shrink-0 w-[200px]">
          <p className="font-satoBold text-sm text-brand_dark">
            {review.customerName}
          </p>
          <p className="text-xs text-[#606264] font-satoMedium">
            {review.customerEmail}
          </p>
        </div>

        {/* Rating and Comment */}
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <StarIcon key={star} filled={star <= review.rating} size={24} />
              ))}
            </div>
            <DropdownMenu hideDefaultButton>
              <MenuButton
                onClick={() => {}}
                className="text-[#ca5757]"
                icon={<BsTrash />}
              >
                Eliminar comentario
              </MenuButton>
              <MenuButton
                to={`/dash/clientes/${review.customerEmail}`}
                className="text-brand_gray"
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
