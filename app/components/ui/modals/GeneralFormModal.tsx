import type { Org } from "@prisma/client"
import type { ReactNode } from "react"
import { GeneralForm } from "~/components/forms/website/GeneralForm"
import { useDisclosure } from "~/utils/hooks/useDisclosure"
import { Modal } from "../dialog"

type LogoAction = {
  putUrl: string
  removeUrl: string
  readUrl?: string
  logoKey: string
}

export const GeneralFormModal = ({
  org,
  children,
  logoAction,
}: {
  org?: Org
  children: ReactNode
  logoAction?: LogoAction
}) => {
  const { isOpen, close, open } = useDisclosure()
  return (
    <Modal trigger={children} onClose={close} onOpen={open} open={isOpen}>
      <GeneralForm onClose={close} defaultValues={org} logoAction={logoAction} />
    </Modal>
  )
}
