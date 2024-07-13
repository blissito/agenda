import { type ReactNode } from "react";
import { twMerge } from "tailwind-merge";

export const SecondaryButton = ({
  children,
  className,
}: {
  className?: string;
  children: ReactNode;
}) => (
  <button
    className={twMerge(
      " bg-brand_pale font-satoshi text-brand-dark h-[52px] min-w-[120px] px-4 rounded-full flex items-center justify-center text-center gap-2 hover:-translate-y-1 transition duration-400 ",
      className
    )}
  >
    {children}
  </button>
);
