import { twMerge } from "tailwind-merge";

export const Avatar = ({
  className,
  image,
}: {
  className?: string;
  image?: string;
}) => (
  <img
    className={twMerge(
      "w-12 h-12 rounded-full object-cover border-[2px] border-white -ml-3",
      className
    )}
    src={image ? image : "/images/img4.jpg"}
  />
);
