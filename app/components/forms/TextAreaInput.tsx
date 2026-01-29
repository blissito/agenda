// @ts-nocheck - TODO: Arreglar tipos cuando se edite este archivo
import type { FieldValues, UseFormRegister } from "react-hook-form";
import { twMerge } from "tailwind-merge";
import { REQUIRED_MESSAGE } from "~/routes/login/signup.$stepSlug";

type Props = {
  name: string;
  register?: UseFormRegister<FieldValues> | any;
  error?: FieldError;
  label?: string;
  className?: string;
  registerOptions?: { required: string | boolean };
  placeholder?: string;
  // onChange?: (arg0: ChangeEvent<HTMLInputElement>) => void;
};
export const TextAreaInput = ({
  placeholder,
  className,
  registerOptions = { required: REQUIRED_MESSAGE },
  error,
  label,
  name,
  register,
  ...props
}: Props) => {
  return (
    <div>
      <label
        className={twMerge(" text-brand_gray mb-1 font-satoMedium", className)}
        htmlFor={name}
      >
        {label}
      </label>
      <br />
      <textarea
        placeholder={placeholder}
        className={twMerge(
          "w-full",
          "focus:border-brand_blue h-20 font-satoMedium text-brand_dark",
          "rounded-xl border-gray-200 h-20 placeholder:text-brand_iron",
          !!error && "border-red-500"
        )}
        {...props}
        {...register?.(name, registerOptions)}
        // onChange={onChange}
      />

      {<p className="mb-6 text-xs text-red-500 h-1 pl-1">{error?.message}</p>}
    </div>
  );
};
