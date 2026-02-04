import { twMerge } from "tailwind-merge"

export const Spinner = ({ className }: { className?: string }) => {
  return (
    <img
      className={twMerge("animate-spin w-6", className)}
      alt="loading spinner"
      src="/images/logos/spinner.svg"
    />
  )
}
