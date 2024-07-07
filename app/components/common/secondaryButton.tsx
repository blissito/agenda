import { type ReactNode } from "react";

export const SecondaryButton = ({
  children,
  ...props
}: {
  props?: unknown;
  children: ReactNode;
}) => (
  <button className=" bg-brand_pale font-body text-brand-dark h-[52px] min-w-[120px] px-4 rounded-full flex items-center justify-center text-center gap-2 hover:-translate-y-1 transition duration-400 ">
    {children}
  </button>
);