import { AnimatePresence, motion } from "motion/react"
import { type ReactNode, useEffect, useRef } from "react"
// import { createPortal } from "react-dom";
import { IoClose } from "react-icons/io5"
import { cn } from "~/utils/cn"

export const Drawer = ({
  children,
  onClick,
  isOpen = false,
  onClose,
  title = "Título",
  subtitle = "",
  cta,
  size,
  isValid,
  footer,
}: {
  footer?: ReactNode
  onClick?: () => void
  isValid?: boolean
  size?: "big"
  cta?: ReactNode
  title?: string
  subtitle?: string
  onClose?: () => void
  isOpen?: boolean
  children: ReactNode
}) => {
  const body = useRef<HTMLElement | null>(null)

  // listeners
  const handleKeys = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      onClose?.()
    }
  }

  useEffect(() => {
    if (document.body) {
      body.current = document.body
    }
    // listers
    addEventListener("keydown", handleKeys)

    // block scroll
    if (document.body && isOpen) {
      document.body.style.overflow = "hidden"
    } else if (document.body && !isOpen) {
      document.body.style.overflow = ""
    }
    // clean up
    return () => {
      removeEventListener("keydown", handleKeys)
      document.body.style.overflow = ""
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, handleKeys])

  const jsx = (
    <article>
      <motion.button
        onClick={onClose}
        id="overlay"
        className="fixed inset-0 bg-slate-900/40 z-40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15, ease: "easeOut" }}
      />
      <motion.section
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
        style={{ willChange: "transform" }}
        className={cn(
          "bg-white md:max-w-[540px] lg:w-[40%] md:w-[60%] w-full z-50 h-screen fixed top-0 right-0 shadow-xl md:rounded-tl-3xl md:rounded-bl-3xl p-6 md:p-8 flex flex-col",
          {
            "md:max-w-[580px] md:w-[580px] lg:w-[580px]": size === "big",
          },
        )}
      >
        <header className="flex items-start justify-between mb-6">
          <div>
            <h4 className="font-satoBold text-2xl">{title}</h4>
            <p className="text-brand_gray">{subtitle}</p>
          </div>
          <button
            tabIndex={0}
            onClick={onClose}
            className="text-2xl border-brand_ash border text-brand_gray w-8 h-8 grid place-items-center rounded-full p-1 active:scale-95"
          >
            <IoClose className="-mt-[1px] -ml-[1px]" />
          </button>
        </header>
        <section
          className="flex-1 overflow-y-auto"
          style={{
            scrollbarWidth: "none",
          }}
        >
          {children}
        </section>
        {footer ? (
          footer
        ) : (
          <nav className="flex justify-end gap-4  mt-auto">
            <button
              onClick={onClose}
              className="text-gray-800 bg-gray-200 rounded-full px-8 py-2 hover:scale-95 transition-all"
            >
              Cancelar
            </button>
            {cta ? (
              cta
            ) : (
              <button
                disabled={!isValid}
                onClick={onClick}
                className={cn(
                  "bg-brand_blue text-white hover:scale-95 rounded-full px-8 py-2 transition-all",
                  {
                    "disabled:bg-gray-200": true,
                    "active:bg-brand_blue/90": true,
                  },
                )}
              >
                Guardar
              </button>
            )}
          </nav>
        )}
      </motion.section>
    </article>
  )

  /* <>{body.current && createPortal(jsx, body.current)}</> */
  return <AnimatePresence>{isOpen && jsx}</AnimatePresence>
}
