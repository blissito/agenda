import { type ReactNode, useState } from "react";
import { twMerge } from "tailwind-merge";
import { motion } from "motion/react";
import {
  type FieldError,
  type FieldValues,
  type UseFormRegister,
} from "react-hook-form";
import { BasicInput } from "./BasicInput";

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

  // ✅ Cuando usas renderFunction (como en BussinesTypeForm)
  if (renderFunction) {
    return (
      <>
        <p className="mb-1">{label}</p>
        <div
          className={twMerge(
            // ✅ Solo UI: que no recorte
            "w-full overflow-visible",
            !!error && "border-red-500 border rounded-2xl p-1 transition-all",
            className
          )}
          // (esto no estorba si el contenedor es flex; se ignora)
          style={{ gridTemplateColumns: "1fr 1fr" }}
        >
          {options.map(renderFunction)}
        </div>
      </>
    );
  }

  // ✅ Caso "normal" (grid 3 columnas)
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
          "grid grid-cols-3 gap-1",
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
  return (
    <button
      type="button"
      onClick={onClick}
      className={twMerge(
        "active:scale-95 active:shadow-inner",
        "relative",
        // ✅ SOLO UI: pill + spacing como tu imagen 2
        "inline-flex items-center gap-3",
        "rounded-full border border-gray-200 bg-white",
        "px-4 py-2.5 min-h-[44px]",
        // ✅ evitar recortes
        "w-auto max-w-none overflow-visible",
        // ✅ hover sutil
        "hover:bg-neutral-50"
      )}
    >
      {isCurrent ? (
        <motion.div
          transition={transition ? transition : { type: "spring" }}
          layoutId="highlighter"
          className={twMerge(
            // ✅ SOLO UI: highlighter tipo pill
            "rounded-full absolute inset-0 bg-brand_blue/10 border border-brand_blue z-10"
          )}
        />
      ) : null}

      {/* ✅ icono: que no se corte */}
      {icon ? <span className="relative z-10 shrink-0">{icon}</span> : null}

      {/* ✅ texto: no truncate */}
      <span
        className={twMerge(
          "relative z-10 text-brand_gray",
          "whitespace-nowrap leading-tight",
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
