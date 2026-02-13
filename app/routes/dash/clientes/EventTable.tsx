import type { Event, Service } from "@prisma/client"
import { FaRegClock } from "react-icons/fa6"
import { DropdownMenu } from "~/components/common/DropDownMenu"

export type EventWithService = Event & { service: Service }

// Grid base para desktop
const GRID = "grid grid-cols-[220px_1.2fr_1fr_90px_110px_1fr_44px]"

// Ajusta este ancho si cambiaste el max-w del nombre del servicio en mobile
const SERVICE_HEADER_W = "w-[170px]"

const StatusTag = ({
  variant,
}: {
  variant: "confirmed" | "canceled" | "paid" | "unpaid"
}) => {
  const styles = {
    confirmed: {
      bg: "bg-[#effbd0]",
      text: "text-[#4f7222]",
      label: "🔔 Confirmada",
    },
    canceled: {
      bg: "bg-[#f9e7eb]",
      text: "text-[#ab4265]",
      label: "🚫 Cancelada",
    },
    paid: {
      bg: "bg-[#d5faf1]",
      text: "text-[#2a645f]",
      label: "💸 Pagada",
    },
    unpaid: {
      bg: "bg-[#eef9fd]",
      text: "text-[#276297]",
      label: "🎫 Sin pagar",
    },
  } as const

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
      {/* Vista Desktop */}
      <div className="hidden lg:block w-full overflow-x-auto rounded-2xl">
        <div className="min-w-[920px]">
          <div
            className={`${GRID} mt-4 rounded-t-2xl border border-brand_stroke bg-white px-6 py-3 text-[12px] font-satoMedium text-brand_gray`}
          >
            <div className="text-left">Fecha</div>
            <div className="text-left">Servicio</div>
            <div className="text-left">Encargado</div>
            <div className="text-left">Puntos</div>
            <div className="text-left">Precio</div>
            <div className="text-left">Estatus</div>
            <div className="text-right" />
          </div>

          <div className="rounded-b-2xl border-x border-b border-brand_stroke bg-white">
            {events.map((event) => (
              <EventRow event={event} key={event.id} />
            ))}
          </div>
        </div>
      </div>

      {/* Vista Mobile / Tablet */}
      <div className="lg:hidden">
        {/* Header + registros juntos (sin separación) */}
        <div className="rounded-2xl border border-brand_stroke bg-white overflow-hidden">
          {/* Header pegado */}
          <div className="px-4 py-3">
            <div className="grid grid-cols-2 gap-x-6 items-start">
              <p className="text-[10px] font-satoMedium text-brand_gray uppercase tracking-wide whitespace-nowrap">
                Fecha
              </p>

              {/* "SERVICIO" inicia donde inicia el texto del servicio */}
              <div className="flex justify-end">
                <p
                  className={`${SERVICE_HEADER_W} text-[10px] font-satoMedium text-brand_gray uppercase tracking-wide whitespace-nowrap text-left`}
                >
                  Servicio
                </p>
              </div>
            </div>
          </div>

          {/* Separador */}
          <div className="h-px bg-brand_stroke" />

          {/* Registros */}
          <div className="divide-y divide-brand_stroke">
            {events.map((event) => (
              <div key={event.id} className="p-4">
                <EventCardMobile event={event} />
              </div>
            ))}
          </div>
        </div>
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
    <div className={`${GRID} items-center px-6 py-4 border-t border-brand_stroke`}>
      {/* Fecha */}
      <div className="flex items-center gap-2">
        <span className="text-brand_gray">
          <FaRegClock />
        </span>
        <div className="flex flex-col leading-tight">
          <span className="text-[12px] font-satoMedium text-brand_gray">
            {getEventDate()}
          </span>
          <span className="text-[10px] font-satoMedium text-brand_gray">
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
        <StatusTag variant={event.status === "ACTIVE" ? "confirmed" : "canceled"} />
        <StatusTag variant={event.paid ? "paid" : "unpaid"} />
      </div>

      {/* Acciones */}
      <div className="flex items-center justify-end">
        <DropdownMenu />
      </div>
    </div>
  )
}

// Mobile/Tablet row (sin chips; menú a la derecha)
const EventCardMobile = ({ event }: { event: EventWithService }) => {
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

  return (
    <div className="bg-white">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="grid grid-cols-2 gap-x-6 items-start">
            {/* Fecha (valor) */}
            <div className="flex items-start gap-2 min-w-0">
              <span className="text-brand_gray mt-[2px] shrink-0">
                <FaRegClock size={16} />
              </span>
              <div className="flex flex-col leading-tight min-w-0">
                <span className="text-[13px] font-satoMedium text-brand_gray whitespace-nowrap">
                  {getEventDate()}
                </span>
                <span className="text-[11px] font-satoMedium text-brand_gray whitespace-nowrap">
                  {getEventTime()}
                </span>
              </div>
            </div>

            {/* Servicio (valor) alineado con el header */}
            <div className="min-w-0 flex justify-end">
              <p className="max-w-[170px] font-satoBold text-[15px] text-brand_dark text-left whitespace-normal break-words leading-[18px]">
                {event.service.name}
              </p>
            </div>
          </div>
        </div>

        <div className="shrink-0">
          <DropdownMenu />
        </div>
      </div>

      
      <div className="mt-3 flex items-center gap-2 flex-wrap">
        <StatusTag variant={event.status === "ACTIVE" ? "confirmed" : "canceled"} />
        <StatusTag variant={event.paid ? "paid" : "unpaid"} />
      </div>
      
    </div>
  )
}
