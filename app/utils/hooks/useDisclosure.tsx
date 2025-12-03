import { useState } from "react";
export const useDisclosure = (initial: boolean = false) => {
  const [isOpen, setIsOpen] = useState(initial);
  return {
    isOpen,
    close() {
      setIsOpen(false);
    },
    open() {
      setIsOpen(true);
    },
  };
};
