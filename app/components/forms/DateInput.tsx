import type { FieldError } from "react-hook-form";
import { cn } from "~/utils/cn";

export const DateInput = ({
  label,
  name,
  onChange,
  register,
  type = "date",
  error,
  registerOptions = { required: true },
  ...props
}: {
  error?: FieldError;
  type?: "time" | "date";
  register?: any;
  onChange?: (arg0: number, arg1: number) => void;
  label?: string;
  name: string;
  [x: string]: unknown;
}) => {
  return (
    <label>
      {label && <span>{label}</span>}
      <input
        name={name}
        type={type}
        {...props}
        className={cn(
          "placeholder:text-brand_iron text-brand_gray font-satoshi",
          "focus:border-brand_blue",
          "rounded-xl border-gray-200 h-12 w-full mt-1 ",
          "disabled:bg-brand_stroke disabled:cursor-not-allowed",
          {
            "ring-2 ring-red-500": error,
          }
        )}
        {...register?.(name, registerOptions)}
        // value="2024-12-12"
      />
    </label>
  );
};
