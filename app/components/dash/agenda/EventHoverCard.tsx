import { FiClock, FiFileText, FiMail, FiPhone, FiUser } from "react-icons/fi"
import { EditPen } from "~/components/icons/editPen"
import { Money } from "~/components/icons/money"
import { Trash } from "~/components/icons/trash"

export type EventHoverData = {
  customerName?: string
  serviceName?: string
  employeeName?: string
  time?: string
  phone?: string
  email?: string
  notes?: string
  status?: string
  paid?: boolean
}

function getStatusVariant(
  status: string,
): "confirmed" | "canceled" | "pending" {
  if (status === "CANCELLED" || status === "canceled") return "canceled"
  if (status === "confirmed" || status === "ACTIVE") return "confirmed"
  return "pending"
}

const StatusTag = ({
  variant,
}: {
  variant: "confirmed" | "canceled" | "paid" | "unpaid" | "pending"
}) => {
  const styles = {
    confirmed: {
      bg: "bg-[#effbd0]",
      text: "text-[#4f7222]",
      label: "Confirmada",
      icon: "🔔",
    },
    canceled: {
      bg: "bg-[#f9e7eb]",
      text: "text-[#ab4265]",
      label: "Cancelada",
      icon: "🚫",
    },
    paid: {
      bg: "bg-[#d5faf1]",
      text: "text-[#2a645f]",
      label: "Pagada",
      icon: "💸",
    },
    unpaid: {
      bg: "bg-[#eef9fd]",
      text: "text-[#276297]",
      label: "Sin pagar",
      icon: "💰",
    },
    pending: {
      bg: "bg-[#fff8e1]",
      text: "text-[#8b6914]",
      label: "Reservada",
      icon: "📣",
    },
  } as const
  const style = styles[variant]
  return (
    <span
      className={`${style.bg} ${style.text} inline-flex items-center justify-center gap-1 px-2 py-[3px] rounded text-[12px] font-satoMedium whitespace-nowrap`}
    >
      <span>{style.icon}</span>
      {style.label}
    </span>
  )
}

export function EventHoverCard({
  data,
  onEdit,
  onDelete,
  hidePayment,
}: {
  data: EventHoverData
  onEdit?: () => void
  onDelete?: () => void
  hidePayment?: boolean
}) {
  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 w-[280px] text-left">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-1">
        <div className="min-w-0">
          <p className="font-satoBold text-brand_dark text-base truncate">
            {data.customerName || "Sin cliente"}
          </p>
          <p className="text-[12px] text-brand_iron truncate">
            {data.serviceName}
          </p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0 border-b border-l border_brand_ash rounded-bl-[12px] pl-1 pb-1">
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDelete()
              }}
              className="p-1 rounded-md hover:bg-red-50 transition-colors"
            >
              <Trash fill="#CA5757" className="w-5 h-5" />
            </button>
          )}
          {!hidePayment && (
            <button
              onClick={(e) => {
                e.stopPropagation()
              }}
              className="p-1 rounded-md hover:bg-gray-100 text-gray-500 transition-colors"
            >
              <Money className="w-5 h-5" />
            </button>
          )}
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onEdit()
              }}
              className="p-1 rounded-md hover:bg-gray-100 text-gray-500 transition-colors"
            >
              <EditPen fill="#4B5563" className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Details */}
      <div className="mt-3 space-y-2.5 text-[12px] text-brand_gray">
        {data.time && (
          <div className="flex items-center gap-2.5">
            <FiClock className="w-4 h-4 text-gray-400 shrink-0" />
            <span className="truncate">{data.time}</span>
          </div>
        )}
        {data.employeeName && (
          <div className="flex items-center gap-2.5">
            <FiUser className="w-4 h-4 text-gray-400 shrink-0" />
            <span className="truncate">Con {data.employeeName}</span>
          </div>
        )}
        {data.phone && (
          <div className="flex items-center gap-2.5">
            <FiPhone className="w-4 h-4 text-gray-400 shrink-0" />
            <span className="truncate">{data.phone}</span>
          </div>
        )}
        {data.email && (
          <div className="flex items-center gap-2.5">
            <FiMail className="w-4 h-4 text-gray-400 shrink-0" />
            <span className="truncate">{data.email}</span>
          </div>
        )}
        {data.notes && (
          <div className="flex items-center gap-2.5">
            <FiFileText className="w-4 h-4 text-gray-400 shrink-0" />
            <span className="truncate">{data.notes}</span>
          </div>
        )}
      </div>

      {/* Badges */}
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
        <StatusTag variant={getStatusVariant(data.status ?? "pending")} />
        <StatusTag variant={data.paid ? "paid" : "unpaid"} />
      </div>
    </div>
  )
}
