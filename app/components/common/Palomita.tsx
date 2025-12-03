import { cn } from "~/utils/cn";

export const Palomita = ({ className }: { className?: string }) => (
  <span
    className={cn(
      "absolute top-2 right-2 text-[8px] text-white w-5 h-5 flex justify-center items-center bg-brand_blue rounded-full ",
      className
    )}
  >
    &#10003;
  </span>
);
