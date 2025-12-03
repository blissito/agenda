import { type ReactNode } from "react";
import { twMerge } from "tailwind-merge";

export const CheckInput = ({
  icon,
  value,
  register,
  registerOptions,
  name,
  ...props
}: {
  icon: ReactNode;
  value?: string;
  name: string;
  register?: any;
  registerOptions?: unknown;
  [x: string]: unknown;
}) => {
  return (
    <label
      // eslint-disable-next-line jsx-a11y/no-noninteractive-element-to-interactive-role
      role="button"
      className={twMerge(
        "py-3 px-4 border bg-transparent rounded-lg text-neutral-600",
        "flex items-center gap-4 capitalize",
        "checked:border-brand_blue checked:border"
      )}
    >
      <span className="text-neutral-600">{icon}</span>
      <span>{value}</span>
      <input
        {...props}
        value={value}
        type="checkbox"
        {...register?.(name, registerOptions)}
      />
    </label>
  );
};
