import { Drawer } from "../animated/SimpleDrawer";
import { EventForm } from "./agenda/EventForm";
import type { Customer, Event as PrismaEvent, Service, User } from "@prisma/client";

type EventFormDrawerProps = {
  employees: User[];
  services: Service[];
  customers: Customer[];
  onNewClientClick: () => void;
  onClose?: () => void;
  isOpen?: boolean;
  event: Partial<PrismaEvent> | null;
};

export const EventFormDrawer = ({
  event,
  onClose,
  isOpen = false,
  onNewClientClick,
  customers,
  employees,
  services,
}: EventFormDrawerProps) => {
  return (
    <Drawer
      title="Agendar cita"
      isOpen={isOpen}
      onClose={onClose}
      size="big"
      footer={<></>}
    >
      <EventForm
        services={services}
        employees={employees}
        customers={customers}
        onNewClientClick={onNewClientClick}
        onCancel={onClose}
        defaultValues={event as PrismaEvent}
      />
    </Drawer>
  );
};
