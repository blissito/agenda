import type { Event, Service } from "@prisma/client"
import { FaRegClock } from "react-icons/fa6"
import { DropdownMenu } from "~/components/common/DropDownMenu"

export type EventWithService = Event & { service: Service }

// Misma grilla para header y rows (como tabla)
const GRID =
  "grid grid-cols-[220px_1.2fr_1fr_90px_110px_1fr_44px]"

const StatusTag = ({
  variant,
}: {
  variant: "confirmed" | "canceled" | "paid" | "unpaid"
}) => {
  const styles = {
    confirmed: { bg: "bg-[#effbd0]", 
      text: "text-[#4f7222]",
       label: "🔔 Confirmada" },
    canceled: { bg: "bg-[#f9e7eb]",
       text: "text-[#ab4265]", 
       label: "🚫 Cancelada" },
    paid: { bg: "bg-[#d5faf1]",
       text: "text-[#2a645f]", 
       label: "💸 Pagada" },
    unpaid: { bg: "bg-[#eef9fd]",
       text: "text-[#276297]", 
       label: "🎫 Sin pagar" },
  }
  const style = styles[variant]

  return (
    <span
      className={`${style.bg} ${style.text} inline-flex items-center justify-center px-[6px] py-[3px] rounded text-[10px] font-satoMedium whitespace-nowrap`}
    >
      {style.label}
    </span>
  )
}

export const EventTable = ({ events }: { events: EventWithService[] }) => {
  return (
    <section className="w-full">
      <div
        className={`${GRID} mt-4 rounded-t-2xl border border-brand_stroke bg-white px-6 py-3 text-[12px] font-satoMedium text-brand_iron`}
      >
        <div className="text-left">Fecha</div>
        <div className="text-left">Servicio</div>
        <div className="text-left">Encargado</div>
        <div className="text-left">Puntos</div>
        <div className="text-left">Precio</div>
        <div className="text-left">Estatus</div>
        <div className="text-right" />
      </div>

      {/* Rows */}
      <div className="rounded-b-2xl border-x border-b border-brand_stroke bg-white">
        {events.map((event) => (
          <EventRow event={event} key={event.id} />
        ))}
      </div>
    </section>
  )
}

export const EventRow = ({ event }: { event: EventWithService }) => {
  const getEventDate = () => {
    const date = new Date(event.start)
    const day = date.getDate()
    const month = date.toLocaleDateString("es-MX", { month: "long" })
    const year = date.getFullYear()
    return `${day} ${month} ${year}`
  }

  const getEventTime = () => {
    const date = new Date(event.start)
    const hours = date.getHours()
    const minutes = date.getMinutes().toString().padStart(2, "0")
    const period = hours >= 12 ? "pm" : "am"
    const hour12 = hours % 12 || 12
    return `${hour12}:${minutes} ${period}`
  }

  const formatPrice = (price: number) => `$${price.toFixed(2)}`

  return (
    <div
      className={`${GRID} items-center px-6 py-4 border-t border-brand_stroke`}
    >
      {/* Fecha */}
      <div className="flex items-center gap-2">
        <span className="text-brand_iron">
          <FaRegClock />
        </span>
        <div className="flex flex-col leading-tight">
          <span className="text-[12px] font-satoMedium text-brand_gray">
            {getEventDate()}
          </span>
          <span className="text-[10px] font-satoMedium text-brand_iron">
            {getEventTime()}
          </span>
        </div>
      </div>

      {/* Servicio */}
      <div className="min-w-0">
        <p className="font-satoBold text-[12px] text-brand_dark truncate">
          {event.service.name}
        </p>
      </div>

      {/* Encargado */}
      <div className="min-w-0">
        <p className="font-satoMedium text-[12px] text-brand_gray truncate">
          {event.service.employeeName || "s/n"}
        </p>
      </div>

      {/* Puntos */}
      <div>
        <p className="font-satoMedium text-[12px] text-brand_gray tabular-nums">
          {String(event.service.points)}
        </p>
      </div>

      {/* Precio */}
      <div>
        <p className="font-satoMedium text-[12px] text-brand_gray tabular-nums">
          {formatPrice(Number(event.service.price))}
        </p>
      </div>

      {/* Estatus */}
      <div className="flex items-center gap-2">
        <StatusTag
          variant={event.status === "ACTIVE" ? "confirmed" : "canceled"}
        />
        <StatusTag variant={event.paid ? "paid" : "unpaid"} />
      </div>

      {/* Acciones */}
      <div className="flex items-center justify-end">
        <DropdownMenu />
      </div>
    </div>
  )
}
