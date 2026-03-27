import { AnimatePresence, motion } from "motion/react"
import { type ReactNode, useState } from "react"
import { FaRegTrashCan } from "react-icons/fa6"
import { TbDots } from "react-icons/tb"
import { Link } from "react-router"
import { twMerge } from "tailwind-merge"
import { useOutsideClick } from "../hooks/useOutsideClick"

export const DropdownMenu = ({
  children,
  hideDefaultButton,
}: {
  children?: ReactNode
  hideDefaultButton?: boolean
}) => {
  const [show, setShow] = useState(false)
  const ref = useOutsideClick<HTMLDivElement>({
    isActive: show,
    onClickOutside: () => setShow(false),
    keyboardListener: true,
  })
  return (
    <div className="relative">
      <button
        onClick={() => {
          setShow((s) => !s)
        }}
        type="button"
        className={twMerge(
          "text-brand_gray ml-auton text-xl",
          show && "bg-brand_pale",
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
            className="z-10 absolute bg-white shadow-lg text-brand_gray rounded-2xl top-[100%] right-0 w-max p-2 flex flex-col gap-1"
          >
            {children}
            {!hideDefaultButton && <MenuButton isDisabled />}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const MENU_BUTTON_VARIANTS = {
  danger: "text-brand_red hover:bg-brand_red/5",
  default: "text-brand_gray hover:bg-brand_blue/5",
} as const

export type MenuButtonVariant = keyof typeof MENU_BUTTON_VARIANTS

export const MenuButton = ({
  children = "eliminar",
  to = "",
  state,
  isDisabled,
  onClick,
  variant = children === "eliminar" ? "danger" : "default",
  icon = (
    <span className="text-md">
      <FaRegTrashCan />
    </span>
  ),
  className,
}: {
  state?: Record<string, string>
  to?: string
  isDisabled?: boolean
  className?: string
  onClick?: () => void
  children?: ReactNode
  icon?: ReactNode
  variant?: MenuButtonVariant
}) => {
  const Element = ({ ...props }: { [x: string]: unknown }) => {
    return to ? (
      <Link {...props} to={to} state={state} />
    ) : (
      <div {...props}></div>
    )
  }
  return (
    <Element className="w-full">
      <button
        disabled={isDisabled}
        onClick={onClick}
        className={twMerge(
          "transition-all gap-3 items-center flex w-full whitespace-nowrap rounded-lg px-3 py-2 enabled:active:scale-95",
          MENU_BUTTON_VARIANTS[variant],
          isDisabled && "disabled:text-gray-300 disabled:cursor-not-allowed",
          className,
        )}
      >
        {icon}
        <span className="capitalize">{children}</span>
      </button>
    </Element>
  )
}
