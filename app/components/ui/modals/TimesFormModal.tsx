import { useDisclosure } from "~/utils/hooks/useDisclosure";
import { Modal } from "../dialog";
import type { ReactNode } from "react";
import type { Org } from "@prisma/client";
import { TimesForm } from "~/components/forms/TimesForm";

export const TimesFormModal = ({
  org,
  children,
}: {
  org: Org;
  children: ReactNode;
}) => {
  const { isOpen, close, open } = useDisclosure();
  return (
    <Modal trigger={children} onClose={close} onOpen={open} open={isOpen}>
      <TimesForm onClose={close} org={org} />
    </Modal>
  );
};
