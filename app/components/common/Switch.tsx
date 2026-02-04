import {
  forwardRef,
  type ReactNode,
  useEffect,
  useState,
  type InputHTMLAttributes,
} from "react";
import { cn } from "~/utils/cn";
import { motion } from "motion/react";

type RegisterResult = {
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  ref?: React.Ref<HTMLInputElement>;
  name?: string;
};

type SwitchProps = {
  icon?: ReactNode;
  subtitle?: string;
  onChange?: (checked: boolean) => void;
  registerOptions?: { required: boolean };
  register?: (name: string, options: Record<string, string | boolean>) => RegisterResult;
  setValue?: (name: string, value: boolean) => void;
  className?: string;
  containerClassName?: string;
  backgroundColor?: string;
  label?: string;
  defaultChecked?: boolean;
  name: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "onChange">;

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  (
    {
      label,
      backgroundColor,
      className,
      containerClassName,
      setValue,
      defaultChecked = false,
      name,
      register,
      registerOptions = { required: true },
      onChange,
      subtitle,
      icon,
      ...props
    },
    ref
  ) => {
    // const ref = useRef<HTMLInputElement>(null);
    const [checked, set] = useState(defaultChecked);
    useEffect(() => {
      onChange?.(checked);
    }, [checked]);
    return (
      <>
        <label
          className={cn(
            "flex items-center gap-4 justify-between",
            "cursor-pointer",
            containerClassName
          )}
        >
          <div className="grid">
            <div className="flex gap-1 items-center">
              <span>{icon}</span>
              <span>{label}</span>
            </div>
            <span className="text-xs text-gray-500">{subtitle}</span>
          </div>
          <input
            type="checkbox"
            className="hidden"
            {...props}
            {...register?.(name, registerOptions)}
            onChange={(event) => set(event.currentTarget.checked)}
            checked={checked}
          />
          {/* Container */}
          <div
            className={cn(
              "bg-brand_switch_inactive rounded-full w-8 h-5 p-1 flex transition-all",
              {
                "justify-end bg-brand_blue": checked,
                className,
              }
            )}
            style={{
              backgroundColor: checked ? backgroundColor : undefined,
            }}
          >
            {/* Circle */}
            <motion.div
              transition={{ type: "spring", bounce: 0.6, duration: 0.3 }}
              layout
              className="bg-white h-full w-3 rounded-full"
            />
          </div>
        </label>
      </>
    );
  }
);

Switch.displayName = "Switch";
