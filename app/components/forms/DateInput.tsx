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
          "disabled:bg-brand_stroke disabled:cursor-not-allowed"
        )}
        {...register?.(name, {
          onChange(event) {
            if (type !== "time") return;
            // console.log("origin value", event.target.value);
            onChange?.(
              Number(event.target.value.split(":")[0]),
              Number(event.target.value.split(":")[1])
            );
          },
        })}
        // !!error && "border-red-500",
        // icon && "pl-12" // @TODO: does textarea needs this?)}
      />
    </label>
  );
};
