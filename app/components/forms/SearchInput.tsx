import type { ChangeEvent, ReactNode } from "react";
import type { FieldError, FieldValues, UseFormRegister } from "react-hook-form";
import { twMerge } from "tailwind-merge";
import { REQUIRED_MESSAGE } from "~/routes/login/signup.$stepSlug";

type Props = {
  name: string;
  register?: UseFormRegister<FieldValues> | any;
  error?: FieldError;
  label?: ReactNode;
  labelClassName?: string;
  inputClassName?: string;
  registerOptions?: { required: string | boolean };
  placeholder?: string;
  as?: "textarea";
  type?: "text" | "number" | "email" | "date" | "search";
  isDisabled?: boolean;
  containerClassName?: string;
  icon?: ReactNode;
  onFocus?: () => void;
  onBlur?: () => void;
  onChange?: (evt: ChangeEvent<HTMLInputElement>) => void;
  defaultValue?: string | number;
};

export const SearchInput = ({
  defaultValue,
  inputClassName,
  icon = null,
  isDisabled,
  placeholder,
  containerClassName,
  registerOptions = { required: REQUIRED_MESSAGE },
  error,
  label,
  labelClassName,
  name,
  register,
  as,
  type,
  onFocus,
  onBlur,
  onChange,
  ...props
}: Props) => {
  return (
    <>
      <div className={twMerge("w-full relative", containerClassName)}>
        <span className="absolute bottom-[25%] left-4 text-gray-500">
          {icon}
        </span>
        <label
          className={twMerge(" text-brand_dark font-satoMiddle", labelClassName)}
          htmlFor={name}
        >
          {label}
        </label>
        <input
          defaultValue={defaultValue}
          onBlur={onBlur}
          onFocus={onFocus}
          onChange={onChange}
          name={name}
          disabled={isDisabled}
          type={type}
          placeholder={placeholder}
          className={twMerge(
            "placeholder:text-brand_iron text-brand_gray font-satoshi text-xl",
            "focus:border-brand_blue",
            "rounded-full border-none h-12 w-full",
            "disabled:bg-brand_stroke disabled:cursor-not-allowed",
            !!error && "border-red-500",
            icon && "pl-12",
            inputClassName
          )}
          {...props}
          {...register?.(name, registerOptions)}
        />
        <p className="text-xs text-red-500 h-1 pl-1">{error?.message}</p>
      </div>
    </>
  );
};
