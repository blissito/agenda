import { ReactNode } from "react";
import type { FieldError, FieldValues, UseFormRegister } from "react-hook-form";
import { twMerge } from "tailwind-merge";
import { REQUIRED_MESSAGE } from "~/routes/signup.$stepSlug";
import { cn } from "~/utils/cd";

export type Option = {
  value: string;
  title?: string;
};

type Props = {
  defaultValue?: string;
  name: string;
  register?: UseFormRegister<FieldValues> | any;
  error?: FieldError;
  label?: string;
  className?: string;
  registerOptions?: { required: string | boolean };
  placeholder?: string;
  options?: Option[];
  icon?: ReactNode;
  isDisabled?: boolean;
  // onChange?: (arg0: ChangeEvent<HTMLInputElement>) => void;
};
export const SelectInput = ({
  defaultValue,
  isDisabled,
  icon,
  placeholder,
  className,
  registerOptions = { required: REQUIRED_MESSAGE },
  error,
  label,
  name,
  register,
  options = [],
  ...props
}: Props) => {
  return (
    <>
      <label
        className={twMerge(" text-brand_dark font-satoMiddle", className)}
        htmlFor={name}
      >
        {label}
      </label>
      <div className={cn("custom-select relative")}>
        <div className="absolute top-3 left-3 z-10 ">{icon}</div>
        <select
          defaultValue=""
          disabled={isDisabled}
          name="pets"
          id="pet-select"
          className={cn(
            "rounded-lg border-gray-200 h-12 w-full mt-1 text-brand_gray ",
            {
              "disabled:cursor-not-allowed": isDisabled,
              "pl-14 relative": icon,
            }
          )}
          {...props}
          {...register?.(name, registerOptions)}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((option, index) => {
            return (
              <option key={index} value={option.value}>
                {option.title ? option.title : option.value}
              </option>
            );
          })}
        </select>
      </div>
      {<p className="mb-6 text-xs text-red-500 h-1 pl-1">{error?.message}</p>}
    </>
  );
};
