import { AnimatePresence, motion } from "motion/react"
import type { ReactNode } from "react"
import { IoClose } from "react-icons/io5"
import { useClickOutside } from "~/utils/hooks/useClickOutside"
import { PrimaryButton } from "./primaryButton"
import { SecondaryButton } from "./secondaryButton"

type ConfirmModalProps = {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description?: ReactNode
  children?: ReactNode
  confirmText?: string
  cancelText?: string
  variant?: "danger" | "default"
  emoji?: string
  hideButtons?: boolean
}

export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  children,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  variant = "default",
  emoji = "🗑️",
  hideButtons,
}: ConfirmModalProps) => {
  const ref = useClickOutside<HTMLDivElement>({
    onOutsideClick: onClose,
    isActive: isOpen,
    includeEscape: true,
  })

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[999] flex items-center justify-center px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          aria-modal="true"
          role="dialog"
        >
          {/* overlay */}
          <motion.button
            type="button"
            onClick={onClose}
            className="absolute inset-0 bg-black/35 backdrop-blur-[16px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            aria-label="Cerrar"
          />

          {/* modal box */}
          <motion.div
            ref={ref}
            initial={{ opacity: 0, scale: 0.98, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 6 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            className="relative w-full max-w-[640px] rounded-2xl bg-white shadow-[0_20px_60px_rgba(0,0,0,0.18)] font-satoshi"
          >
            {/* badge superior (agregado) */}
            <div className="absolute left-1/2 -top-10 -translate-x-1/2 z-20">
              <div className="h-20 w-20 rounded-full bg-white flex items-center justify-center">
                <div className="h-16 w-16 rounded-full bg-brand_sky flex items-center justify-center">
                  <span
                    role="img"
                    aria-label="link"
                    className="text-3xl leading-none"
                  >
                    {emoji}
                  </span>
                </div>
              </div>
            </div>

            {/* close button */}
            <button
              type="button"
              onClick={onClose}
              className="absolute right-6 top-6 text-brand_gray rounded-full border border-ash h-8 w-8 flex items-center justify-center transition-all active:scale-95"
              aria-label="Cerrar"
            >
              <IoClose className="text-2xl" />
            </button>

            {/* content */}
            <div className="w-full px-6 md:px-12 pt-12 pb-8 flex flex-col items-center">
              <h3 className="text-center font-satoBold text-[20px] md:text-2xl leading-[28px] md:leading-8 text-brand_dark">
                {title}
              </h3>

              {description && (
                <p className="mt-[16px] text-center font-normal font-satoshi text-[16px] leading-[22px] text-brand_gray">
                  {description}
                </p>
              )}

              {children}

              {/* buttons */}
              {!hideButtons && (
                <div className="mt-10 flex items-center justify-center gap-4 md:gap-8">
                  <SecondaryButton
                    onClick={onClose}
                    className="w-[160px] h-12 min-h-12"
                  >
                    {cancelText}
                  </SecondaryButton>

                  <PrimaryButton
                    onClick={onConfirm}
                    className={
                      variant === "danger"
                        ? "w-[160px] h-12 min-h-12 bg-[#CA5757] hover:bg-[#B84E4E]"
                        : "w-[160px] h-12 min-h-12"
                    }
                  >
                    {confirmText}
                  </PrimaryButton>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
