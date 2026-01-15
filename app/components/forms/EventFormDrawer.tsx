// @ts-nocheck - TODO: Arreglar tipos cuando se edite este archivo
import { type ReactNode } from "react";
import { Drawer } from "../animated/SimpleDrawer";
import { EventForm } from "./agenda/EventForm";
import type { Customer, Service, User } from "@prisma/client";

export const EventFormDrawer = ({
  event,
  onClose,
  isOpen = false,
  onNewClientClick,
  customers,
  employees,
  services,
}: {
  employees: User[];
  services: Service[];
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
        services={services}
        employees={employees}
        customers={customers}
        onNewClientClick={onNewClientClick}
        onCancel={onClose}
        defaultValues={event}
      />
    </Drawer>
  );
};
