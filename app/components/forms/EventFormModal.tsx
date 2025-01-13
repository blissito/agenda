import { type ReactNode } from "react";
import { Drawer } from "../animated/SimpleDrawer";
import { EventForm } from "./agenda/EventForm";
import type { Customer } from "@prisma/client";

export const EventFormModal = ({
  event,
  onClose,
  isOpen = false,
  onNewClientClick,
  customers,
}: {
  customers: Customer[];
  onNewClientClick: () => void;
  onClose?: () => void;
  isOpen?: boolean;
  event: Event;
  children: ReactNode;
}) => {
  return (
    <Drawer
      title="Agendar cita"
      isOpen={isOpen}
      onClose={onClose}
      size="big"
      footer={<></>}
    >
      <EventForm
        customers={customers}
        onNewClientClick={onNewClientClick}
        onCancel={onClose}
        defaultValues={event}
      />
    </Drawer>
  );
};
