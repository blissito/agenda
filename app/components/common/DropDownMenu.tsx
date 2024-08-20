import { AnimatePresence, motion } from "framer-motion";
import { ReactNode, useState } from "react";
import { FaRegTrashCan } from "react-icons/fa6";
import { TbDots } from "react-icons/tb";
import { twMerge } from "tailwind-merge";
import { useOutsideClick } from "../hooks/useOutsideClick";
import { Link } from "@remix-run/react";

export const DropdownMenu = ({ children }: { children?: ReactNode }) => {
  const [show, setShow] = useState(false);
  const ref = useOutsideClick<HTMLDivElement>({
    isActive: show,
    onClickOutside: () => setShow(false),
    keyboardListener: true,
  });
  return (
    <div className="relative">
      <button
        onClick={() => {
          setShow((s) => !s);
        }}
        type="button"
        className={twMerge(
          "text-brand_gray ml-auton text-xl",
          show && "bg-brand_pale"
        )}
      >
        <TbDots />
      </button>
      <AnimatePresence>
        {show && (
          <motion.div
            ref={ref}
            initial={{ opacity: 0, y: -3 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -3 }}
            className="z-10 absolute bg-white shadow-lg text-brand_gray rounded-3xl top-[100%] right-8 border w-max px-4 py-3 flex flex-col gap-5"
          >
            {children}
            <MenuButton isDisabled />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const MenuButton = ({
  children = "eliminar",
  to = "",
  state,
  isDisabled,
  onClick,
  icon = ( // @TODO: remove default
    <span className="text-md">
      <FaRegTrashCan />
    </span>
  ),
  className = "text-red-500/70 hover:text-red-500",
}: {
  state?: Record<string, string>;
  to?: string;
  isDisabled?: boolean;
  className?: string;
  onClick?: () => void;
  children?: ReactNode;
  icon?: ReactNode;
}) => {
  const Element = ({ ...props }: { [x: string]: unknown }) => {
    return to ? (
      <Link {...props} to={to} state={state} />
    ) : (
      <div {...props}></div>
    );
  };
  return (
    <Element>
      <button
        disabled={isDisabled}
        onClick={onClick}
        className={twMerge(
          "transition-all gap-3 items-center flex hover:text-black enabled:active:scale-95",
          isDisabled && "disabled:text-gray-300 disabled:cursor-not-allowed",
          className
        )}
      >
        {icon}
        <span className="capitalize">{children}</span>
      </button>
    </Element>
  );
};
