import { type ReactNode } from "react";

export const PrimaryButton = ({
  children,
  ...props
}: {
  props?: unknown;
  children: ReactNode;
}) => (
  <button className="bg-brand_blue font-body text-white h-[52px] min-w-[120px] px-4 rounded-full flex items-center justify-center text-center gap-2">
    {children}
  </button>
);
