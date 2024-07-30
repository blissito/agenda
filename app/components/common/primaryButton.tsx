import { Link } from "@remix-run/react";
import { ElementType, type ReactNode } from "react";
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
  as?: "a" | "button" | ElementType | "Link";
  // Si se elije anchor, se necesita de un href (link externos)
  href?: string;
  // Es probable que se quiera rutear internamente con Link
  to?: string;
  children?: ReactNode;
  [x: string]: unknown;
}) => {
  const Element = as === "Link" ? Link : as;

  const getClassName = () => {
    const getGeneral = () =>
      "bg-brand_blue font-satoshi text-white min-w-[120px] px-4 rounded-full text-center transition duration-400 block py-2 active:translate-y-[0.1px] flex justify-center";

    const getLoadingStyles = () =>
      "bg-brand_blue/50 text-gray-600 pointer-events-none flex items-center gap-2";

    const getDisabledStyles = () =>
      "disabled:bg-gray-300 disabled:cursor-not-allowed";

    return twMerge(
      getGeneral(),
      isLoading && getLoadingStyles(),
      isDisabled && getDisabledStyles(),
      !isDisabled && "hover:-translate-y-1", // hack para no repetir
      className
    );
  };

  return (
    <Element disabled={isDisabled} {...props} className={getClassName()}>
      {!isDisabled && isLoading && <FaSpinner className="animate-spin" />}
      {children}
    </Element>
  );
};
