
import { twMerge } from "tailwind-merge";
import { motion } from "motion/react";
import {
  type FieldError,
  type FieldValues,
  type UseFormRegister,
} from "react-hook-form";
import { BasicInput } from "./BasicInput";
import { type ReactNode, useState, cloneElement, isValidElement } from "react";


const REQUIRED_MESSAGE = "Este campos es requerido";

export const MultipleOptions = ({
  className,
  defaultValue = "Solo yo",
  options = [],
  name,
  label,
  error,
  renderFunction,
  registerOptions = { required: REQUIRED_MESSAGE },
  register = () => undefined,
}: {
  name: string;
  options: string[];
  className?: string;
  defaultValue?: string | null;
  error?: FieldError;
  renderFunction?: (arg0: string, arg1: number) => ReactNode;
  label?: string;
  registerOptions?: { required: string | boolean };
  register?: UseFormRegister<FieldValues> | any;
}) => {
  const [current, set] = useState<null | string>(defaultValue);

  if (renderFunction) {
    return (
      <>
        <p className="mb-1">{label}</p>
        <div
          className={twMerge(
          
            "w-full overflow-visible",
            !!error && "border-red-500 border rounded-2xl p-1 transition-all",
            className
          )}
          style={{ gridTemplateColumns: "1fr 1fr" }}
        >
          {options.map(renderFunction)}
        </div>
      </>
    );
  }
  return (
    <>
      <p className="mb-1">{label}</p>{" "}
      <motion.div
        transition={{
          type: "spring",
          bounce: 0,
          duration: 0.7,
          delayChildren: 0.3,
          staggerChildren: 0.05,
        }}
        className={twMerge(
          "grid grid-cols-3 gap-1 ",
          !!error && "border-red-500 border rounded-2xl p-1 transition-all",
          className
        )}
        style={{ gridTemplateRows: "50px 50px" }}
      >
        {options.map((option, index) => {
          return (
            <Option
              onChange={(val) => set(val)}
              label={option}
              index={index}
              key={option}
              name={name}
              isCurrent={option === current}
              onClick={() => set(option)}
              register={register}
              registerOptions={registerOptions}
            />
          );
        })}
      </motion.div>
      <p className="h-1 text-red-500 text-xs pl-1 mb-10 ">{error?.message}</p>
    </>
  );
};

export const Option = ({
  capitalize,
  transition,
  index,
  name,
  label,
  onClick,
  isCurrent,
  registerOptions = { required: REQUIRED_MESSAGE },
  register = () => undefined,
  icon,
  ...props
}: {
  index?: number;
  capitalize?: boolean;
  transition?: any;
  icon?: ReactNode;
  name: string;
  label: string;
  onClick?: () => void;
  isCurrent?: boolean;
  register?: UseFormRegister<FieldValues> | any;
  registerOptions?: { required: string | boolean };
  [x: string]: unknown;
}) => {
  const ACTIVE = "#5158F6";

  const paintedIcon = (() => {
    if (!icon) return null;

    // Si es un componente React (SVG), lo clonamos para forzar fill/stroke
    if (isValidElement(icon)) {
      return cloneElement(icon as any, {
        fill: ACTIVE,
        stroke: ACTIVE,
        color: ACTIVE,
      });
    }

    // Si NO es elemento válido (string, etc), lo dejamos igual
    return icon;
  })();

  return (
    <button
      type="button"
      onClick={onClick}
      className={twMerge(
        "active:scale-95 active:shadow-inner",
        "relative",
        "inline-flex items-center gap-3",
        "rounded-full border bg-white",
        "px-4 py-2.5 min-h-[44px]",
        "w-auto max-w-none overflow-visible",
        "hover:bg-neutral-50",
        isCurrent ? "border-transparent" : "border-gray-200"
      )}
    >
      {isCurrent ? (
        <motion.div
          transition={transition ? transition : { type: "spring" }}
          layoutId="highlighter"
          className={twMerge(
            "rounded-full absolute inset-0 z-10",
            "bg-[#5158F6]/10 border border-[#5158F6]"
          )}
        />
      ) : null}
      {icon ? (
        <span className="relative z-10 shrink-0">
          {isCurrent ? paintedIcon : icon}
        </span>
      ) : null}
      <span
        className={twMerge(
          "relative z-10 whitespace-nowrap leading-tight",
          isCurrent ? "text-[#5158F6]" : "text-brand_gray",
          capitalize ? "capitalize" : null
        )}
      >
        {label}
      </span>
    </button>
  );
};


export const Otro = ({
  className,
  name,
  label,
  onClick,
  register,
  isActive,
  onCancel,
}: {
  className?: string;
  onCancel?: () => void;
  label?: string;
  name: string;
  isActive?: boolean;
  onClick?: () => void;
  register?: any;
}) => {
  if (isActive) {
    return (
      <motion.div
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={twMerge(className)}
      >
        <div className="w-full">
          <BasicInput
            className="w-full "
            label={label}
            placeholder="¿Qué tipo de negocio tienes?"
            name={name}
            register={register}
          />
        </div>
        <button onClick={onCancel} className="active:opacity-50">
          Cancelar
        </button>
      </motion.div>
    );
  }
  return (
    <>
      <button onClick={onClick} type="button">
        <h2 className="shadow rounded-full h-[44px] flex justify-start px-4 items-center text-brand_gray border border-gray-200 bg-white hover:bg-neutral-50">
          Otro
        </h2>
      </button>
    </>
  );
};
