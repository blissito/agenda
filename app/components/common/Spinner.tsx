import { twMerge } from "tailwind-merge";

export const Spinner = ({ className }: { className?: string }) => {
  return (
    <img
      className={twMerge("animate-spin", className)}
      alt="loading spinner"
      src="/images/logos/spinner.svg"
    />
  );
};
