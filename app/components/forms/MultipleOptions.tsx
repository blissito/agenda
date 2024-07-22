import { ReactNode, useState } from "react";
import { twMerge } from "tailwind-merge";
import { motion } from "framer-motion";
import { FieldError, FieldValues, UseFormRegister } from "react-hook-form";

export const MultipleOptions = ({
  defaultValue = "Solo yo",
  options,
  name,
  label,
  error,
  renderFunction = (arg0) => arg0,
  registerOptions = { required: REQUIRED_MESSAGE },
  register = () => undefined,
}: {
  defaultValue?: string | null;
  error?: FieldError;
  renderFunction?: (arg0: ReactNode) => ReactNode;
  name: string;
  label?: string;
  options: string[];
  registerOptions?: { required: string | boolean };
  register: UseFormRegister<FieldValues> | any;
}) => {
  // const inputRef = useRef<HTMLInputElement>(null);
  const [current, set] = useState<null | string>(defaultValue);

  return (
    <>
      <p className="mb-1">{label}</p>
      <div
        className={twMerge(
          "grid grid-cols-3 gap-1",

          !!error && "border-red-500 border rounded-2xl p-1 transition-all"
        )}
        style={{ gridTemplateRows: "50px 50px" }}
      >
        {options.map((option) => {
          return renderFunction(
            <Option
              key={option}
              name={name}
              option={option}
              isCurrent={option === current}
              onClick={() => set(option)}
              register={register}
              registerOptions={registerOptions}
            />
          );
        })}
      </div>
      <p className="h-1 text-red-500 text-xs pl-1 my-1">{error?.message}</p>
    </>
  );
};

export const Option = ({
  name,
  option,
  onClick,
  isCurrent,
  registerOptions = { required: REQUIRED_MESSAGE },
  register = () => undefined,
  ...props
}: {
  name: string;
  option: string;
  onClick?: () => void;
  isCurrent?: boolean;
  [x: string]: unknown;
  register: UseFormRegister<FieldValues> | any;
  registerOptions?: { required: string | boolean };
}) => {
  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events
    <label
      onClick={onClick}
      // eslint-disable-next-line jsx-a11y/no-noninteractive-element-to-interactive-role
      role="button"
      // Im doing this because of the ability of the label of activate the radio on click
      htmlFor={option}
      className={twMerge(
        "relative",
        "flex items-center gap-4",
        "py-2 rounded-lg px-4 border border-gray-100"
        // "checked:border-blue-600"
        //   "overflow-hidden"
      )}
      key={option}
    >
      {isCurrent ? (
        <motion.div
          transition={{ type: "spring" }}
          layoutId="highlighter"
          className={twMerge(
            "rounded-lg absolute inset-0 bg-brand_blue/10 border border-brand_blue"
          )}
        />
      ) : null}
      <input
        value={option}
        // ref={inputRef}
        type="radio"
        id={option}
        name={name}
        className="peer opacity-0"
        {...props}
        {...register(name, registerOptions)}
      />
      <span className="relative z-10">{option}</span>
    </label>
  );
};
