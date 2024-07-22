import { useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import { motion } from "framer-motion";

export const MultipleOptions = ({
  options,
  name,
  label,
}: {
  name: string;
  label?: string;
  options: string[];
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [current, set] = useState<null | string>("Solo yo");

  return (
    <>
      <p className="mb-1">{label}</p>
      <div
        className="grid grid-cols-3 gap-1"
        style={{ gridTemplateRows: "50px 50px" }}
      >
        {options.map((option) => (
          // eslint-disable-next-line jsx-a11y/click-events-have-key-events
          <label
            onClick={() => set(option)}
            // eslint-disable-next-line jsx-a11y/no-noninteractive-element-to-interactive-role
            role="button"
            // Im doing this because of the ability of the label of activate the radio on click
            htmlFor={option}
            className={twMerge(
              "relative",
              "flex items-center gap-4",
              "py-2 rounded-lg px-4 border border-gray-100",
              "checked:border-blue-600"
              //   "overflow-hidden"
            )}
            key={option}
          >
            {current === option ? (
              <motion.div
                transition={{ type: "spring" }}
                layoutId="highlighter"
                className={twMerge(
                  "rounded-lg absolute inset-0 bg-brand_blue/10"
                )}
              />
            ) : null}
            <input
              value={option}
              ref={inputRef}
              type="radio"
              id={option}
              name={name}
              className="peer hidden"
            />
            <span className="relative z-10">{option}</span>
          </label>
        ))}
      </div>
    </>
  );
};
