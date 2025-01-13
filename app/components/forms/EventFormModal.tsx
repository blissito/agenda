import { ReactNode, useRef, useState } from "react";
import { Drawer } from "../animated/SimpleDrawer";
import { EventForm } from "./agenda/EventForm";

export const EventFormModal = ({
  event,
  onClose,
  isOpen = false,
  onNewClientClick,
}: {
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
        onNewClientClick={onNewClientClick}
        onCancel={onClose}
        defaultValues={event}
      />
    </Drawer>
  );
};
