import type { FieldError, FieldValues, UseFormRegister } from "react-hook-form";
import { twMerge } from "tailwind-merge";
import { REQUIRED_MESSAGE } from "~/routes/signup.$stepSlug";

type Props = {
  name: string;
  register?: UseFormRegister<FieldValues> | any;
  error?: FieldError;
  label?: string;
  className?: string;
  registerOptions?: { required: string | boolean };
  placeholder?: string;
  as?: "textarea";
};
export const BasicInput = ({
  placeholder,
  className,
  registerOptions = { required: REQUIRED_MESSAGE },
  error,
  label,
  name,
  register,
  as,
  ...props
}: Props) => {
  return (
    <div className="grid">
      <label
        className={twMerge(" text-neutral-950 mb-1 font-satoMiddle", className)}
        htmlFor={name}
      >
        {label}
      </label>
      {as === "textarea" ? (
        <textarea
          placeholder={placeholder}
          className={twMerge(
            "min-h-20",
            "placeholder-gray-300",
            "focus:border-brand_blue",
            "rounded-xl border-gray-200 h-12 w-full mt-1",
            !!error && "border-red-500"
          )}
          {...props}
          {...register?.(name, registerOptions)}
        />
      ) : (
        <input
          placeholder={placeholder}
          className={twMerge(
            "placeholder-gray-300",
            "focus:border-brand_blue",
            "rounded-xl border-gray-200 h-12 w-full mt-1",
            !!error && "border-red-500"
          )}
          {...props}
          {...register?.(name, registerOptions)}
          // onChange={onChange}
        />
      )}
      {<p className="mb-6 text-xs text-red-500 h-1 pl-1">{error?.message}</p>}
    </div>
  );
};

BasicInput.displayName = "BasicInput";
