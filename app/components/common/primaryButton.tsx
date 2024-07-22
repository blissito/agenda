import { Link } from "@remix-run/react";
import { type ReactNode } from "react";
import { twMerge } from "tailwind-merge";

export const PrimaryButton = ({
  as = "button",
  isDisabled,
  className,
  ...props
}: {
  // booleano útil
  isDisabled?: boolean;
  // Se puede sobreescribir cualquier clase o utilidad
  className?: string;
  // Se puede devolver un button o un anchor (<a>) si es necesario
  as?: "a" | "button" | ReactNode | "Link";
  // Si se elije anchor, se necesita de un href (link externos)
  href?: string;
  // Es probable que se quiera rutear internamente con Link
  to?: string;
  [x: string]: unknown;
}) => {
  const Element = as === "Link" ? Link : as;

  return (
    <Element
      disabled={isDisabled}
      {...props}
      className={twMerge(
        isDisabled && "disabled:bg-gray-300 disabled:cursor-not-allowed",
        "bg-brand_blue font-satoshi text-white h-[52px] min-w-[120px] px-4 rounded-full flex items-center justify-center text-center gap-2 transition duration-400",
        // hover/click animation:
        "transition-all",
        !isDisabled && "hover:-translate-y-1",
        "active:translate-y-[0.1px]",
        className
      )}
    />
  );
};
