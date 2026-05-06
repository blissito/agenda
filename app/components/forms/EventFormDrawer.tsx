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
  isZoomConnected?: boolean
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
  isZoomConnected,
}: EventFormDrawerProps) => {
  return (
    <Drawer
      title={event?.id ? "Editar cita" : "Agendar cita"}
      isOpen={isOpen}
      onClose={onClose}
      size="big"
      footer={null}
    >
      <EventForm
        services={services}
        employees={employees}
        customers={customers}
        onNewClientClick={onNewClientClick}
        onCancel={onClose}
        defaultValues={event as PrismaEvent}
        hasMeet={!!isGoogleCalendarConnected}
        hasZoom={!!isZoomConnected}
      />
    </Drawer>
  )
}
