import type { FieldError, FieldValues, UseFormRegister } from "react-hook-form";
import { twMerge } from "tailwind-merge";
import { REQUIRED_MESSAGE } from "~/routes/signup.$stepSlug";

export type Option = {
  value: string;
  title?: string;
};

type Props = {
  name: string;
  register?: UseFormRegister<FieldValues> | any;
  error?: FieldError;
  label?: string;
  className?: string;
  registerOptions?: { required: string | boolean };
  placeholder?: string;
  options: Option[];
  // onChange?: (arg0: ChangeEvent<HTMLInputElement>) => void;
};
export const SelectInput = ({
  placeholder,
  className,
  registerOptions = { required: REQUIRED_MESSAGE },
  error,
  label,
  name,
  register,
  options,
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
      <div style={{ width: "200px" }} className="custom-select">
        <select
          defaultValue=""
          name="pets"
          id="pet-select"
          className="rounded-lg border-gray-200 h-12 w-full mt-1 text-brand_gray "
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
