import { AnimatePresence, motion } from "framer-motion";
import { ReactNode, useEffect, useRef } from "react";
// import { createPortal } from "react-dom";
import { IoClose } from "react-icons/io5";

export const Drawer = ({
  children,
  isOpen = false,
  onClose,
  title = "Título",
  subtitle = "Subtítulo",
  cta,
}: {
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
        className="bg-white lg:w-[40%] md:w-[60%] w-[90%] z-10 h-screen fixed top-0 right-0 shadow-xl rounded-tl-3xl rounded-bl-3xl p-8 flex flex-col"
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
        <section className="overflow-y-scroll h-[95%]">{children}</section>
        <nav className="flex justify-end gap-4  mt-auto">
          <button
            onClick={onClose}
            className="text-red-500 bg-transparent px-8 py-2 hover:scale-95 transition-all"
          >
            Cancelar
          </button>
          {cta ? (
            cta
          ) : (
            <button
              onClick={onClose}
              className="bg-brand_blue text-white hover:scale-95 rounded-full px-8 py-2 transition-all"
            >
              Aceptar
            </button>
          )}
        </nav>
      </motion.section>
    </article>
  );

  /* <>{body.current && createPortal(jsx, body.current)}</> */
  return <AnimatePresence mode="popLayout">{isOpen && jsx}</AnimatePresence>;
};
