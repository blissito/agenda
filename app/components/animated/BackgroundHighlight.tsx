import {
  motion,
  useMotionTemplate,
  useSpring,
  useTransform,
} from "framer-motion";
import { ReactNode } from "react";
import { cn } from "~/utils/cd";
import { useMousePosition } from "../hooks/useMousePosition";
import { useTimeout } from "../hooks/useTimeout";

export const BackgroundHighlight = ({
  className,
  children,
}: {
  children?: ReactNode;
  className?: string;
}) => {
  const { handleMouseMove, mouseX, targetWidth, target } = useMousePosition();
  const { placeTimeout, removeTimeout } = useTimeout(1000);

  const springX = useSpring(mouseX, { bounce: 0.2 });
  const size = useTransform(springX, [0, targetWidth], [0, 110]);
  const backgroundSize = useMotionTemplate`${size}% 100%`;

  const handleMouseLeave = () => {
    placeTimeout(() => {
      mouseX.set(targetWidth);
    });
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={removeTimeout}
    >
      <motion.span
        ref={target}
        style={{
          backgroundRepeat: "no-repeat",
          backgroundSize,
        }}
        className={cn(
          "rounded-xl p-1 font-bold cursor-ew-resize bg-gradient-to-r from-purple-500 to-pink-500",
          className
        )}
        initial={{ backgroundSize: "0% 100%" }}
        animate={{ backgroundSize: "100% 100%" }}
        transition={{ duration: 2, delay: 1, ease: "linear" }}
      >
        {children}
      </motion.span>
    </div>
  );
};
