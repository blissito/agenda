import { Link, type LinkProps } from "react-router";
import {
  forwardRef,
  type ReactNode,
  type ButtonHTMLAttributes,
  type AnchorHTMLAttributes,
} from "react";
import { FaSpinner } from "react-icons/fa";
import { twMerge } from "tailwind-merge";

type BaseProps = {
  isDisabled?: boolean;
  isLoading?: boolean;
  className?: string;
  children?: ReactNode;
  onClick?: () => void;
};

type ButtonProps = BaseProps & {
  as?: "button" | "span";
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseProps>;

type AnchorProps = BaseProps & {
  as: "a";
  href: string;
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof BaseProps>;

type LinkPropsType = BaseProps & {
  as: "Link";
  to: string;
} & Omit<LinkProps, keyof BaseProps | "to">;

type SecondaryButtonProps = ButtonProps | AnchorProps | LinkPropsType;

export const SecondaryButton = forwardRef<
  HTMLButtonElement | HTMLAnchorElement | HTMLElement,
  SecondaryButtonProps
>((props, ref) => {
  const { as = "button", onClick, isDisabled, isLoading, className, children, ...rest } = props;

  const mergedClassName = twMerge(
    isDisabled && "disabled:bg-gray-300 disabled:cursor-not-allowed font-satoMiddle",
    "bg-brand_pale text-brand-dark h-[48px] min-w-[80px] px-4",
    "enabled:hover:-translate-y-1 transition duration-400",
    "rounded-full flex items-center justify-center text-center gap-2",
    "transition-all",
    "enabled:active:translate-y-[0.1px]",
    "disabled:text-gray-500",
    isLoading && "bg-brand_blue/50 text-gray-600 pointer-events-none",
    className
  );

  const content = (
    <>
      {children}
      {!isDisabled && isLoading && <FaSpinner className="animate-spin" />}
    </>
  );

  if (as === "Link") {
    const { to, ...linkRest } = rest as Omit<LinkPropsType, keyof BaseProps | "as">;
    return (
      <Link
        ref={ref as React.Ref<HTMLAnchorElement>}
        to={to}
        onClick={onClick}
        className={mergedClassName}
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
        ref={ref as React.Ref<HTMLAnchorElement>}
        href={href}
        onClick={onClick}
        className={mergedClassName}
        {...anchorRest}
      >
        {content}
      </a>
    );
  }

  if (as === "span") {
    return (
      <span onClick={onClick} className={mergedClassName}>
        {content}
      </span>
    );
  }

  const buttonRest = rest as Omit<ButtonProps, keyof BaseProps | "as">;
  return (
    <button
      ref={ref as React.Ref<HTMLButtonElement>}
      disabled={isDisabled}
      onClick={onClick}
      className={mergedClassName}
      {...buttonRest}
    >
      {content}
    </button>
  );
});

SecondaryButton.displayName = "SecondaryButton";
