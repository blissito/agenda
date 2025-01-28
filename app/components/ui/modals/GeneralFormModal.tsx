import { useDisclosure } from "~/utils/hooks/useDisclosure";
import { Modal } from "../dialog";
import type { ReactNode } from "react";
import { GeneralForm } from "~/components/forms/website/GeneralForm";
import type { Org } from "@prisma/client";

export const GeneralFormModal = ({
  org,
  children,
}: {
  org?: Org;
  children: ReactNode;
}) => {
  const { isOpen, close, open } = useDisclosure();
  return (
    <Modal trigger={children} onClose={close} onOpen={open} open={isOpen}>
      <GeneralForm onClose={close} defaultValues={org} />
    </Modal>
  );
};
