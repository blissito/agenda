import { cn } from "~/utils/cn";

export const DateInput = ({
  label,
  name,
  onChange,
  register,
  type = "date",
  ...props
}: {
  type?: "time" | "date";
  register?: (arg0: string) => any;
  onChange?: (arg0: string) => void;
  label?: string;
  name: string;
  [x: string]: unknown;
}) => {
  return (
    <label>
      {label && <span>{label}</span>}
      <input
        onChange={(event) =>
          onChange?.(new Date(event.target.value).toISOString())
        }
        name={name}
        type={type}
        {...props}
        className={cn(
          "placeholder:text-brand_iron text-brand_gray font-satoshi",
          "focus:border-brand_blue",
          "rounded-xl border-gray-200 h-12 w-full mt-1 ",
          "disabled:bg-brand_stroke disabled:cursor-not-allowed"
        )}
        {...register?.(name)}
        // !!error && "border-red-500",
        // icon && "pl-12" // @TODO: does textarea needs this?)}
      />
    </label>
  );
};
