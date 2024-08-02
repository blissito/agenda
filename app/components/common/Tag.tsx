import { ReactNode } from "react";
import { twMerge } from "tailwind-merge";

export const Tag = ({
  className,
  children = "activo",
}: {
  children?: ReactNode;
  className?: string;
}) => (
  <section
    className={twMerge(
      "bg-brand_blue/20 text-brand_blue rounded-[4px] h-5 flex justify-center items-center text-center px-4  text-sm font-satoshi capitalize",
      className
    )}
  >
    {children}
  </section>
);
