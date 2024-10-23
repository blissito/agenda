import { motion } from "framer-motion";
import { ReactNode } from "react";
import { cn } from "~/utils/cd";
import { useMarquee } from "../hooks/useMarquee";

export const Marquee = ({
  children,
  reversed,
  className = "bg-gray-800 ",
}: {
  className?: string;
  reversed?: boolean;
  children?: ReactNode;
}) => {
  const { x, ref } = useMarquee(reversed);

  return (
    <>
      <article className={cn("flex justify-center items-center", className)}>
        <div className="h-20 flex items-center text-gray-100 text-6xl font-extrabold overflow-hidden">
          <motion.div style={{ x }} className="whitespace-nowrap" ref={ref}>
            {children} {children}
          </motion.div>
        </div>
      </article>
    </>
  );
};
