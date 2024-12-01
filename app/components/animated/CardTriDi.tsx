import { Children, MouseEvent, ReactNode, useRef, useState } from "react";
import { motion, useSpring } from "framer-motion";
import { cn } from "~/utils/cn";

export const CardTriDi = ({ children }: { children?: ReactNode }) => {
  const rotateY = useSpring(0);
  const rotateX = useSpring(0);
  const translateZ = useSpring(0, { bounce: 0 });
  const translateZ2 = useSpring(0, { bounce: 0 });
  const scale = useSpring(1);
  //
  const [hovered, setHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    setHovered(true);
    translateZ.set(100);
    translateZ2.set(70);
    scale.set(0.95);
  };

  const handleMouseLeave = () => {
    setHovered(false);
    rotateX.set(0);
    rotateY.set(0);
    translateZ.set(0);
    translateZ2.set(0);
    scale.set(1);
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!hovered || !containerRef.current) return;
    const { left, top, width, height } =
      containerRef.current.getBoundingClientRect();
    const x = (e.clientX - left - width / 2) / 6;
    const y = (e.clientY - top - height / 2) / 6;
    rotateX.set(-y);
    rotateY.set(x);
  };
  const nodes = Children.toArray(children);

  return (
    <motion.article
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "rounded-xl w-[420px] relative z-0 shadow-xl bg-white p-6",
        hovered && "shadow-lg"
      )}
      style={{
        rotateY,
        rotateX,
        scale,
        transformStyle: "preserve-3d",
        perspective: "1000px",
      }}
    >
      <motion.div
        style={{
          translateZ,
        }}
        className={cn("uppercase font-thin font-sans mb-6")}
      >
        {nodes[0]}
      </motion.div>
      <motion.div
        style={{
          translateZ: translateZ2,
        }}
      >
        {nodes[1]}
      </motion.div>
    </motion.article>
  );
};
