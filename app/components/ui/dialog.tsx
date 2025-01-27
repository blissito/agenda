import { type ReactNode, useEffect, useState } from "react";
import type { Org } from "@prisma/client";
import { TemplateForm } from "../forms/website/TemplateForm";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "~/utils/cn";
import { useDisclosure } from "~/utils/hooks/useDisclosure";

// left here to demo
export function TemplateFormModal({
  org,
  trigger,
}: {
  trigger: ReactNode;
  org: Org;
}) {
  const { isOpen, close, open } = useDisclosure(false);
  return (
    <Modal onOpen={open} onClose={close} open={isOpen} trigger={trigger}>
      {<TemplateForm defaultValues={org} />}
    </Modal>
  );
}

export const Modal = ({
  onOpen,
  onClose,
  open,
  trigger,
  children,
}: {
  onOpen: () => void;
  onClose: () => void;
  open: boolean;
  trigger: ReactNode;
  children: ReactNode;
}) => {
  return (
    <>
      <button onClick={onOpen}>{trigger}</button>
      <AnimatePresence>
        {open && <OpenedModal onClose={onClose}>{children}</OpenedModal>}
      </AnimatePresence>
    </>
  );
};

const OpenedModal = ({
  children,
  onClose,
}: {
  onClose: () => void;
  children: ReactNode;
}) => {
  useEffect(() => {
    const escListener = (e) => {
      if (e.key === "Escape") {
        onClose?.();
      }
    };
    addEventListener("keydown", escListener);
    document.body.style.overflowY = "hidden";

    return () => {
      removeEventListener("keydown", escListener);
      document.body.style.overflowY = "auto";
    };
  }, []);
  return (
    <>
      <motion.article
        onClick={onClose}
        initial={{ backdropFilter: "blur(0px)" }}
        animate={{ backdropFilter: "blur(4px)" }}
        exit={{ backdropFilter: "blur(0px)" }}
        className={cn(
          "relative",
          "fixed bg-black/50 backdrop-blur z-10 inset-0 grid place-content-center"
        )}
      >
        <motion.section
          onClick={(event) => event.stopPropagation()} // to avoid closing by upper onClick
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -10, opacity: 0 }}
          className={cn(
            "bg-white px-6 pt-6 overflow-auto rounded-xl mx-auto w-max h-[80vh]"
          )}
          style={{ scrollbarWidth: "none" }}
        >
          {children}
        </motion.section>
      </motion.article>
    </>
  );
};
