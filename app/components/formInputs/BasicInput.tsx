import { ReactNode } from "react";
import { twMerge } from "tailwind-merge";

export const BasicInput = ({
  type = "text",
  label,
  name,
  className,
  ...props
}: {
  className?: string;
  name: string;
  label?: string;
  type?: string;
  [props: string]: string | number | ReactNode | unknown;
}) => {
  return (
    <>
      <label
        className={twMerge("mb-1 text-neutral-950", className)}
        htmlFor={name}
      >
        {label}
      </label>
      <input
        className={twMerge("rounded-xl border-gray-200")}
        {...props}
        name={name}
        id={name}
        type={type}
      />
      <p className="mb-6">{/* Error  */}</p>
    </>
  );
};
