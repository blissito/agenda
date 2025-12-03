import type { ReactNode } from "react";
import { twMerge } from "tailwind-merge";

export const SocialMedia = ({
  icon,
  link,
  className,
}: {
  icon?: ReactNode;
  link?: string;
  className?: string;
}) => {
  return (
    <a href={link}>
      <div
        className={twMerge(
          className,
          "w-8 h-8 rounded-full flex justify-center items-center "
        )}
      >
        {icon}
      </div>
    </a>
  );
};
