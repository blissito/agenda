import { ReactNode, useRef, useState } from "react";
import { Drawer } from "../animated/SimpleDrawer";
import { ClientForm } from "./agenda/ClientForm";

export const ClientFormDrawer = ({
  onClose,
  isOpen = false,
}: {
  onClose?: () => void;
  isOpen?: boolean;
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
      <ClientForm onCancel={onClose} ctaText={"Guardar"} />
    </Drawer>
  );
};
