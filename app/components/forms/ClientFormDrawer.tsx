import { Drawer } from "../animated/SimpleDrawer";
import { ClientForm } from "./agenda/ClientForm";

type ClientFormDrawerProps = {
  onClose?: () => void;
  isOpen?: boolean;
};

export const ClientFormDrawer = ({
  onClose,
  isOpen = false,
}: ClientFormDrawerProps) => {
  return (
    <Drawer
      title="Agendar cita"
      isOpen={isOpen}
      onClose={onClose}
      size="big"
      footer={<></>}
    >
      <ClientForm onFetch={onClose} />
    </Drawer>
  );
};
