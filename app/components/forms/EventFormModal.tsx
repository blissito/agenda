import { ReactNode, useState } from "react";
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
  const [isValid, setIsValid] = useState(false);
  return (
    <Drawer
      isValid={isValid}
      title="Agendar cita"
      isOpen={isOpen}
      onClose={onClose}
      size="big"
    >
      <EventForm defaultValues={event} onValid={setIsValid} />
    </Drawer>
  );
};
