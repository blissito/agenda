import { useDisclosure } from "~/utils/hooks/useDisclosure";
import { Modal } from "../dialog";
import type { ReactNode } from "react";
import type { Service } from "@prisma/client";
import ServicesForm from "~/components/forms/website/ServicesForm";

export const ServicesFormModal = ({
  services,
  children,
}: {
  services: Service[];
  children: ReactNode;
}) => {
  const { isOpen, close, open } = useDisclosure();
  return (
    <Modal trigger={children} onClose={close} onOpen={open} open={isOpen}>
      <ServicesForm onCancel={close} services={services || []} />
    </Modal>
  );
};
