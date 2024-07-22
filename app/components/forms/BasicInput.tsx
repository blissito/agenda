import type { FieldError, FieldValues, UseFormRegister } from "react-hook-form";
import { twMerge } from "tailwind-merge";
import { REQUIRED_MESSAGE } from "~/routes/signup.$stepSlug";

type Props = {
  name: string;
  register: UseFormRegister<FieldValues> | any;
  error?: FieldError;
  label?: string;
  className?: string;
  registerOptions?: { required: string | boolean };
};
export const BasicInput = ({
  className,
  registerOptions = { required: REQUIRED_MESSAGE },
  error,
  label,
  name,
  register = () => undefined,
  ...props
}: Props) => {
  return (
    <>
      <label className={twMerge(" text-neutral-950", className)} htmlFor={name}>
        {label}
      </label>
      <input
        className={twMerge(
          "focus:border-brand_blue",
          "rounded-xl border-gray-200",
          !!error && "border-red-500"
        )}
        {...props}
        {...register(name, registerOptions)}
      />
      <p className="mb-6 text-xs text-red-500 h-1 pl-1">{error?.message}</p>
    </>
  );
};

BasicInput.displayName = "BasicInput";
