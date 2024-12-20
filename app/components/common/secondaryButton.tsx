// import { type ReactNode } from "react";
// import { twMerge } from "tailwind-merge";

// export const SecondaryButton = ({
//   children,
//   className,
// }: {
//   className?: string;
//   children: ReactNode;
// }) => (
//   <button
//     className={twMerge(
//       " bg-brand_pale font-satoshi text-brand-dark h-[48px] min-w-[120px] px-4 rounded-full flex items-center justify-center text-center gap-2 hover:-translate-y-1 transition duration-400 ",
//       className
//     )}
//   >
//     {children}
//   </button>
// );

import { Link } from "@remix-run/react";
import { forwardRef, type ReactNode } from "react";
import { FaSpinner } from "react-icons/fa";
import { twMerge } from "tailwind-merge";

export const SecondaryButton = forwardRef(
  (
    {
      as = "button",
      onClick,
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
      onClick?: () => void;
    },
    ref
  ) => {
    const Element = as === "Link" ? Link : as;

    return (
      <Element
        ref={ref}
        disabled={isDisabled}
        {...props}
        onClick={onClick}
        className={twMerge(
          isDisabled &&
            "disabled:bg-gray-300 disabled:cursor-not-allowed font-satoMiddle",
          " bg-brand_pale   text-brand-dark h-[48px] min-w-[80px] px-4 rounded-full flex items-center justify-center text-center gap-2 hover:-translate-y-1 transition duration-400",
          // hover/click animation:
          "transition-all",
          !isDisabled && "hover:-translate-y-1",
          "active:translate-y-[0.1px]",
          isLoading && "bg-brand_blue/50 text-gray-600 pointer-events-none",
          className
        )}
      >
        {children}

        {!isDisabled && isLoading && <FaSpinner className="animate-spin" />}
      </Element>
    );
  }
);

SecondaryButton.displayName = "SecondaryButton";
