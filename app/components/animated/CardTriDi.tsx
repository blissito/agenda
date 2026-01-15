// @ts-nocheck - TODO: Arreglar tipos cuando se edite este archivo
import { useSpring, motion } from "motion/react";
import { type MouseEvent, type ReactNode } from "react";
import { useTimeout } from "../hooks/useTimeout";

export const CardTriDi = ({ children }: { children?: ReactNode }) => {
  const rotateX = useSpring(0);
  const rotateY = useSpring(0);
  const { placeTimeout } = useTimeout(2000);

  const handleMouseMove = (event: MouseEvent<HTMLElement>) => {
    const { clientX, clientY, currentTarget } = event;
    const { width, height, left, top } = currentTarget.getBoundingClientRect();
    const x = (clientX - left - width / 2) * 0.1; // 🪄✨
    const y = (clientY - top - height / 2) * 0.1;
    rotateX.set(-y); // invertimos
    rotateY.set(x);
  };

  const handleMouseLeave = () => {
    placeTimeout(() => {
      rotateX.set(0);
      rotateY.set(0);
    });
  };

  return (
    <section
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      style={{
        transformStyle: "preserve-3d",
        perspective: 600,
        overflow: "hidden",
        padding: 40,
      }}
    >
      {/* card */}
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        className="border rounded-xl mx-auto max-w-md border-black p-6 flex flex-col gap-6"
      >
        <motion.div
          style={{
            z: 50,
          }}
        >
          {children[0]}
        </motion.div>
        <motion.div
          style={{
            z: 70,
          }}
        >
          {children[1]}
        </motion.div>
      </motion.div>
    </section>
  );
};
