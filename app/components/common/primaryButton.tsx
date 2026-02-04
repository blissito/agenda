import { Link, type LinkProps } from "react-router";
import type { ReactNode, ButtonHTMLAttributes, AnchorHTMLAttributes } from "react";
import { FaSpinner } from "react-icons/fa";
import { twMerge } from "tailwind-merge";

type BaseProps = {
  onClick?: () => void;
  mode?: "ghost" | "cancel" | "primary";
  isDisabled?: boolean;
  isLoading?: boolean;
  className?: string;
  children?: ReactNode;
};

type ButtonProps = BaseProps & {
  as?: "button";
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseProps>;

type AnchorProps = BaseProps & {
  as: "a";
  href: string;
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof BaseProps>;

type LinkPropsType = BaseProps & {
  as: "Link";
  to: string;
  prefetch?: "intent" | "render" | "viewport" | "none";
} & Omit<LinkProps, keyof BaseProps | "to">;

type PrimaryButtonProps = ButtonProps | AnchorProps | LinkPropsType;

export const PrimaryButton = (props: PrimaryButtonProps) => {
  const {
    as = "button",
    isDisabled,
    isLoading,
    className,
    children,
    onClick,
    mode = "primary",
    ...rest
  } = props;

  const getClassName = () => {
    const getGeneral = () =>
      "bg-brand_blue font-satoMiddle text-white min-w-[120px] min-h-[44px] gap-2 px-4 rounded-full text-center transition duration-400 block py-2 active:translate-y-[0.1px] flex justify-center items-center";

    const getLoadingStyles = () =>
      "bg-brand_blue/50 pointer-events-none flex items-center gap-2";

    const getDisabledStyles = () =>
      "disabled:bg-brand_blue/30 disabled:text-white/50 disabled:cursor-not-allowed disabled:hover:translate-y-0";

    return twMerge(
      getGeneral(),
      isLoading && getLoadingStyles(),
      isDisabled && getDisabledStyles(),
      !isDisabled && !isLoading && "hover:-translate-y-1",
      mode === "cancel" && "bg-gray-300 text-gray-800",
      className
    );
  };

  const content = !isDisabled && isLoading ? (
    <FaSpinner className="animate-spin text-xl" />
  ) : (
    children
  );

  if (as === "Link") {
    const { to, prefetch = "intent", ...linkRest } = rest as Omit<LinkPropsType, keyof BaseProps | "as">;
    return (
      <Link
        to={to}
        prefetch={prefetch}
        onClick={onClick}
        className={getClassName()}
        {...linkRest}
      >
        {content}
      </Link>
    );
  }

  if (as === "a") {
    const { href, ...anchorRest } = rest as Omit<AnchorProps, keyof BaseProps | "as">;
    return (
      <a
        href={href}
        onClick={onClick}
        className={getClassName()}
        {...anchorRest}
      >
        {content}
      </a>
    );
  }

  const buttonRest = rest as Omit<ButtonProps, keyof BaseProps | "as">;
  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className={getClassName()}
      {...buttonRest}
    >
      {content}
    </button>
  );
};
