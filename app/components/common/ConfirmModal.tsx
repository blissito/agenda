import { AnimatePresence, motion } from "motion/react";
import { IoClose } from "react-icons/io5";
import { useClickOutside } from "~/utils/hooks/useClickOutside";
import { SecondaryButton } from "./secondaryButton";
import { PrimaryButton } from "./primaryButton";

type ConfirmModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "default";
};

export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  variant = "default",
}: ConfirmModalProps) => {
  const ref = useClickOutside<HTMLDivElement>({
    onOutsideClick: onClose,
    isActive: isOpen,
    includeEscape: true,
  });

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
            className="relative w-[640px] rounded-2xl bg-white shadow-[0_20px_60px_rgba(0,0,0,0.18)] font-satoshi"
          >
            {/* close button */}
            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-all active:scale-95"
              aria-label="Cerrar"
            >
              <IoClose />
            </button>

            {/* content */}
            <div className="w-full px-12 pt-8 pb-8 flex flex-col items-center">
              <h3 className="text-center font-satoBold text-2xl leading-[32px] text-brand_dark">
                {title}
              </h3>

              {description && (
                <p className="mt-[16px] text-center font-medium font-satoshi text-[16px] leading-[22px] text-brand_gray">
                  {description}
                </p>
              )}

              {/* buttons */}
              <div className="mt-12 flex items-center justify-center gap-8">
                <SecondaryButton
                  onClick={onClose}
                  className="w-[160px] h-10"
                >
                  {cancelText}
                </SecondaryButton>

                <PrimaryButton
                  onClick={onConfirm}
                  className={
                    variant === "danger"
                      ? "w-[160px] h-10 bg-[#CA5757] hover:bg-[#B84E4E]"
                      : "w-[160px] h-10"
                  }
                >
                  {confirmText}
                </PrimaryButton>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
