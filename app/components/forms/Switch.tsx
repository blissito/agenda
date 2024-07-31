import { ChangeEvent, ReactNode, useEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import { motion } from "framer-motion";
import { FieldValues, UseFormRegister } from "react-hook-form";

export const Switch = ({
  value,
  label,
  name,
  onChange,
  defaultChecked,
  register,
  registerOptions,
}: {
  name: string;
  value?: string;
  register?: UseFormRegister<FieldValues>;
  registerOptions?: { required?: string | boolean };
  defaultChecked?: boolean;
  onChange?: (arg0: HTMLInputElement) => void;
  label?: ReactNode;
}) => {
  const [isActive, set] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const cb = (e: ChangeEvent<HTMLInputElement>) => {
      set(e.target?.checked);
    };
    inputRef.current?.addEventListener("change", cb);
    const forListener = inputRef.current;
    return () => forListener?.removeEventListener("change", cb);
  }, []);

  useEffect(() => {
    set(defaultChecked);
  }, [defaultChecked]);

  return (
    <>
      <label
        htmlFor={value}
        className={twMerge("flex justify-between items-center cursor-pointer")}
      >
        <span className="capitalize">{label || value}</span>
        <div
          className={twMerge(
            "bg-gray-300 h-5 w-12 rounded-full flex flex-col justify-center",
            isActive && "items-end bg-brand_blue/50"
          )}
        >
          <motion.input
            defaultChecked={defaultChecked}
            transition={{ type: "spring", duration: 0.25, bounce: 0.5 }}
            onChange={(e) => onChange?.(e.target as HTMLInputElement)}
            value={value}
            ref={inputRef}
            initial={{ x: 15 }}
            animate={{ x: 0 }}
            layout
            type="checkbox"
            id={value}
            name={name}
            className={twMerge(
              "text-brand_blue pointer-events-none border-none",
              "bg-gray-400 h-6 w-6 rounded-full"
            )}
            {...register?.(name, registerOptions)}
          />
        </div>
      </label>
    </>
  );
};
