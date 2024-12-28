import { ReactNode, useRef, useState } from "react";
import { Drawer } from "../animated/SimpleDrawer";
import { EventForm } from "./agenda/EventForm";

export const EventFormModal = ({
  event,
  onClose,
  isOpen = false,
}: {
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
      <EventForm onCancel={onClose} defaultValues={event} />
    </Drawer>
  );
};
