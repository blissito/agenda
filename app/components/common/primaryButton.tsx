import { Link } from "@remix-run/react";
import { type ReactNode } from "react";
import { twMerge } from "tailwind-merge";

export const PrimaryButton = ({
  as = "button",
  className,
  ...props
}: {
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
      {...props}
      className={twMerge(
        "bg-brand_blue font-satoshi text-white h-[52px] min-w-[120px] px-4 rounded-full flex items-center justify-center text-center gap-2  hover:-translate-y-1 transition duration-400",
        className
      )}
    />
  );
};
