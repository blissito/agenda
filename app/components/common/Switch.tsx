import { useEffect, useMemo, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import { cn } from "~/utils/cd";
import { motion } from "framer-motion";

export const Switch = ({
  label,
  defaultChecked,
  backgroundColor,
  className,
  onChange,
}: {
  onChange?: (arg0: boolean) => void;
  className?: string;
  backgroundColor?: string;
  defaultChecked?: boolean;
  label?: string;
}) => {
  const ref = useRef<HTMLInputElement>(null);
  const [checked, set] = useState(!!defaultChecked);

  useEffect(() => {
    if (ref.current) ref.current.checked = checked;
    onChange?.(checked);
  }, [checked]);

  return (
    <>
      <button
        className={cn("flex items-center gap-4")}
        onClick={() => set((v) => !v)}
      >
        <span>{label}</span>
        <input type="checkbox" ref={ref} className="hidden" />
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
      </button>
    </>
  );
};
