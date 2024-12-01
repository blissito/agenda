import { forwardRef, useEffect, useState } from "react";
import { cn } from "~/utils/cn";
import { motion } from "framer-motion";

export const Switch = forwardRef(
  (
    {
      label,
      backgroundColor,
      className,
      setValue,
      defaultChecked = false,
      name,
      ...props
    }: {
      setValue?: (arg0: string, arg1: boolean) => void; // @TODO: fix
      className?: string;
      backgroundColor?: string;
      label?: string;
      defaultChecked?: boolean;
      name?: string;
    },
    ref // coming from register
  ) => {
    // const ref = useRef<HTMLInputElement>(null);
    const [checked, set] = useState(defaultChecked);

    const handleClick = () => {
      set((s) => !s);
      setValue?.(name, !checked);
    };

    useEffect(() => {
      setValue?.(name, defaultChecked);
      set(defaultChecked);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [defaultChecked]);

    return (
      <>
        <button
          type="button"
          className={cn("flex items-center gap-4 justify-between")}
          onClick={handleClick}
        >
          <span>{label}</span>
          <input type="checkbox" className="hidden" {...props} ref={ref} />
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
  }
);

Switch.displayName = "Switch";
