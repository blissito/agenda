import type {
  Customer,
  Event as PrismaEvent,
  Service,
  User,
} from "@prisma/client"
import { Drawer } from "../animated/SimpleDrawer"
import { EventForm } from "./agenda/EventForm"

type EventFormDrawerProps = {
  employees: User[]
  services: Service[]
  customers: Customer[]
  onNewClientClick: () => void
  onClose?: () => void
  isOpen?: boolean
  event: Partial<PrismaEvent> | null
  isGoogleCalendarConnected?: boolean
}

export const EventFormDrawer = ({
  event,
  onClose,
  isOpen = false,
  onNewClientClick,
  customers,
  employees,
  services,
  isGoogleCalendarConnected,
}: EventFormDrawerProps) => {
  return (
    <Drawer
      title={event?.id ? "Editar cita" : "Agendar cita"}
      isOpen={isOpen}
      onClose={onClose}
      size="big"
      footer={null}
    >
      {isGoogleCalendarConnected && !event?.id && (
        <div className="mx-4 mb-4 flex items-center gap-3 rounded-xl bg-blue-50 border border-blue-200 px-4 py-3">
          <img src="/images/google-meet.svg" alt="Google Meet" className="w-5 h-5" />
          <p className="text-sm text-blue-800">
            Se creará un evento en Google Calendar con link de Google Meet
          </p>
        </div>
      )}
      <EventForm
        services={services}
        employees={employees}
        customers={customers}
        onNewClientClick={onNewClientClick}
        onCancel={onClose}
        defaultValues={event as PrismaEvent}
      />
    </Drawer>
  )
}
