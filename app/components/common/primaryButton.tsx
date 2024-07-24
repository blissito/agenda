import { Link } from "@remix-run/react";
import { type ReactNode } from "react";
import { FaSpinner } from "react-icons/fa";
import { twMerge } from "tailwind-merge";

export const PrimaryButton = ({
  as = "button",
  isDisabled,
  isLoading,
  className,
  children,
  ...props
}: {
  // booleanos útiles
  isDisabled?: boolean;
  isLoading?: boolean;
  // Se puede sobreescribir cualquier clase o utilidad
  className?: string;
  // Se puede devolver un button o un anchor (<a>) si es necesario
  as?: "a" | "button" | ReactNode | "Link";
  // Si se elije anchor, se necesita de un href (link externos)
  href?: string;
  // Es probable que se quiera rutear internamente con Link
  to?: string;
  children?: ReactNode;
  [x: string]: unknown;
}) => {
  const Element = as === "Link" ? Link : as;

  return (
    <Element
      disabled={isDisabled}
      {...props}
      className={twMerge(
        isDisabled && "disabled:bg-gray-300 disabled:cursor-not-allowed",
        "bg-brand_blue font-satoshi text-white h-[48px] min-w-[120px] px-4 rounded-full flex items-center justify-center text-center gap-2 transition duration-400",
        // hover/click animation:
        "transition-all",
        !isDisabled && "hover:-translate-y-1",
        "active:translate-y-[0.1px]",
        isLoading && "bg-brand_blue/50 text-gray-600 pointer-events-none",
        className
      )}
    >
      {children}{" "}
      {!isDisabled && isLoading && <FaSpinner className="animate-spin" />}
    </Element>
  );
};
