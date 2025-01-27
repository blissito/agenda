import { useDisclosure } from "~/utils/hooks/useDisclosure";
import { Modal } from "../dialog";
import { SocialDataForm } from "~/components/forms/website/SocialDataForm";
import type { ReactNode } from "react";

export const SocialDataFormModal = ({ children }: { children: ReactNode }) => {
  const { isOpen, close, open } = useDisclosure();
  return (
    <Modal trigger={children} onClose={close} onOpen={open} open={isOpen}>
      <SocialDataForm />
    </Modal>
  );
};
