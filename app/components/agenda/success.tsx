import type {
  Customer,
  Org,
  Event as PrismaEvent,
  Service,
} from "@prisma/client"
import { useEffect, useState } from "react"
import { EmojiConfetti } from "~/components/common/EmojiConfetti"
import { PrimaryButton } from "~/components/common/primaryButton"
import { ServiceList } from "~/components/forms/agenda/DateAndTimePicker"
import { getOrgPublicUrl } from "~/utils/urls"

type EventWithRelations = PrismaEvent & {
  customer?: Customer | null
  service?: (Service & { org: Org }) | null
}

// Flexible types for modified org/service objects
type OrgLike = Pick<Org, "slug" | "name"> & Record<string, unknown>
type ServiceLike = {
  name?: string
  duration?: number | bigint
  price?: number | bigint
  currency?: string
} & Record<string, unknown>

export const Success = ({
  event,
  service,
  onFinish,
  org,
}: {
  onFinish: () => void
  org: OrgLike
  service: ServiceLike
  event?: EventWithRelations
}) => {
  const [showGif, setShowGif] = useState(true)
  useEffect(() => {
    setTimeout(() => setShowGif(false), 18000)
  }, [])

  // Link to org's landing page
  const getCTALink = () => {
    return getOrgPublicUrl(org.slug)
  }

  return (
    <div className="flex h-screen flex-col items-center text-brand_gray bg-[#f8f8f8] px-2 md:py-20">
      <img
        alt="denik markwater"
        className="absolute right-0 bottom-0 z-0 w-[45%] lg:w-auto"
        src="/images/denik-markwater.png"
      />
      <div className="relative w-[240px] h-[240px] flex items-center justify-center">
        {showGif ? (
          <img
            className="w-[240px] h-[240px]"
            alt="illustration"
            src={`/images/confetti.gif?t=${Date.now()}`}
          />
        ) : (
          <svg className="w-24 h-24 text-brand_blue" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="11" fill="currentColor" opacity="0.15" />
            <circle cx="12" cy="12" r="11" stroke="currentColor" strokeWidth="1.5" />
            <path d="M7 12.5l3 3 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <h1 className="text-2xl font-bold mb-4 text-brand_dark text-center">
        ¡{event?.customer?.displayName} tu cita ha sido agendada!
      </h1>
      <p className="mb-8 text-center text-lg">
        Enviamos la información de la cita a{" "}
        <strong className="font-bold font-satoMiddle">
          {event?.customer?.email}
        </strong>
      </p>
      <div className="w-96 rounded-xl mx-auto bg-white shadow p-6 ">
        <h2 className="font-satoMedium font-bold text-xl md:text-2xl text-brand_dark mb-4">
          {event?.title}
        </h2>
        <ServiceList
          org={org}
          service={{ ...service }}
          date={event?.start ? new Date(event.start) : undefined}
        />
      </div>
      {/* @TODO: link to another schedule */}
      <PrimaryButton
        onClick={() => onFinish()}
        as="Link"
        to={getCTALink()}
        className="mt-12 py-4 w-[90%] mx-auto md:w-[160px] transition-all"
      >
        Agendar otra cita
      </PrimaryButton>
      <p className="text-neutral-400 text-xs mt-24 max-w-[600px] mx-auto">
        Recuerda que tu compra es válida para el servicio y horario en el que
        reservaste. Para cambios o cancelación ponte en contacto con Estudio
        Milán. Deník solo actúa como intermediario en la gestión y procesamiento
        de reservas.
      </p>
      <EmojiConfetti />
    </div>
  )
}
