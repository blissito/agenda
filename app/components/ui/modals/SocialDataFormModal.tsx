import type { Org } from "@prisma/client"
import type { ReactNode } from "react"
import { SocialDataForm } from "~/components/forms/website/SocialDataForm"
import { useDisclosure } from "~/utils/hooks/useDisclosure"
import { Modal } from "../dialog"

export const SocialDataFormModal = ({
  org,
  children,
}: {
  org: Org
  children: ReactNode
}) => {
  const { isOpen, close, open } = useDisclosure()
  return (
    <Modal trigger={children} onClose={close} onOpen={open} open={isOpen}>
      <SocialDataForm onClose={close} defaultValues={org} />
    </Modal>
  )
}
