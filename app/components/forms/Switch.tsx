import { ReactNode, useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";
import { motion } from "framer-motion";
import { FieldValues, UseFormRegister } from "react-hook-form";

export const Switch = ({
  label,
  name,
  defaultChecked = false,
  register,
  registerOptions = { required: true },
  getValues,
}: {
  getValues?: () => void;
  name: string;
  value?: string;
  register: UseFormRegister<FieldValues>;
  registerOptions?: { required?: string | boolean };
  defaultChecked?: boolean;
  onChange?: (arg0: HTMLInputElement) => void;
  label?: ReactNode;
}) => {
  const [checked, set] = useState(defaultChecked);
  const { ...props } = register(name, registerOptions);

  return (
    <>
      <label
        htmlFor={name}
        className={twMerge("flex justify-between cursor-pointer")}
      >
        {label && <span className="capitalize">{label}</span>}
        <div
          className={twMerge(
            "bg-gray-300 h-5 w-12 rounded-full flex flex-col justify-center",
            checked && "items-end bg-brand_blue/50"
          )}
        >
          <motion.input
            checked={checked}
            transition={{ type: "spring", duration: 0.25, bounce: 0.5 }}
            initial={{ x: 15 }}
            animate={{ x: 0 }}
            layout
            type="checkbox"
            id={name}
            className={twMerge(
              "text-brand_blue pointer-events-none border-none",
              "bg-gray-400 h-6 w-6 rounded-full"
              // "checked:self-end"
            )}
            {...props}
            // in order to mantin a local state
            onChange={(e) => {
              props.onChange(e);
              set(e.target.checked);
            }}
          />
        </div>
      </label>
    </>
  );
};
