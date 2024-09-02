import { SyntheticEvent } from "react";
import { twMerge } from "tailwind-merge";

export const Image = ({
  src,
  className,
  alt = "illustration",
  ...props
}: {
  className?: string;
  src?: string | null;
  props?: unknown;
  alt?: string;
}) => {
  const defaultSrc = "/images/serviceDefault.png";
  return (
    <img
      alt={alt}
      {...props}
      className={twMerge("w-full h-[180px] object-cover object-top", className)}
      src={src}
      onError={(e: SyntheticEvent<HTMLImageElement, Event>) => {
        (e.target as HTMLInputElement).onerror = null; // previene el loop
        (e.target as HTMLInputElement).src = defaultSrc;
      }}
    />
  );
};
