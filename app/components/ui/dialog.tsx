import type { Org } from "@prisma/client"
import { AnimatePresence, motion } from "motion/react"
import {
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
  useEffect,
  useRef,
} from "react"
import { useDisclosure } from "~/utils/hooks/useDisclosure"
import { TemplateForm } from "../forms/website/TemplateForm"

type OrgWithDomain = Org & {
  customDomain?: string | null
  customDomainStatus?: string | null
  customDomainDns?: unknown
}

export function TemplateFormModal({
  org,
  trigger,
}: {
  trigger: ReactNode
  org: OrgWithDomain
}) {
  const { isOpen, close, open } = useDisclosure(false)
  return (
    <Modal onOpen={open} onClose={close} open={isOpen} trigger={trigger}>
      {<TemplateForm onClose={close} org={org} />}
    </Modal>
  )
}

export const Modal = ({
  onOpen,
  onClose,
  open,
  trigger,
  children,
  title,
}: {
  title?: string
  onOpen: () => void
  onClose: () => void
  open: boolean
  trigger: ReactNode
  children: ReactNode
}) => {
  return (
    <>
      <button onClick={onOpen}>{trigger}</button>
      <AnimatePresence>
        {open && (
          <OpenedModal title={title} onClose={onClose}>
            {children}
          </OpenedModal>
        )}
      </AnimatePresence>
    </>
  )
}

const OpenedModal = ({
  children,
  title,
  onClose,
}: {
  title?: string
  onClose: () => void
  children: ReactNode
}) => {
  const overlayRef = useRef(null)
  useEffect(() => {
    const escListener = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose?.()
      }
    }
    addEventListener("keydown", escListener)
    // Bloquear scroll del fondo (scrollbar-gutter evita el layout shift)
    document.body.style.overflowY = "hidden"
    return () => {
      removeEventListener("keydown", escListener)
      document.body.style.overflowY = ""
    }
  }, [onClose])

  return (
    <motion.article
      ref={overlayRef}
      onClick={(event) => {
        if (event.currentTarget === overlayRef.current) {
          onClose?.()
        }
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed bg-black/50 backdrop-blur-sm z-50 inset-0 grid place-content-center"
    >
      <motion.section
        onClick={(event: ReactMouseEvent) => event.stopPropagation()}
        initial={{ y: 8, opacity: 0, scale: 0.98 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 8, opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.15 }}
        className="bg-white px-6 py-6 overflow-auto rounded-xl mx-auto w-max max-h-[80vh]"
        style={{ scrollbarWidth: "none" }}
      >
        {title && <h2 className="text-2xl">{title}</h2>}
        {children}
      </motion.section>
    </motion.article>
  )
}
