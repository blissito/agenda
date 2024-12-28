import { AnimatePresence, motion } from "framer-motion";
import { ReactNode, useEffect, useRef } from "react";
// import { createPortal } from "react-dom";
import { IoClose } from "react-icons/io5";
import { cn } from "~/utils/cn";

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
  footer?: ReactNode;
  onClick?: () => void;
  isValid?: boolean;
  size?: "big";
  cta?: ReactNode;
  title?: string;
  subtitle?: string;
  onClose?: () => void;
  isOpen?: boolean;
  children: ReactNode;
}) => {
  const body = useRef<HTMLElement>();

  // listeners
  const handleKeys = (event: unknown) => {
    if (event.key === "Escape") {
      onClose?.();
    }
  };

  useEffect(() => {
    if (document.body) {
      body.current = document.body;
    }
    // listers
    addEventListener("keydown", handleKeys);

    // block scroll
    if (document.body && isOpen) {
      document.body.style.overflow = "hidden";
    } else if (document.body && !isOpen) {
      document.body.style.overflow = "";
    }
    // clean up
    return () => {
      removeEventListener("keydown", handleKeys);
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const jsx = (
    <article>
      <motion.button
        onClick={onClose}
        id="overlay"
        className="fixed inset-0 bg-slate-200/20 z-10"
        animate={{ backdropFilter: "blur(4px)" }}
        exit={{ backdropFilter: "blur(0)", opacity: 0 }}
      />
      <motion.section
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "120%" }}
        transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
        className={cn(
          "bg-white lg:w-[40%] md:w-[60%] w-[90%] z-10 h-screen fixed top-0 right-0 shadow-xl rounded-tl-3xl rounded-bl-3xl p-8 flex flex-col",
          {
            "md:w-[80%] lg:w-[60%]": size === "big",
          }
        )}
      >
        <header className="flex items-start justify-between mb-6">
          <div>
            <h4 className="fot-bold text-2xl">{title}</h4>
            <p className="text-brand_gray">{subtitle}</p>
          </div>
          <button
            tabIndex={0}
            onClick={onClose}
            className="text-2xl bg-gray-200 rounded-full p-1 active:scale-95"
          >
            <IoClose />
          </button>
        </header>
        <section
          style={{
            scrollbarWidth: "none",
          }}
          className="overflow-y-scroll h-[95%]"
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
                  }
                )}
              >
                Guardar
              </button>
            )}
          </nav>
        )}
      </motion.section>
    </article>
  );

  /* <>{body.current && createPortal(jsx, body.current)}</> */
  return <AnimatePresence mode="popLayout">{isOpen && jsx}</AnimatePresence>;
};
